import { useState } from 'react';
import { VideoCall } from './VideoCall';
import { useWebRTC } from '../hooks/useWebRTC';
import { Video, Loader, AlertCircle } from 'lucide-react';

interface DebateRoomProps {
  selectedTopic?: string;
}

export function DebateRoom({ selectedTopic }: DebateRoomProps) {
  const [showDebate, setShowDebate] = useState(false);
  const [topic, setTopic] = useState(selectedTopic || '');

  const {
    localStream,
    remoteStream,
    isSearching,
    isConnected,
    error,
    startSearch,
    cancelSearch,
    endCall,
  } = useWebRTC();

  const handleStartDebate = () => {
    if (!topic) {
      alert('Please select a debate topic');
      return;
    }
    setShowDebate(true);
    startSearch(topic);
  };

  const handleEndCall = () => {
    endCall();
    setShowDebate(false);
  };

  const handleCancelSearch = () => {
    cancelSearch();
    setShowDebate(false);
  };

  if (showDebate && isConnected) {
    return (
      <VideoCall
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={handleEndCall}
        topic={topic}
      />
    );
  }

  if (showDebate && isSearching) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-center text-white max-w-md px-6">
          <div className="mb-8">
            <Loader className="animate-spin mx-auto mb-4" size={64} />
            <h2 className="text-3xl font-bold mb-4">Finding Debate Partner...</h2>
            <p className="text-gray-300 mb-2">
              We're matching you with someone who wants to debate about:
            </p>
            <div className="bg-emerald-500 px-6 py-3 rounded-full inline-block font-semibold">
              {topic}
            </div>
          </div>
          <button
            onClick={handleCancelSearch}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel Search
          </button>
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
