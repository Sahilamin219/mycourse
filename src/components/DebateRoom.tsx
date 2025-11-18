import { useState, useEffect, useRef } from 'react';
import { VideoCall } from './VideoCall';
import { WordPuzzle } from './WordPuzzle';
import { DebateAnalysisReport } from './DebateAnalysisReport';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { generateDebateAnalysis } from '../api';
import { Video, Loader, AlertCircle, Lightbulb, UserCheck, UserX } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface DebateRoomProps {
  selectedTopic?: string;
}

const DEBATE_TIPS = [
  "Listen actively to understand your opponent's perspective",
  "Support your arguments with concrete examples and evidence",
  "Stay calm and respectful, even when disagreeing strongly",
  "Ask clarifying questions to better understand their position",
  "Acknowledge valid points made by your opponent",
  "Use 'I' statements to express your views without attacking",
  "Take a moment to think before responding to complex points",
  "Focus on the argument, not the person making it",
  "Be willing to adjust your position when presented with new information",
  "Summarize key points to ensure mutual understanding"
];

export function DebateRoom({ selectedTopic }: DebateRoomProps) {
  const [showDebate, setShowDebate] = useState(false);
  const [topic, setTopic] = useState(selectedTopic || '');
  const [currentTip, setCurrentTip] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  const { user } = useAuth();
  const { trackDebateSession, endDebateSession } = useSubscription();
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  const {
    localStream,
    remoteStream,
    isSearching,
    isConnected,
    error,
    matchRequest,
    startSearch,
    acceptMatch,
    rejectMatch,
    cancelSearch,
    endCall,
  } = useWebRTC();

  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % DEBATE_TIPS.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isSearching]);

  const handleStartDebate = () => {
    if (!topic) {
      alert('Please select a debate topic');
      return;
    }
    setShowDebate(true);
    startSearch(topic, user?.email || 'Anonymous');
  };

  const handleCancelSearch = () => {
    cancelSearch();
    setShowDebate(false);
  };

  const handleAcceptMatch = async () => {
    const session = await trackDebateSession(topic, matchRequest?.partnerId);
    if (session) {
      sessionIdRef.current = session.id;
      sessionStartRef.current = Date.now();
    }
    acceptMatch();
  };

  const handleRejectMatch = () => {
    rejectMatch();
  };

  const handleEndCall = async () => {
    if (sessionIdRef.current && sessionStartRef.current) {
      const durationSeconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      await endDebateSession(sessionIdRef.current, durationSeconds);

      endCall();
      setShowDebate(false);

      if (durationSeconds > 30) {
        setIsGeneratingAnalysis(true);
        try {
          const session = await supabase.auth.getSession();
          if (session.data.session) {
            const result = await generateDebateAnalysis(
              sessionIdRef.current,
              session.data.session.access_token
            );
            setAnalysisData(result.analysis);
            setShowAnalysis(true);
          }
        } catch (error) {
          console.error('Error generating analysis:', error);
          alert('Failed to generate analysis. Please try again later.');
        } finally {
          setIsGeneratingAnalysis(false);
        }
      }

      sessionIdRef.current = null;
      sessionStartRef.current = null;
    } else {
      endCall();
      setShowDebate(false);
    }
  };

  if (isGeneratingAnalysis) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 z-50 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader className="animate-spin mx-auto mb-6 text-emerald-400" size={72} />
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Analyzing Your Debate
          </h2>
          <p className="text-gray-300 text-lg">
            Our AI is reviewing your performance and generating insights...
          </p>
        </div>
      </div>
    );
  }

  if (showAnalysis && analysisData) {
    return (
      <DebateAnalysisReport
        analysis={analysisData}
        topic={topic}
        onClose={() => {
          setShowAnalysis(false);
          setAnalysisData(null);
        }}
      />
    );
  }

  if (showDebate && isConnected) {
    return (
      <VideoCall
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={handleEndCall}
        topic={topic}
        sessionId={sessionIdRef.current || undefined}
      />
    );
  }

  if (showDebate && matchRequest) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <UserCheck className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Match Found!</h2>
            <p className="text-gray-600">Someone wants to debate with you</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Partner:</span>
                <span className="text-gray-900 font-semibold">{matchRequest.partnerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Topic:</span>
                <span className="text-emerald-600 font-semibold">{matchRequest.topic}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAcceptMatch}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
            >
              <UserCheck size={24} />
              <span>Accept & Start Debate</span>
            </button>

            <button
              onClick={handleRejectMatch}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <UserX size={24} />
              <span>Decline</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            This match was found based on your selected topic
          </p>
        </div>
      </div>
    );
  }

  if (showDebate && isSearching) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 z-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center text-white mb-8">
            <Loader className="animate-spin mx-auto mb-6 text-emerald-400" size={72} />
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Finding Your Debate Partner
            </h2>
            <p className="text-gray-300 mb-4 text-lg">
              Matching you with someone passionate about:
            </p>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 rounded-full inline-block font-bold text-xl shadow-lg">
              {topic}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
              <div className="flex items-start space-x-3 mb-4">
                <Lightbulb className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-white font-semibold mb-2">Debate Tip</h3>
                  <p className="text-gray-300 text-sm leading-relaxed animate-fadeIn">
                    {DEBATE_TIPS[currentTip]}
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-1 mt-4">
                {DEBATE_TIPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentTip ? 'w-8 bg-emerald-500' : 'w-1 bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <WordPuzzle />
          </div>

          <div className="text-center">
            <button
              onClick={handleCancelSearch}
              className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
            >
              Cancel Search
            </button>
            <p className="text-gray-400 text-sm mt-4">
              Waiting for a match...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showDebate && error) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center text-white max-w-md px-6">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={handleCancelSearch}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <section id="start-debate" className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Debating?</h2>
        <p className="text-xl text-emerald-100 mb-8">
          Connect with a random stranger and practice your debate skills on any topic
        </p>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <label className="block text-left text-gray-700 font-semibold mb-2">
              Select Debate Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-500 text-gray-700"
            >
              <option value="">Choose a topic...</option>
              <option value="Politics">Politics</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Philosophy">Philosophy</option>
              <option value="Environment">Environment</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="General">General / Random</option>
            </select>
          </div>

          <button
            onClick={handleStartDebate}
            disabled={!topic}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-12 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-3 mx-auto transition-all duration-300 hover:-translate-y-1 shadow-lg"
          >
            <Video size={24} />
            <span>Start Debate Now</span>
          </button>

          <p className="text-sm text-gray-500 mt-4">
            You'll be matched with a random partner to debate on your selected topic
          </p>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Before you start:</h3>
          <ul className="text-emerald-100 text-left space-y-2">
            <li>✓ Make sure your camera and microphone are working</li>
            <li>✓ Choose a topic you're comfortable discussing</li>
            <li>✓ Be respectful and open-minded</li>
            <li>✓ Have fun and learn from each other!</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
