import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Video, TrendingUp, BookOpen, Award, Clock, BarChart, Calendar, Target, Brain, MessageCircle } from 'lucide-react';
import * as api from '../api';

interface DebateSession {
  id: string;
  topic: string;
  duration: number;
  opponent_name: string;
  created_at: string;
  skills_rating?: {
    communication?: number;
    logic?: number;
    persuasion?: number;
  };
}

interface PerformanceMetrics {
  total_debates: number;
  total_time: number;
  avg_communication: number;
  avg_logic: number;
  avg_persuasion: number;
  avg_listening: number;
  avg_emotional_intelligence: number;
}

interface Material {
  topic: string;
  count: number;
}

export function UserDashboard() {
  const { user, accessToken } = useAuth();
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user || !accessToken) return;

    try {
      const sessionsData = await api.getDebateSessions(accessToken);

      if (sessionsData) {
        // Transform API response to match component expectations
        const transformedSessions = sessionsData.slice(0, 5).map((session: any) => ({
          id: session.id,
          topic: session.topic,
          duration: session.duration || 0,
          opponent_name: 'Anonymous',
          created_at: session.created_at,
          skills_rating: {
            communication: session.clarity_score || 0,
            logic: session.logic_score || 0,
            persuasion: session.persuasiveness_score || 0,
          },
        }));
        setSessions(transformedSessions);

        // Calculate performance metrics
        if (sessionsData.length > 0) {
          const totalDebates = sessionsData.length;
          const totalTime = sessionsData.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
          const avgCommunication = sessionsData.reduce((acc: number, s: any) => acc + (s.clarity_score || 0), 0) / totalDebates;
          const avgLogic = sessionsData.reduce((acc: number, s: any) => acc + (s.logic_score || 0), 0) / totalDebates;
          const avgPersuasion = sessionsData.reduce((acc: number, s: any) => acc + (s.persuasiveness_score || 0), 0) / totalDebates;

          setPerformance({
            total_debates: totalDebates,
            total_time: Math.floor(totalTime / 60),
            avg_communication: avgCommunication,
            avg_logic: avgLogic,
            avg_persuasion: avgPersuasion,
            avg_listening: 0, // Not available in current schema
            avg_emotional_intelligence: 0, // Not available in current schema
          });
        }

        // Calculate topic counts
        const topicCounts: { [key: string]: number } = {};
        sessionsData.forEach((session: any) => {
          if (session.topic) {
            topicCounts[session.topic] = (topicCounts[session.topic] || 0) + 1;
          }
        });
        const materialsArray = Object.entries(topicCounts).map(([topic, count]) => ({
          topic,
          count,
        }));
        setMaterials(materialsArray);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001a1a] via-[#002222] to-[#001515] flex items-center justify-center">
        <div className="text-emerald-400 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a1a] via-[#002222] to-[#001515] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-gray-400">Track your debate performance and progress</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Video className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-gray-400 text-sm">Total Debates</h3>
            </div>
            <p className="text-3xl font-bold text-white">{performance?.total_debates || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Clock className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-gray-400 text-sm">Total Time</h3>
            </div>
            <p className="text-3xl font-bold text-white">{performance?.total_time || 0} min</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-gray-400 text-sm">Avg. Score</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {performance ? Math.round((performance.avg_communication + performance.avg_logic + performance.avg_persuasion) / 3) : 0}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <BookOpen className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-gray-400 text-sm">Topics Explored</h3>
            </div>
            <p className="text-3xl font-bold text-white">{materials.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-[#003333]/50 to-[#002222]/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Video className="text-emerald-400" size={24} />
                <span>Recent Debates</span>
              </h2>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="mx-auto text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400">No debates yet. Start your first debate!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-[#001a1a]/50 rounded-lg p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{session.topic || 'Untitled Debate'}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{formatDate(session.created_at)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{formatDuration(session.duration || 0)}</span>
                            </span>
                          </div>
                        </div>
                        {session.skills_rating && (
                          <div className="flex items-center space-x-2">
                            <Award className="text-emerald-400" size={18} />
                            <span className="text-emerald-400 font-semibold">
                              {Math.round(
                                ((session.skills_rating.communication || 0) +
                                  (session.skills_rating.logic || 0) +
                                  (session.skills_rating.persuasion || 0)) / 3
                              )}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#003333]/50 to-[#002222]/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <BookOpen className="text-emerald-400" size={24} />
                <span>Materials Read</span>
              </h2>
              {materials.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400">No topics explored yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((material, idx) => (
                    <div
                      key={idx}
                      className="bg-[#001a1a]/50 rounded-lg p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{material.topic}</span>
                        <span className="text-emerald-400 font-semibold">{material.count} debates</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#003333]/50 to-[#002222]/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <BarChart className="text-emerald-400" size={24} />
                <span>Performance</span>
              </h2>
              {!performance || performance.total_debates === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400">Complete debates to see performance</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Communication', value: performance.avg_communication, icon: MessageCircle },
                    { label: 'Logic', value: performance.avg_logic, icon: Brain },
                    { label: 'Persuasion', value: performance.avg_persuasion, icon: Target },
                    { label: 'Listening', value: performance.avg_listening, icon: Video },
                    { label: 'Emotional IQ', value: performance.avg_emotional_intelligence, icon: Award },
                  ].map((skill) => (
                    <div key={skill.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <skill.icon className="text-emerald-400" size={16} />
                          <span className="text-gray-300">{skill.label}</span>
                        </div>
                        <span className="text-white font-semibold">{Math.round(skill.value)}%</span>
                      </div>
                      <div className="w-full bg-gray-700/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${skill.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/30">
              <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <Target className="text-emerald-400" size={20} />
                <span>Quick Stats</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Best Skill</span>
                  <span className="text-emerald-400 font-medium">
                    {performance && performance.avg_communication >= Math.max(performance.avg_logic, performance.avg_persuasion)
                      ? 'Communication'
                      : performance && performance.avg_logic >= performance.avg_persuasion
                      ? 'Logic'
                      : 'Persuasion'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Most Debated</span>
                  <span className="text-white font-medium">
                    {materials.length > 0 ? materials.reduce((max, m) => (m.count > max.count ? m : max)).topic : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg. Duration</span>
                  <span className="text-white font-medium">
                    {performance && performance.total_debates > 0
                      ? Math.round(performance.total_time / performance.total_debates)
                      : 0}{' '}
                    min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
