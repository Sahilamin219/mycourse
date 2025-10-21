import { useEffect, useState } from 'react';
import { fetchCourses } from '../api';
import type { Course } from '../types';
import { Star, ShoppingCart, User, Calendar, Clock } from 'lucide-react';

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getBadgeColor = (color?: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colors[color || 'blue'] || 'bg-blue-500';
  };

  if (loading) {
    return (
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-xl text-gray-600">Our most popular courses that students love</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-96 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
          <p className="text-xl text-gray-600">Our most popular courses that students love</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl p-6 overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative mb-4">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {course.badge && (
                  <div className={`absolute top-3 right-3 ${getBadgeColor(course.badge_color)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                    {course.badge}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Clock size={14} />
                  {course.duration}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(course.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                    <span className="text-gray-600 text-sm ml-1">{course.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{course.student_count.toLocaleString()} students</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ${course.original_price}
                    </span>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-1 transition-all duration-300 hover:-translate-y-0.5 shadow-md">
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 pt-2">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {course.instructor_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {course.updated_date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
