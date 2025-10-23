import { Menu, X, Video, MessageSquare, LogOut, User, Crown, Sparkles, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

interface NavigationProps {
  onStartDebate: () => void;
  onSignIn: () => void;
  onUpgrade: () => void;
}

export function Navigation({ onStartDebate, onSignIn, onUpgrade }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, signOut } = useAuth();
  const { isPremium, dailyCallCount } = useSubscription();

  return (
    <nav className="bg-gradient-to-r from-[#002222] via-[#003333] to-[#002222] shadow-2xl fixed w-full z-50 backdrop-blur-md border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            <a href="#" className="flex items-center space-x-3 group">
              <div className="relative">
                <MessageSquare size={32} className="text-emerald-400 group-hover:text-emerald-300 transition-all duration-300" />
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">DebateHub</span>
            </a>

            <div className="hidden lg:flex items-center space-x-1">
              {[
                { label: 'Home', href: '#' },
                { label: 'Topics', href: '#topics' },
                { label: 'Community', href: '#resources' },
                { label: 'About', href: '#testimonials' }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'w-72' : 'w-56'}`}>
              <input
                type="text"
                placeholder="Search topics..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 border border-white/10 focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>

            {user ? (
              <>
                {isPremium ? (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <Crown size={18} className="text-emerald-400" />
                    <span className="text-emerald-300 font-semibold text-sm">Premium</span>
                  </div>
                ) : (
                  <button
                    onClick={onUpgrade}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-400/30 hover:border-emerald-400/50 px-4 py-2 rounded-xl font-medium text-emerald-300 hover:text-emerald-200 transition-all duration-300 group">
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-sm">Upgrade</span>
                    {!isPremium && (
                      <span className="text-xs text-gray-400">({dailyCallCount}/2)</span>
                    )}
                  </button>
                )}

                <div className="h-8 w-px bg-white/10"></div>

                <button
                  onClick={onStartDebate}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/25">
                  <Video size={18} />
                  <span>Start Debate</span>
                </button>

                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-300">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#001a1a] border border-emerald-500/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                    <div className="p-4 border-b border-emerald-500/10">
                      <div className="text-white font-medium truncate">{user.email}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {isPremium ? 'Premium Member' : 'Free Plan'}
                      </div>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center space-x-2">
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={onStartDebate}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/25">
                  <Video size={18} />
                  <span>Start Debate</span>
                </button>
                <button
                  onClick={onSignIn}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300">
                  Sign In
                </button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-emerald-300 p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#001a1a] border-t border-emerald-500/20">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {[
              { label: 'Home', href: '#' },
              { label: 'Topics', href: '#topics' },
              { label: 'Community', href: '#resources' },
              { label: 'About', href: '#testimonials' }
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <div className="pt-4 border-t border-emerald-500/10">
              {user ? (
                <>
                  <div className="px-4 py-3 text-gray-300 rounded-lg bg-white/5 mb-3">
                    <div className="text-white font-medium truncate">{user.email}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {isPremium ? 'Premium Member' : `Free Plan (${dailyCallCount}/2 debates today)`}
                    </div>
                  </div>
                  {!isPremium && (
                    <button
                      onClick={() => {
                        onUpgrade();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 text-emerald-300 px-4 py-3 rounded-lg font-medium mb-3 flex items-center justify-center space-x-2">
                      <Sparkles size={18} />
                      <span>Upgrade to Premium</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onStartDebate();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-lg font-semibold mb-3 flex items-center justify-center space-x-2">
                    <Video size={18} />
                    <span>Start Debate</span>
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onStartDebate();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-lg font-semibold mb-3 flex items-center justify-center space-x-2">
                    <Video size={18} />
                    <span>Start Debate</span>
                  </button>
                  <button
                    onClick={() => {
                      onSignIn();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300">
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
