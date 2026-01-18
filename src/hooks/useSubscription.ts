import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';

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
  const { user, accessToken } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [dailyCallCount, setDailyCallCount] = useState(0);

  useEffect(() => {
    if (user) {
      setSubscription({
        id: user.id,
        user_id: user.id,
        plan_type: user.subscription_tier === 'premium' ? 'premium' : 'free',
        status: user.subscription_status === 'active' ? 'active' : 'expired',
        start_date: user.created_at,
        end_date: null,
        auto_renew: false,
      });
    }
  }, [user]);

  const isPremium = () => {
    if (!user) return false;
    return user.subscription_tier === 'premium' && user.subscription_status === 'active';
  };

  const canMakeCall = () => {
    if (isPremium()) return true;
    return dailyCallCount < 2;
  };

  const trackDebateSession = async (topic: string, partnerId?: string) => {
    if (!user || !accessToken) return null;

    try {
      setDailyCallCount(prev => prev + 1);
      // Create a real debate session via API
      const session = await api.createDebateSession(
        accessToken,
        topic,
        'for' // Default stance, can be made configurable later
      );
      return session;
    } catch (error) {
      console.error('Failed to create debate session:', error);
      return null;
    }
  };

  const endDebateSession = async (sessionId: string, durationSeconds: number) => {
    if (!accessToken) return;
    
    try {
      await api.updateDebateSession(accessToken, sessionId, durationSeconds);
    } catch (error) {
      console.error('Error ending debate session:', error);
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
    refetch: () => {},
  };
}
