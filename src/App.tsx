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
import { useAuth } from './contexts/AuthContext';

function App() {
  const [showDebateRoom, setShowDebateRoom] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const handleStartDebate = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowDebateRoom(true);
    setTimeout(() => {
      const element = document.getElementById('start-debate');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onStartDebate={handleStartDebate} onSignIn={() => setShowAuthModal(true)} />
      <Hero onStartDebate={handleStartDebate} />
      <Stats />
      <DebateTopics />
      {showDebateRoom && <DebateRoom />}
      <Resources />
      <Testimonials />
      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default App;
