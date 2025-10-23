import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Stats } from './components/Stats';
import { DebateTopics } from './components/DebateTopics';
import { DebateRoom } from './components/DebateRoom';
import { Resources } from './components/Resources';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { UserDashboard } from './components/UserDashboard';
import { useAuth } from './contexts/AuthContext';
import { useSubscription } from './hooks/useSubscription';

function App() {
  const [showDebateRoom, setShowDebateRoom] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const { user } = useAuth();
  const { canMakeCall, refetch } = useSubscription();

  const handleStartDebate = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!canMakeCall) {
      setShowPricingModal(true);
      return;
    }
    setShowDebateRoom(true);
    setTimeout(() => {
      const element = document.getElementById('start-debate');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpgrade = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowPricingModal(true);
  };

  if (user && showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001a1a] via-[#002222] to-[#001515]">
        <Navigation
          onStartDebate={handleStartDebate}
          onSignIn={() => setShowAuthModal(true)}
          onUpgrade={handleUpgrade}
          onDashboard={() => setShowDashboard(true)}
        />
        <UserDashboard />
        <button
          onClick={() => setShowDashboard(false)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
        >
          Back to Home
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          onSuccess={() => {
            refetch();
            setShowPricingModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a1a] via-[#002222] to-[#001515]">
      <Navigation
        onStartDebate={handleStartDebate}
        onSignIn={() => setShowAuthModal(true)}
        onUpgrade={handleUpgrade}
        onDashboard={() => setShowDashboard(true)}
      />
      <Hero onStartDebate={handleStartDebate} />
      <HowItWorks />
      <Stats />
      <DebateTopics />
      {showDebateRoom && <DebateRoom />}
      <Resources />
      <Testimonials />
      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSuccess={() => {
          refetch();
          setShowPricingModal(false);
        }}
      />
    </div>
  );
}

export default App;
