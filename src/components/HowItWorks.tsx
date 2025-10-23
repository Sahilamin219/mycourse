import { Video, Users, BarChart3, Trophy, Sparkles, Mic, Brain, TrendingUp, MessageCircle, Target } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#001a1a] to-[#002222] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 px-6 py-3 rounded-full mb-6">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-emerald-100 font-medium">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Master Communication
            <span className="block text-emerald-400 mt-2">Through Live Debates</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Connect with strangers worldwide and sharpen your debate, negotiation, and communication skills through real-time video conversations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {[
            {
              icon: MessageCircle,
              step: "01",
              title: "Choose Your Topic",
              description: "Select from hundreds of debate topics or create your own. From politics to philosophy, technology to lifestyle."
            },
            {
              icon: Users,
              step: "02",
              title: "Get Matched Instantly",
              description: "Our smart algorithm pairs you with someone who shares your interests. Start debating within seconds."
            },
            {
              icon: Video,
              step: "03",
              title: "Debate & Learn",
              description: "Express your views, listen to perspectives, and engage in meaningful conversations via video call."
            },
            {
              icon: BarChart3,
              step: "04",
              title: "Track Your Growth",
              description: "Receive AI-powered insights, skill ratings, and personalized feedback after every session."
            }
          ].map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/50">
                  {item.step}
                </div>
                <item.icon className="text-emerald-400 mb-6 mt-4 group-hover:scale-110 transition-transform duration-300" size={40} />
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
              {idx < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#003333]/50 to-[#002222]/50 backdrop-blur-sm rounded-3xl border border-emerald-500/20 p-12 md:p-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 px-6 py-3 rounded-full mb-6">
              <Trophy size={18} className="text-emerald-400" />
              <span className="text-emerald-100 font-medium">Premium Features</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Unlock Your Full Potential
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced AI-powered tools to accelerate your communication mastery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Real-Time AI Analysis",
                description: "Get instant feedback on your arguments, tone, and delivery while you speak. Our AI analyzes your communication in real-time.",
                highlight: true
              },
              {
                icon: BarChart3,
                title: "Advanced Metrics Dashboard",
                description: "Track speaking pace, word choice, filler words, confidence levels, and argument strength with detailed visualizations.",
                highlight: true
              },
              {
                icon: Mic,
                title: "Speech Pattern Analysis",
                description: "Identify your verbal tics, analyze your vocabulary richness, and get suggestions to improve clarity and impact.",
                highlight: true
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Watch your communication scores improve over time with comprehensive analytics and personalized insights."
              },
              {
                icon: Target,
                title: "Skill-Based Scoring",
                description: "Receive detailed ratings on Communication, Logic, Persuasion, Listening, and Emotional Intelligence after each debate."
              },
              {
                icon: Video,
                title: "Session Recordings",
                description: "Review your debates with AI-generated highlights, transcripts, and timestamps of key moments for self-improvement."
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${
                  feature.highlight
                    ? 'from-emerald-500/20 to-teal-500/20 border-emerald-400/40'
                    : 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
                } backdrop-blur-sm rounded-2xl p-6 border hover:border-emerald-400/50 transition-all duration-300 group relative overflow-hidden`}
              >
                {feature.highlight && (
                  <div className="absolute top-3 right-3">
                    <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                  </div>
                )}
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-emerald-400" size={28} />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Premium Analytics</div>
                  <div className="text-emerald-300 text-sm">Real-time insights • Advanced metrics • AI coaching</div>
                </div>
              </div>
              <div className="h-px sm:h-8 w-24 sm:w-px bg-emerald-500/30"></div>
              <div className="text-gray-300">
                Transform your communication skills with data-driven feedback
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
          {[
            { number: "50K+", label: "Active Users", sublabel: "Growing community" },
            { number: "1M+", label: "Debates Hosted", sublabel: "And counting" },
            { number: "100+", label: "Countries", sublabel: "Worldwide reach" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/10 hover:border-emerald-400/30 transition-all duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-white font-semibold text-lg mb-1">{stat.label}</div>
              <div className="text-gray-400 text-sm">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
