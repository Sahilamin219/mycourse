import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { DebateTopics } from './components/DebateTopics';
import { DebateRoom } from './components/DebateRoom';
import { Resources } from './components/Resources';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';

function App() {
  const [showDebateRoom, setShowDebateRoom] = useState(false);

  const handleStartDebate = () => {
    setShowDebateRoom(true);
    const element = document.getElementById('start-debate');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onStartDebate={handleStartDebate} />
      <Hero onStartDebate={handleStartDebate} />
      <Stats />
      <DebateTopics />
      {showDebateRoom && <DebateRoom />}
      <Resources />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
