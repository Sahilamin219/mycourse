import { Video, MessageSquare, Star, Users, TrendingUp, Zap, Trophy, Target } from 'lucide-react';

interface HeroProps {
  onStartDebate: () => void;
}

export function Hero({ onStartDebate }: HeroProps) {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white py-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full mb-6 font-bold text-sm animate-bounce">
            <Zap size={18} />
            <span>🔥 50% OFF PREMIUM - ENDS TONIGHT!</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              Land Your Dream Job
            </span>
            <span className="block text-4xl md:text-6xl text-yellow-300 mt-2">
              Master Communication in 30 Days
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-emerald-50 mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
            Join 50,000+ professionals who got hired at top companies after mastering debates.
            <span className="block mt-2 text-yellow-300 font-bold">90% of our premium users report career growth within 3 months!</span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            {[
              { icon: TrendingUp, text: '3x Salary Increase', subtext: 'Avg for premium users' },
              { icon: Trophy, text: '95% Success Rate', subtext: 'Job interviews aced' },
              { icon: Target, text: '10K+ Success Stories', subtext: 'Dream jobs landed' },
              { icon: Users, text: '50K+ Active Users', subtext: 'Practicing daily' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20 hover:scale-105 transition-transform duration-300">
                <stat.icon className="mx-auto mb-2 text-yellow-300" size={32} />
                <div className="font-bold text-lg">{stat.text}</div>
                <div className="text-emerald-200 text-xs">{stat.subtext}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={onStartDebate}
              className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-12 py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 mx-auto sm:mx-0 transition-all duration-300 hover:-translate-y-1 shadow-2xl animate-pulse">
              <Video size={28} />
              <span>Start Free Trial Now</span>
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-black animate-bounce">
                FREE
              </span>
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('topics');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-10 py-5 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 mx-auto sm:mx-0 transition-all duration-300 border-2 border-white/30">
              <MessageSquare size={24} />
              <span>See How It Works</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center space-x-1 text-yellow-400 text-lg">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill="currentColor" />
              ))}
              <span className="text-white ml-3 font-semibold">4.9/5 from 12,000+ reviews</span>
            </div>
          </div>

          <div className="mt-8 bg-emerald-800/30 backdrop-blur-sm border-2 border-emerald-400/30 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-emerald-100 text-lg font-medium">
              ⚡ <span className="text-yellow-300 font-bold">Limited spots available!</span> Only <span className="text-yellow-300 font-bold">47 slots left</span> at 50% off. Premium price goes back to ₹1,999/month after tonight.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
