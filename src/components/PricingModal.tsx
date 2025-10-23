import { useState } from 'react';
import { X, Check, Crown, Loader, Star, Zap, Trophy, Target, Brain, Users, Video, BarChart, BookOpen, Award, Tag, CheckCircle } from 'lucide-react';
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

            alert('🎉 Welcome to Premium! Your account has been upgraded successfully.');
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

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 rounded-3xl shadow-2xl max-w-7xl w-full p-8 md:p-12 relative my-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
          >
            <X size={28} />
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full mb-6 font-bold text-sm">
              <Star size={18} className="animate-pulse" />
              <span>LIMITED TIME OFFER - 50% OFF!</span>
              <Star size={18} className="animate-pulse" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Become a Debate Master
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of successful professionals who transformed their communication skills with our AI-powered platform
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-6 py-4 rounded-xl text-sm mb-8 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center mb-10">
            <div className="bg-gray-800/50 backdrop-blur-sm p-2 rounded-2xl inline-flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedPlan === 'monthly'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  SAVE ₹{yearlySavings}
                </span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-5xl font-black text-white mb-2">
                  ₹0
                </div>
                <p className="text-gray-400">Forever</p>
              </div>
              <ul className="space-y-4">
                {[
                  '2 debates per day',
                  'Basic video quality',
                  'Access to all topics',
                  'Limited to 15 min debates'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
                {[
                  'No AI feedback',
                  'No recordings',
                  'No achievements',
                  'No leaderboard access'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3 opacity-40">
                    <X className="text-gray-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-500 line-through">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 border-4 border-yellow-400 relative transform lg:scale-110 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center space-x-2 shadow-lg">
                  <Crown size={18} />
                  <span>MOST POPULAR</span>
                </div>
              </div>

              <div className="text-center mb-8 mt-4">
                <h3 className="text-3xl font-bold text-white mb-4">Premium</h3>
                {discountApplied ? (
                  <div>
                    <div className="text-3xl line-through text-white/50 mb-1">
                      ₹{selectedPlan === 'monthly' ? monthlyPrice : Math.floor(yearlyPrice / 12)}
                    </div>
                    <div className="text-6xl font-black text-white mb-2">
                      ₹{selectedPlan === 'monthly' ? finalPrice : Math.floor(finalPrice / 12)}
                    </div>
                  </div>
                ) : (
                  <div className="text-6xl font-black text-white mb-2">
                    ₹{selectedPlan === 'monthly' ? monthlyPrice : Math.floor(yearlyPrice / 12)}
                  </div>
                )}
                <p className="text-emerald-100 text-lg">
                  per month {selectedPlan === 'yearly' && '(billed yearly)'}
                </p>
                {selectedPlan === 'yearly' && (
                  <div className="mt-3 inline-block bg-yellow-400 text-gray-900 px-4 py-1 rounded-full font-bold text-sm">
                    Save ₹{yearlySavings}/year
                  </div>
                )}
                {discountApplied && (
                  <div className="mt-2 inline-flex items-center space-x-2 bg-emerald-500/30 border border-emerald-400 text-emerald-100 px-4 py-2 rounded-full font-bold text-sm">
                    <Tag size={16} />
                    <span>10% OFF Applied!</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-100 text-sm">Base Price:</span>
                    <span className="text-white font-semibold">₹{selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice}</span>
                  </div>
                  {discountApplied && (
                    <>
                      <div className="flex items-center justify-between mb-2 text-emerald-300">
                        <span className="text-sm flex items-center space-x-1">
                          <Tag size={14} />
                          <span>Discount (10%):</span>
                        </span>
                        <span className="font-semibold">-₹{discountAmount}</span>
                      </div>
                      <div className="border-t border-white/20 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-white">₹{finalPrice}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-emerald-100 text-sm font-medium mb-2">
                    Have a discount code?
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
                      placeholder="Enter code (e.g., HAPPY10)"
                      className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 focus:border-emerald-300 focus:outline-none transition-all duration-300"
                      disabled={discountApplied}
                    />
                    {discountApplied ? (
                      <div className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500/30 border border-emerald-400 rounded-lg">
                        <CheckCircle size={20} className="text-emerald-300" />
                        <span className="text-emerald-100 font-medium text-sm">Applied</span>
                      </div>
                    ) : (
                      <button
                        onClick={applyDiscount}
                        disabled={!discountCode.trim()}
                        className="px-6 py-2.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 border border-white/30 hover:border-white/50 disabled:border-white/10"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {discountError && (
                    <p className="text-red-300 text-xs mt-2">{discountError}</p>
                  )}
                  {discountApplied && (
                    <p className="text-emerald-300 text-xs mt-2 flex items-center space-x-1">
                      <CheckCircle size={14} />
                      <span>Discount code applied successfully! You save ₹{discountAmount}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Video, text: 'Unlimited Debates' },
                  { icon: Brain, text: 'AI Feedback' },
                  { icon: Trophy, text: 'Achievements' },
                  { icon: BarChart, text: 'Analytics' },
                  { icon: Users, text: 'Networking' },
                  { icon: BookOpen, text: 'Learning Paths' }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <feature.icon className="mx-auto mb-2 text-yellow-300" size={28} />
                    <span className="text-white text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePremiumPurchase}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={24} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Crown size={24} />
                    <span>Start Your Journey</span>
                    <Zap size={24} className="animate-pulse" />
                  </>
                )}
              </button>

              <p className="text-center text-emerald-100 text-sm mt-4">
                🔒 Secure payment • Cancel anytime • 7-day money-back guarantee
              </p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-700">
              <div className="text-center mb-6">
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                  COMING SOON
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-5xl font-black text-white mb-2">
                  ₹2,499
                </div>
                <p className="text-gray-400">per month</p>
              </div>
              <ul className="space-y-4">
                {[
                  'Everything in Premium',
                  '1-on-1 Expert Coaching',
                  'Custom Learning Plans',
                  'Priority Support',
                  'Exclusive Masterclasses',
                  'Career Opportunities',
                  'Certificate Programs'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <Award className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-emerald-500/30">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">What Premium Members Are Saying</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Arjun Sharma',
                  role: 'MBA Student',
                  text: 'Got my dream job at McKinsey! The AI feedback helped me ace group discussions.',
                  rating: 5
                },
                {
                  name: 'Priya Patel',
                  role: 'Lawyer',
                  text: 'My courtroom confidence skyrocketed. Worth every rupee!',
                  rating: 5
                },
                {
                  name: 'Rahul Kumar',
                  role: 'Entrepreneur',
                  text: 'Closed 3 investor deals after improving my pitch with DebateHub Premium.',
                  rating: 5
                }
              ].map((testimonial, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-200 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-400 text-sm">
              💳 Supports UPI, Cards, PhonePe, Google Pay, Paytm, Net Banking & more
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
