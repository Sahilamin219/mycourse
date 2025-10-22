import { useEffect, useState } from 'react';
import { fetchResources } from '../api';
import type { Resource } from '../types';
import { BookOpen, Eye, Calendar, Clock, FileText, Video } from 'lucide-react';

export function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources()
      .then(setResources)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getBadgeColor = (color?: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      teal: 'bg-teal-500',
    };
    return colors[color || 'blue'] || 'bg-blue-500';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} />;
      case 'article':
      case 'tips':
        return <FileText size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  if (loading) {
    return (
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Free Learning Resources</h2>
            <p className="text-xl text-gray-600">Improve your communication skills with our free guides and tips</p>
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
    <section id="resources" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Free Learning Resources</h2>
          <p className="text-xl text-gray-600">Improve your communication skills with our free guides and tips</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-2xl p-6 overflow-hidden border border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative mb-4">
                <img
                  src={resource.image_url}
                  alt={resource.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {resource.badge && (
                  <div className={`absolute top-3 right-3 ${getBadgeColor(resource.badge_color)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                    {resource.badge}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Clock size={14} />
                  {resource.duration}
                </div>
                <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  {getTypeIcon(resource.type)}
                  <span className="uppercase">{resource.type}</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">{resource.description}</p>
                <div className="flex items-center justify-between pt-2">
                  {resource.views && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Eye size={16} />
                      {resource.views.toLocaleString()} views
                    </span>
                  )}
                  <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-1 transition-all duration-300 hover:-translate-y-0.5 shadow-md">
                    <BookOpen size={16} />
                    Read Now
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 pt-2 border-t">
                  {resource.author && (
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {resource.author}
                    </span>
                  )}
                  {resource.updated_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {resource.updated_date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
