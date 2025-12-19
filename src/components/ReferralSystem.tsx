import React, { useState, useEffect } from 'react';
import { Gift, Copy, Users, Coins, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ReferralData {
  referral_code: string;
  total_referrals: number;
  total_coins_earned: number;
}

interface ReferralHistory {
  referred_user_id: string;
  username: string;
  email: string;
  coins_awarded: number;
  created_at: string;
}

export default function ReferralSystem() {
  const { user } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralHistory[]>([]);
  const [coins, setCoins] = useState(0);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchReferralData();
      fetchReferralHistory();
      fetchCoins();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referrals/my-code`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    }
  };

  const fetchReferralHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referrals/my-referrals`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReferralHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral history:', error);
    }
  };

  const fetchCoins = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referrals/coins`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCoins(data.coins);
      }
    } catch (error) {
      console.error('Failed to fetch coins:', error);
    }
  };

  const copyReferralLink = () => {
    if (referralData) {
      const link = `${window.location.origin}/?ref=${referralData.referral_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralCode = () => {
    if (referralData) {
      navigator.clipboard.writeText(referralData.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/referrals/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ referral_code: applyCode.toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        setApplyMessage('Referral code applied! Your friend earned 2,500 coins!');
        setApplyCode('');
      } else {
        setApplyMessage(data.detail || 'Failed to apply referral code');
      }
    } catch (error) {
      setApplyMessage('Failed to apply referral code');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Gift className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Referral Program</h2>
          <p className="text-slate-300">Please sign in to access your referral code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <Gift className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Refer Friends, Earn Coins!
          </h1>
          <p className="text-xl text-slate-300">
            Get 2,500 coins for every friend who joins
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
            <Coins className="w-12 h-12 mb-4 opacity-80" />
            <div className="text-3xl font-bold mb-2">{coins.toLocaleString()}</div>
            <div className="text-blue-100">Total Coins</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              {referralData?.total_referrals || 0}
            </div>
            <div className="text-slate-300">Total Referrals</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <Gift className="w-12 h-12 text-green-400 mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              {referralData?.total_coins_earned.toLocaleString() || 0}
            </div>
            <div className="text-slate-300">Coins from Referrals</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Referral Code</h2>

            {referralData && (
              <>
                <div className="bg-slate-900/50 rounded-xl p-6 mb-4 text-center">
                  <div className="text-4xl font-bold text-blue-400 tracking-wider mb-2">
                    {referralData.referral_code}
                  </div>
                  <div className="text-slate-400 text-sm">Share this code with friends</div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={copyReferralCode}
                    className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Code
                      </>
                    )}
                  </button>

                  <button
                    onClick={copyReferralLink}
                    className="w-full py-3 px-4 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition flex items-center justify-center gap-2"
                  >
                    <Copy className="w-5 h-5" />
                    Copy Referral Link
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <p className="text-blue-200 text-sm">
                    When someone signs up using your code, you'll instantly receive 2,500 coins!
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Have a Referral Code?</h2>

            <form onSubmit={applyReferralCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter Referral Code
                </label>
                <input
                  type="text"
                  value={applyCode}
                  onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/20 text-white text-center text-2xl tracking-wider font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC12XYZ"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 transition"
              >
                Apply Code
              </button>

              {applyMessage && (
                <div className={`p-4 rounded-lg ${
                  applyMessage.includes('applied')
                    ? 'bg-green-500/20 border border-green-500/30 text-green-200'
                    : 'bg-red-500/20 border border-red-500/30 text-red-200'
                }`}>
                  {applyMessage}
                </div>
              )}
            </form>

            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold text-white mb-2">How it works:</h3>
              <ol className="space-y-2 text-sm text-slate-300">
                <li>1. Get a referral code from a friend</li>
                <li>2. Enter it here to help them earn coins</li>
                <li>3. They receive 2,500 coins instantly!</li>
              </ol>
            </div>
          </div>
        </div>

        {referralHistory.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Referral History</h2>

            <div className="space-y-4">
              {referralHistory.map((referral, index) => (
                <div
                  key={referral.referred_user_id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {referral.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{referral.username}</div>
                      <div className="text-slate-400 text-sm">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">
                      +{referral.coins_awarded.toLocaleString()}
                    </div>
                    <div className="text-slate-400 text-sm">coins</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
