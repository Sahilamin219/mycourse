import { TrendingUp, TrendingDown, Award, AlertCircle, Lightbulb, X } from 'lucide-react';

interface WeakPortion {
  text: string;
  reason: string;
  alternative: string;
}

interface AnalysisData {
  overall_score: number;
  communication_score: number;
  argumentation_score: number;
  clarity_score: number;
  strengths: string[];
  weaknesses: string[];
  weak_portions?: WeakPortion[];
  key_insights: string;
}

interface DebateAnalysisReportProps {
  analysis: AnalysisData;
  topic: string;
  onClose: () => void;
}

export function DebateAnalysisReport({ analysis, topic, onClose }: DebateAnalysisReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const ScoreCard = ({ title, score }: { title: string; score: number }) => (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:shadow-lg transition-shadow">
      <h3 className="text-gray-700 font-medium mb-3">{title}</h3>
      <div className="flex items-end gap-3">
        <div className="text-5xl font-bold text-gray-900">{score}</div>
        <div className="text-gray-500 text-lg mb-2">/100</div>
      </div>
      <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(score)}`}>
        {getScoreLabel(score)}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl max-w-5xl w-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={28} />
          </button>

          <div className="mb-8">
            <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
              Debate Analysis
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Performance Report</h1>
            <p className="text-gray-600 text-lg">Topic: <span className="font-semibold">{topic}</span></p>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Overall Score</h2>
              <Award size={32} />
            </div>
            <div className="flex items-end gap-4">
              <div className="text-7xl font-bold">{analysis.overall_score}</div>
              <div className="text-2xl opacity-90 mb-3">/100</div>
            </div>
            <p className="mt-4 text-emerald-100 text-lg">
              {analysis.overall_score >= 80 && "Outstanding performance! Keep up the excellent work."}
              {analysis.overall_score >= 60 && analysis.overall_score < 80 && "Good job! You're on the right track."}
              {analysis.overall_score >= 40 && analysis.overall_score < 60 && "Fair performance. Focus on the areas below to improve."}
              {analysis.overall_score < 40 && "Keep practicing! Review the feedback to enhance your skills."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ScoreCard title="Communication" score={analysis.communication_score} />
            <ScoreCard title="Argumentation" score={analysis.argumentation_score} />
            <ScoreCard title="Clarity" score={analysis.clarity_score} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500 text-white p-2 rounded-lg">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-emerald-500 font-bold mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500 text-white p-2 rounded-lg">
                  <TrendingDown size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Areas to Improve</h3>
              </div>
              <ul className="space-y-3">
                {analysis.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-orange-500 font-bold mt-1">→</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {analysis.weak_portions && analysis.weak_portions.length > 0 && (
            <div className="bg-white border-2 border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500 text-white p-2 rounded-lg">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Weak Arguments & Better Alternatives</h3>
              </div>
              <div className="space-y-6">
                {analysis.weak_portions.map((portion, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-5 border-l-4 border-blue-500">
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Your Argument</span>
                      <p className="text-gray-800 mt-1 italic">"{portion.text}"</p>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-red-600 uppercase">Why It's Weak</span>
                      <p className="text-gray-700 mt-1">{portion.reason}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-emerald-600 uppercase flex items-center gap-1">
                        <Lightbulb size={14} /> Better Approach
                      </span>
                      <p className="text-gray-700 mt-1 font-medium">{portion.alternative}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <Lightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Key Insights & Recommendations</h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{analysis.key_insights}</p>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Close Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
