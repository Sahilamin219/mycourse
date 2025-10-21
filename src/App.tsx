import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Categories } from './components/Categories';
import { Courses } from './components/Courses';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Hero />
      <Stats />
      <Categories />
      <Courses />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
