import { useEffect, useState } from 'react';
import { fetchCategories } from '../api';
import type { Category } from '../types';
import { Code2, TrendingUp, Palette, Smartphone } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'laptop-code': <Code2 size={32} />,
  'chart-line': <TrendingUp size={32} />,
  'paint-brush': <Palette size={32} />,
  'mobile-alt': <Smartphone size={32} />,
};

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="categories" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Categories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect course for your learning journey from our diverse range of categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Categories</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect course for your learning journey from our diverse range of categories
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`${category.gradient} text-white p-6 rounded-xl text-center cursor-pointer group transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
                {iconMap[category.icon] || <Code2 size={32} />}
              </div>
              <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
              <p className="text-white/80 text-sm">{category.description}</p>
              <div className="mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {category.course_count} courses
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
