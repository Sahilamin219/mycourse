import { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api';

interface DebateSession {
  id: string;
  topic: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
}

interface Analysis {
  overall_score: number;
  communication_score: number;
  argumentation_score: number;
  clarity_score: number;
  strengths: string[];
  weaknesses: string[];
  key_insights: string;
}

export function DebateHistory() {
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    fetchDebateHistory();
  }, []);

  const fetchDebateHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`http://localhost:8000/api/debate-history/${user.id}`);
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (sessionId: string) => {
    setAnalysisLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/debate-analysis/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const generateAnalysis = async (sessionId: string) => {
    setAnalysisLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(
        `http://localhost:8000/api/debate-analysis/${sessionId}?user_id=${user.id}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSession(sessionId);
    fetchAnalysis(sessionId);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Debate History</h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="history" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Debate History</h2>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">No debate sessions yet. Start your first debate!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedSession === session.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{session.topic}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{new Date(session.started_at).toLocaleDateString()}</span>
                    </div>
                    {session.duration_seconds && (
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>{formatDuration(session.duration_seconds)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2">
              {!selectedSession ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <Award className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600">Select a debate session to view analysis</p>
                </div>
              ) : analysisLoading ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-gray-600">Loading analysis...</p>
                </div>
              ) : !analysis ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 mb-4">No analysis available for this session</p>
                  <button
                    onClick={() => generateAnalysis(selectedSession)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Generate Analysis
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Analysis</h3>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Score</span>
                        <TrendingUp size={16} className="text-emerald-500" />
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                        {analysis.overall_score}/100
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">Communication</div>
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.communication_score)}`}>
                        {analysis.communication_score}/100
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">Argumentation</div>
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.argumentation_score)}`}>
                        {analysis.argumentation_score}/100
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">Clarity</div>
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.clarity_score)}`}>
                        {analysis.clarity_score}/100
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Strengths</span>
                      </h4>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, idx) => (
                          <li key={idx} className="text-gray-700 pl-6">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <span className="text-yellow-500">!</span>
                        <span>Areas for Improvement</span>
                      </h4>
                      <ul className="space-y-2">
                        {analysis.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-gray-700 pl-6">
                            • {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Insights</h4>
                      <p className="text-gray-700 whitespace-pre-line">{analysis.key_insights}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
