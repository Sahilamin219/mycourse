import { Video, MessageSquare, Star, Users } from 'lucide-react';

interface HeroProps {
  onStartDebate: () => void;
}

export function Hero({ onStartDebate }: HeroProps) {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white py-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Master Communication
            <span className="block text-emerald-200">Through Live Debates</span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with strangers worldwide and sharpen your debate, negotiation, and communication skills through real-time video conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="flex items-center space-x-1 text-yellow-400 text-lg">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
              <span className="text-white ml-2">4.8 (8,230 reviews)</span>
            </div>
            <div className="text-emerald-200 flex items-center gap-2">
              <Users size={20} />
              <span>50K+ Active Debaters</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStartDebate}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 mx-auto sm:mx-0 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <Video size={24} />
              <span>Start Debating Now</span>
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('topics');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 mx-auto sm:mx-0 transition-all duration-300">
              <MessageSquare size={24} />
              <span>Browse Topics</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
