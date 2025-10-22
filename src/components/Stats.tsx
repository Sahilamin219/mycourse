import { useEffect, useState } from 'react';
import { fetchStats } from '../api';
import type { Stats as StatsType } from '../types';

export function Stats() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-emerald-600 mb-2">{stats.total_debates}+</div>
            <div className="text-gray-600 font-medium">Total Debates</div>
          </div>
          <div className="transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-teal-600 mb-2">{stats.active_users}+</div>
            <div className="text-gray-600 font-medium">Active Users</div>
          </div>
          <div className="transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-cyan-600 mb-2">{stats.debate_topics}+</div>
            <div className="text-gray-600 font-medium">Debate Topics</div>
          </div>
          <div className="transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-orange-600 mb-2">{stats.support_available}</div>
            <div className="text-gray-600 font-medium">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}
