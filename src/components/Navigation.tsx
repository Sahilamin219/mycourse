import { Menu, Search, ShoppingCart, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="#" className="flex items-center space-x-2 text-white font-bold text-xl">
              <GraduationCap size={28} />
              <span>LearnHub</span>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-blue-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Home
            </a>
            <a href="#courses" className="text-white hover:text-blue-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Courses
            </a>
            <a href="#categories" className="text-white hover:text-blue-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Categories
            </a>
            <a href="#testimonials" className="text-white hover:text-blue-200 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              About
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-64 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 focus:border-blue-200 focus:outline-none transition-all duration-300"
              />
              <Search className="absolute right-3 top-2.5 text-white/70" size={18} />
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
              <ShoppingCart size={18} />
              <span>Cart</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300">
              Sign In
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-blue-200 p-2"
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
            <a href="#courses" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              Courses
            </a>
            <a href="#categories" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              Categories
            </a>
            <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              About
            </a>
            <div className="px-3 py-2">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="px-3 space-y-2 pt-2">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </button>
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-2 rounded-lg text-white">
                Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
