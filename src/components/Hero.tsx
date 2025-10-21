import { PlayCircle, Book, Star, Users } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white py-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Master New Skills
            <span className="block text-blue-200">With Expert-Led Courses</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of learners worldwide and unlock your potential with our comprehensive online courses taught by industry experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="flex items-center space-x-1 text-yellow-400 text-lg">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
              <span className="text-white ml-2">4.9 (12,450 reviews)</span>
            </div>
            <div className="text-blue-200 flex items-center gap-2">
              <Users size={20} />
              <span>200K+ Active Learners</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 mx-auto sm:mx-0 transition-all duration-300 hover:-translate-y-1 shadow-lg">
              <PlayCircle size={24} />
              <span>Browse Courses</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 mx-auto sm:mx-0 transition-all duration-300">
              <Book size={24} />
              <span>View Categories</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
