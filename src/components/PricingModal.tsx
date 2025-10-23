import { useState } from 'react';
import { X, Check, Shield, Loader, Lock, Tag, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth, supabase } from '../contexts/AuthContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PricingModal({ isOpen, onClose, onSuccess }: PricingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const { user } = useAuth();

  if (!isOpen) return null;

  const monthlyPrice = 999;
  const yearlyPrice = 9999;
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'HAPPY10') {
      setDiscountApplied(true);
      setDiscountError('');
    } else {
      setDiscountApplied(false);
      setDiscountError('Invalid discount code');
    }
  };

  const getDiscountedPrice = (price: number) => {
    if (discountApplied) {
      return Math.floor(price * 0.9);
    }
    return price;
  };

  const getDiscountAmount = (price: number) => {
    if (discountApplied) {
      return Math.floor(price * 0.1);
    }
    return 0;
  };

  const finalPrice = selectedPlan === 'monthly'
    ? getDiscountedPrice(monthlyPrice)
    : getDiscountedPrice(yearlyPrice);
  const discountAmount = selectedPlan === 'monthly'
    ? getDiscountAmount(monthlyPrice)
    : getDiscountAmount(yearlyPrice);

  const handlePremiumPurchase = async () => {
    if (!user) {
      setError('Please sign in to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const amount = finalPrice * 100;
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-payment/create-order`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: 'premium',
          amount: amount,
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const options = {
        key: 'rzp_test_placeholder',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'DebateHub Premium',
        description: selectedPlan === 'monthly' ? 'Premium Monthly Plan' : 'Premium Yearly Plan',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-payment/verify-payment`;

            const verifyResponse = await fetch(verifyUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType: 'premium',
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            alert('Welcome to Premium! Your account has been upgraded successfully.');
            onSuccess?.();
            onClose();
          } catch (err: any) {
            console.error('Verification error:', err);
            alert('Payment completed but verification failed. Please contact support.');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#10b981',
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
      };

      if (typeof window.Razorpay !== 'undefined') {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Unlimited video debates',
    'Real-time AI feedback',
    'Advanced speech analytics',
    'Session recordings',
    'Progress tracking',
    'Skill-based scoring',
    'Achievement system',
    'Global leaderboard',
    'Priority matching',
    'Download transcripts'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#001a1a] rounded-2xl shadow-2xl max-w-4xl w-full relative my-8 border border-emerald-500/20">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">Premium Membership</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upgrade to Premium
            </h2>
            <p className="text-xl text-gray-400">
              Unlock unlimited debates and AI-powered insights
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-8">
              {error}
            </div>
          )}

          <div className="flex justify-center mb-10">
            <div className="bg-white/5 backdrop-blur-sm p-1.5 rounded-xl inline-flex border border-white/10">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedPlan === 'monthly'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                {selectedPlan === 'yearly' && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    Save 17%
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-emerald-500/20 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-white mb-6">Premium Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Check className="text-emerald-400 flex-shrink-0" size={18} />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-80 flex-shrink-0">
                <div className="bg-[#002222] rounded-xl p-6 border border-emerald-500/30">
                  <div className="text-center mb-6">
                    {discountApplied ? (
                      <div>
                        <div className="text-2xl line-through text-gray-500 mb-1">
                          ₹{selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice}
                        </div>
                        <div className="text-5xl font-bold text-white mb-2">
                          ₹{finalPrice}
                        </div>
                      </div>
                    ) : (
                      <div className="text-5xl font-bold text-white mb-2">
                        ₹{selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice}
                      </div>
                    )}
                    <p className="text-gray-400">
                      {selectedPlan === 'monthly' ? 'per month' : 'per year'}
                    </p>
                    {selectedPlan === 'yearly' && !discountApplied && (
                      <p className="text-emerald-400 text-sm mt-2">
                        Save ₹{yearlySavings} compared to monthly
                      </p>
                    )}
                    {discountApplied && (
                      <div className="mt-3 inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                        <Tag size={14} />
                        <span>10% discount applied</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Discount code
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value);
                          setDiscountError('');
                          setDiscountApplied(false);
                        }}
                        placeholder="HAPPY10"
                        className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:border-emerald-500/50 focus:outline-none transition-all duration-300"
                        disabled={discountApplied}
                      />
                      {discountApplied ? (
                        <div className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
                          <CheckCircle size={18} className="text-emerald-400" />
                        </div>
                      ) : (
                        <button
                          onClick={applyDiscount}
                          disabled={!discountCode.trim()}
                          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 border border-white/20 hover:border-white/30 disabled:border-white/10 disabled:text-gray-600"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {discountError && (
                      <p className="text-red-400 text-xs mt-2">{discountError}</p>
                    )}
                    {discountApplied && (
                      <p className="text-emerald-400 text-xs mt-2 flex items-center space-x-1">
                        <CheckCircle size={12} />
                        <span>You save ₹{discountAmount}</span>
                      </p>
                    )}
                  </div>

                  {discountApplied && (
                    <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">₹{selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-emerald-400">Discount (10%)</span>
                        <span className="text-emerald-400">-₹{discountAmount}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">Total</span>
                          <span className="text-2xl font-bold text-white">₹{finalPrice}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePremiumPurchase}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Continue to Payment</span>
                    )}
                  </button>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
                      <Lock size={12} />
                      <span>Secure payment with Razorpay</span>
                    </div>
                    <div className="text-center text-gray-500 text-xs">
                      UPI • Cards • Net Banking • Wallets
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield size={16} className="text-emerald-400" />
              <span>7-day money-back guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock size={16} className="text-emerald-400" />
              <span>Bank-grade security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
