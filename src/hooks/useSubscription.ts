import { useState, useEffect } from 'react';
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
  const { user, token } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyCallCount, setDailyCallCount] = useState(0);

  const fetchSubscription = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/subscriptions?user_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        setSubscription(null);
      }

      // Fetch daily call count (mocked for now as backend endpoint for this specific stat might need adjustment)
      // We can add an endpoint for this or include it in user stats
      setDailyCallCount(0);

    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user, token]);

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
    if (!user || !token) return null;

    try {
      const response = await fetch('http://localhost:8000/api/subscriptions/track-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          partner_id: partnerId,
          topic: topic
        })
      });

      if (!response.ok) throw new Error('Failed to track session');

      const data = await response.json();
      setDailyCallCount(prev => prev + 1);
      return data;
    } catch (error) {
      console.error('Error tracking session:', error);
      return null;
    }
  };

  const endDebateSession = async (sessionId: string, durationSeconds: number) => {
    if (!user || !token) return;

    try {
      await fetch(`http://localhost:8000/api/debate-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          duration_seconds: durationSeconds,
          ended_at: new Date().toISOString(),
        })
      });
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
