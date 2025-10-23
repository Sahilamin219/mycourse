import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { DebateTopics } from './components/DebateTopics';
import { DebateRoom } from './components/DebateRoom';
import { Resources } from './components/Resources';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { useAuth } from './contexts/AuthContext';
import { useSubscription } from './hooks/useSubscription';

function App() {
  const [showDebateRoom, setShowDebateRoom] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a1a] via-[#002222] to-[#001515]">
      <Navigation
        onStartDebate={handleStartDebate}
        onSignIn={() => setShowAuthModal(true)}
        onUpgrade={handleUpgrade}
      />
      <Hero onStartDebate={handleStartDebate} />
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
