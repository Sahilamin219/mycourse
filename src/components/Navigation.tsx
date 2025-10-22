import { Menu, Search, Video, MessageSquare, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  onStartDebate: () => void;
  onSignIn: () => void;
}

export function Navigation({ onStartDebate, onSignIn }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="#" className="flex items-center space-x-2 text-white font-bold text-xl">
              <MessageSquare size={28} />
              <span>DebateHub</span>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-emerald-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Home
            </a>
            <a href="#topics" className="text-white hover:text-emerald-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Topics
            </a>
            <a href="#resources" className="text-white hover:text-emerald-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Resources
            </a>
            <a href="#testimonials" className="text-white hover:text-emerald-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              About
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search topics..."
                className="w-64 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 focus:border-emerald-200 focus:outline-none transition-all duration-300"
              />
              <Search className="absolute right-3 top-2.5 text-white/70" size={18} />
            </div>
            <button
              onClick={onStartDebate}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
              <Video size={18} />
              <span>Start Debate</span>
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white">
                  <User size={18} />
                  <span className="text-sm">{user.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300">
                Sign In
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-emerald-200 p-2"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              Home
            </a>
            <a href="#topics" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              Topics
            </a>
            <a href="#resources" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              Resources
            </a>
            <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              About
            </a>
            <div className="px-3 py-2">
              <input
                type="text"
                placeholder="Search topics..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="px-3 space-y-2 pt-2">
              {user ? (
                <>
                  <div className="text-center text-gray-700 py-2">
                    {user.email}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={onSignIn}
                  className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                  Sign In
                </button>
              )}
              <button
                onClick={onStartDebate}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 py-2 rounded-lg text-white">
                Start Debate
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
