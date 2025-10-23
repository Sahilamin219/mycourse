import { useState, useEffect } from 'react';
import { supabase } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyCallCount, setDailyCallCount] = useState(0);

  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubscription(data);
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: sessions, error: sessionError } = await supabase
        .from('debate_sessions_tracking')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_date', today);

      if (sessionError) throw sessionError;

      setDailyCallCount(sessions?.length || 0);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const isPremium = () => {
    if (!subscription) return false;
    if (subscription.plan_type !== 'premium') return false;
    if (subscription.status !== 'active') return false;
    if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
      return false;
    }
    return true;
  };

  const canMakeCall = () => {
    if (isPremium()) return true;
    return dailyCallCount < 2;
  };

  const trackDebateSession = async (topic: string, partnerId?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('debate_sessions_tracking')
        .insert({
          user_id: user.id,
          partner_id: partnerId || null,
          topic: topic,
          session_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      setDailyCallCount(prev => prev + 1);
      return data;
    } catch (error) {
      console.error('Error tracking session:', error);
      return null;
    }
  };

  const endDebateSession = async (sessionId: string, durationSeconds: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('debate_sessions_tracking')
        .update({
          duration_seconds: durationSeconds,
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  return {
    subscription,
    loading,
    isPremium: isPremium(),
    canMakeCall: canMakeCall(),
    dailyCallCount,
    trackDebateSession,
    endDebateSession,
    refetch: fetchSubscription,
  };
}
