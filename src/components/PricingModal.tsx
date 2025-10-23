import { useState } from 'react';
import { X, Check, Crown, Loader } from 'lucide-react';
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
  const { user } = useAuth();

  if (!isOpen) return null;

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

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-payment/create-order`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: 'premium',
          amount: 49900,
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
        name: 'Debate Platform',
        description: 'Premium Monthly Subscription',
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

            alert('Payment successful! You are now a premium member.');
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Upgrade to premium and unlock unlimited debates</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-2xl p-8 bg-gray-50">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ₹0<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">2 debates per day</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Basic video quality</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Access to all topics</span>
                </li>
                <li className="flex items-start space-x-3 opacity-40">
                  <X className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-400">No performance feedback</span>
                </li>
                <li className="flex items-start space-x-3 opacity-40">
                  <X className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-400">No premium resources</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                Current Plan
              </button>
            </div>

            <div className="border-2 border-emerald-500 rounded-2xl p-8 bg-gradient-to-br from-emerald-50 to-teal-50 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                <Crown size={16} />
                <span>Popular</span>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ₹499<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600">Billed monthly</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">Unlimited debates daily</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">HD video quality</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">Detailed performance feedback</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">AI-powered insights</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">Exclusive learning resources</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-900 font-medium">Priority matching</span>
                </li>
              </ul>

              <button
                onClick={handlePremiumPurchase}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Crown size={20} />
                    <span>Upgrade to Premium</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Secure payment powered by Razorpay</p>
            <p className="mt-2">Supports UPI, Cards, PhonePe, Google Pay, Paytm, Net Banking & more</p>
          </div>
        </div>
      </div>
    </>
  );
}
