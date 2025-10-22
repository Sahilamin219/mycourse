import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, FileText, Save } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
  topic?: string;
  sessionId?: string;
}

export function VideoCall({ localStream, remoteStream, onEndCall, topic, sessionId }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { isListening, transcripts, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteStream) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [remoteStream]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const saveTranscripts = async () => {
    if (!sessionId || transcripts.length === 0) return;

    setIsSaving(true);
    try {
      const transcriptRecords = transcripts.map(t => ({
        session_id: sessionId,
        speaker: t.speaker,
        text: t.text,
        timestamp: t.timestamp.toISOString(),
      }));

      const { error } = await supabase
        .from('debate_transcripts')
        .insert(transcriptRecords);

      if (error) throw error;

      alert('Transcripts saved successfully!');
    } catch (error) {
      console.error('Error saving transcripts:', error);
      alert('Failed to save transcripts');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <div className="h-full flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <MessageSquare size={24} />
            <span className="font-bold text-lg">DebateHub</span>
          </div>
          {topic && (
            <div className="bg-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">
              Topic: {topic}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <FileText size={16} />
              <span>{showTranscript ? 'Hide' : 'Show'} Transcript</span>
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex gap-4 p-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video size={48} />
                    </div>
                    <p className="text-lg font-medium">Waiting for opponent...</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
                Opponent
              </div>
            </div>

            <div className="relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                    <VideoOff size={48} className="text-white" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
                You {isListening && <span className="ml-2 text-red-400">● Recording</span>}
              </div>
            </div>
          </div>

          {showTranscript && (
            <div className="w-96 bg-gray-800 rounded-xl p-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Live Transcript</h3>
                <button
                  onClick={saveTranscripts}
                  disabled={isSaving || transcripts.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {transcripts.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center mt-8">
                    Start speaking to see the transcript...
                  </p>
                ) : (
                  transcripts.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        t.speaker === 'user' ? 'bg-emerald-900/50' : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-emerald-400">
                          {t.speaker === 'user' ? 'You' : 'Opponent'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {t.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-white">{t.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 px-6 py-6">
          <div className="max-w-md mx-auto flex items-center justify-center space-x-4">
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all duration-300 ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all duration-300 ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

            <button
              onClick={onEndCall}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
