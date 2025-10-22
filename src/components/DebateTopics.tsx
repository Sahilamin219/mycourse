import { useEffect, useState } from 'react';
import { fetchDebateTopics } from '../api';
import type { DebateTopic } from '../types';
import { Globe, Briefcase, Lightbulb, Rocket, Scale, Trophy } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'globe': <Globe size={32} />,
  'briefcase': <Briefcase size={32} />,
  'lightbulb': <Lightbulb size={32} />,
  'rocket': <Rocket size={32} />,
  'scale': <Scale size={32} />,
  'trophy': <Trophy size={32} />,
};

export function DebateTopics() {
  const [topics, setTopics] = useState<DebateTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebateTopics()
      .then(setTopics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="topics" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Debate Topics</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a topic and start debating with people around the world
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="topics" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Debate Topics</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose a topic and start debating with people around the world
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`${topic.gradient} text-white p-8 rounded-xl cursor-pointer group transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl`}
            >
              <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
                {iconMap[topic.icon] || <Globe size={32} />}
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">{topic.name}</h3>
              <p className="text-white/90 text-sm text-center mb-4">{topic.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {topic.debate_count} debates
                </span>
                {topic.difficulty && (
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {topic.difficulty}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
