import { useEffect, useState } from 'react';
import { BookOpen, Award, Filter, Star, Clock, DollarSign, Bookmark, Check, ExternalLink, Search } from 'lucide-react';
import { supabase } from '../api';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  source: string;
  resource_type: string;
  difficulty: string;
  estimated_time: string;
  is_free: boolean;
  rating: number;
  view_count: number;
  featured: boolean;
  tags: string[];
  is_saved?: boolean;
}

const categoryLabels: Record<string, string> = {
  vocal_health: 'Vocal Health',
  public_speaking: 'Public Speaking',
  debate_skills: 'Debate Skills',
  body_language: 'Body Language',
  storytelling: 'Storytelling',
  communication: 'Communication'
};

const categoryIcons: Record<string, string> = {
  vocal_health: '🎤',
  public_speaking: '🎭',
  debate_skills: '⚖️',
  body_language: '🤝',
  storytelling: '📖',
  communication: '💬'
};

export default function ImproveYourself() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, selectedCategory, selectedDifficulty, showFreeOnly, searchQuery]);

  const fetchResources = async () => {
    try {
      const { data: resourcesData, error } = await supabase
        .from('learning_resources')
        .select('*')
        .order('featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: savedResources } = await supabase
          .from('user_saved_resources')
          .select('resource_id')
          .eq('user_id', user.id);

        const savedIds = new Set(savedResources?.map(sr => sr.resource_id) || []);

        const enrichedResources = resourcesData?.map(resource => ({
          ...resource,
          is_saved: savedIds.has(resource.id)
        })) || [];

        setResources(enrichedResources);
      } else {
        setResources(resourcesData || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(r => r.difficulty === selectedDifficulty);
    }

    if (showFreeOnly) {
      filtered = filtered.filter(r => r.is_free);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.source.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredResources(filtered);
  };

  const toggleSaveResource = async (resourceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      if (resource.is_saved) {
        await supabase
          .from('user_saved_resources')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId);
      } else {
        await supabase
          .from('user_saved_resources')
          .insert({ user_id: user.id, resource_id: resourceId });
      }

      setResources(prev => prev.map(r =>
        r.id === resourceId ? { ...r, is_saved: !r.is_saved } : r
      ));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const incrementViewCount = async (resourceId: string) => {
    try {
      await supabase
        .from('learning_resources')
        .update({ view_count: supabase.raw('view_count + 1') })
        .eq('id', resourceId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'course': return '📚';
      case 'article': return '📄';
      case 'book': return '📖';
      case 'podcast': return '🎧';
      case 'workshop': return '🎓';
      default: return '📌';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Improve Yourself</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Curated resources from world-class experts to help you master speaking, debating, and communication skills
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search resources, topics, or sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {categoryIcons[key]} {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Free Only</span>
              </label>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold text-blue-600">{filteredResources.length}</span> resources
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  resource.featured ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {resource.featured && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-semibold">
                    ⭐ Featured Resource
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(resource.resource_type)}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleSaveResource(resource.id)}
                      className={`p-2 rounded-full transition-colors ${
                        resource.is_saved
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {resource.is_saved ? <Check size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{resource.rating.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{resource.estimated_time}</span>
                    </div>

                    {resource.is_free ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Paid</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      <span className="font-semibold">Source:</span> {resource.source}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => incrementViewCount(resource.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>View Resource</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No resources found matching your filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setShowFreeOnly(false);
                setSearchQuery('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
