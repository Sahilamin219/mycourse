import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;

    if (path.includes('/create-order') && req.method === 'POST') {
      const { planType, amount } = await req.json();
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await supabase.from('payments').insert({
        user_id: user.id,
        amount: amount,
        currency: 'INR',
        razorpay_order_id: orderId,
        status: 'pending',
      });

      return new Response(JSON.stringify({
        orderId: orderId,
        amount: amount,
        currency: 'INR',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.includes('/verify-payment') && req.method === 'POST') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = await req.json();

      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', razorpay_order_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!payment) {
        return new Response(JSON.stringify({ error: 'Payment not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await supabase.from('payments').update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: 'completed',
        updated_at: new Date().toISOString(),
      }).eq('id', payment.id);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await supabase.from('subscriptions').update({ status: 'expired' })
        .eq('user_id', user.id).eq('status', 'active');

      const { data: newSubscription } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan_type: planType,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: false,
      }).select().single();

      await supabase.from('payments').update({ subscription_id: newSubscription.id }).eq('id', payment.id);

      return new Response(JSON.stringify({ success: true, subscription: newSubscription }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
