import { Video, MessageSquare, Star, Users, Globe, Sparkles, Mic, Brain } from 'lucide-react';

interface HeroProps {
  onStartDebate: () => void;
}

export function Hero({ onStartDebate }: HeroProps) {
  return (
    <section className="pt-20 pb-24 bg-gradient-to-br from-[#002222] via-emerald-950 to-[#001a1a] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-emerald-400/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white py-24">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 px-6 py-3 rounded-full mb-8">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-emerald-100 font-medium">Connect. Learn. Grow.</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              Empower Your Voice
            </span>
            <span className="block text-3xl md:text-5xl lg:text-6xl text-emerald-400 mt-4 font-normal">
              Explore the World Through Conversation
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join a global community where every conversation is an opportunity to learn, grow, and discover new perspectives.
            <span className="block mt-3 text-emerald-300">Express yourself. Challenge ideas. Build confidence.</span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
            {[
              { icon: Globe, text: 'Global Community', subtext: 'Connect worldwide' },
              { icon: Brain, text: 'AI-Powered Growth', subtext: 'Personalized insights' },
              { icon: Mic, text: 'Find Your Voice', subtext: 'Express confidently' },
              { icon: Users, text: '50K+ Members', subtext: 'Growing daily' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-400/40 hover:scale-105 transition-all duration-300 group">
                <stat.icon className="mx-auto mb-3 text-emerald-400 group-hover:text-emerald-300 transition-colors" size={36} />
                <div className="font-semibold text-lg text-white">{stat.text}</div>
                <div className="text-emerald-300/70 text-sm mt-1">{stat.subtext}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button
              onClick={onStartDebate}
              className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-10 py-5 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300 hover:scale-105 shadow-xl shadow-emerald-500/25">
              <Video size={24} />
              <span>Start Your Journey</span>
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('topics');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-medium text-lg flex items-center justify-center space-x-3 transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-sm">
              <MessageSquare size={24} />
              <span>Explore Topics</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="text-emerald-400 fill-emerald-400" />
              ))}
              <span className="text-gray-300 ml-2">Loved by thousands</span>
            </div>
            <div className="text-gray-400">•</div>
            <div className="text-gray-300">
              Trusted by learners in 100+ countries
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
