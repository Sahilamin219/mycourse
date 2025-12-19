import React, { useState, useEffect } from 'react';
import { Globe, Users, MessageSquare, Mic, Send, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CountryDebate {
  id: string;
  topic: string;
  description: string;
  debate_type: 'one_on_one' | 'group';
  max_participants: number;
  status: string;
  created_at: string;
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'voice';
  voice_url?: string;
  voice_duration_seconds?: number;
  created_at: string;
  username?: string;
  country_name?: string;
  country_code?: string;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
];

export default function CountryDebate() {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'create' | 'room'>('list');
  const [debates, setDebates] = useState<CountryDebate[]>([]);
  const [currentDebate, setCurrentDebate] = useState<CountryDebate | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isRecording, setIsRecording] = useState(false);

  const [newDebate, setNewDebate] = useState({
    topic: '',
    description: '',
    debate_type: 'one_on_one' as 'one_on_one' | 'group',
    max_participants: 2
  });

  useEffect(() => {
    if (view === 'list') {
      fetchDebates();
    }
  }, [view]);

  useEffect(() => {
    if (currentDebate) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [currentDebate]);

  const fetchDebates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/country-debates?status_filter=waiting`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDebates(data);
      }
    } catch (error) {
      console.error('Failed to fetch debates:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentDebate) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/country-debates/${currentDebate.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const createDebate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/country-debates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newDebate)
      });

      if (response.ok) {
        const debate = await response.json();
        await joinDebate(debate.id);
      }
    } catch (error) {
      console.error('Failed to create debate:', error);
    }
  };

  const joinDebate = async (debateId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/country-debates/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          debate_id: debateId,
          country_code: selectedCountry.code,
          country_name: selectedCountry.name
        })
      });

      if (response.ok) {
        const debate = debates.find(d => d.id === debateId);
        if (debate) {
          setCurrentDebate(debate);
          setView('room');
        }
      }
    } catch (error) {
      console.error('Failed to join debate:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentDebate) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/country-debates/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          debate_id: currentDebate.id,
          message: newMessage,
          message_type: 'text'
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const leaveDebate = () => {
    setCurrentDebate(null);
    setMessages([]);
    setView('list');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Country Representative Debates</h2>
          <p className="text-slate-300">Please sign in to participate in country debates</p>
        </div>
      </div>
    );
  }

  if (view === 'room' && currentDebate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentDebate.topic}</h2>
                <p className="text-slate-300">{currentDebate.description}</p>
              </div>
              <button
                onClick={leaveDebate}
                className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 h-96 overflow-y-auto mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 ${msg.user_id === user.id ? 'text-right' : 'text-left'}`}
                >
                  <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.user_id === user.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    <div className="text-xs opacity-75 mb-1">
                      {msg.country_name} - {msg.username}
                    </div>
                    <div>{msg.message}</div>
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-lg bg-slate-900/50 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 rounded-lg transition ${
                  isRecording
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Mic className="w-6 h-6" />
              </button>
              <button
                onClick={sendMessage}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <button
            onClick={() => setView('list')}
            className="mb-6 text-slate-300 hover:text-white transition"
          >
            ← Back to Debates
          </button>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Create New Debate</h2>

            <form onSubmit={createDebate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={newDebate.topic}
                  onChange={(e) => setNewDebate({ ...newDebate, topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Climate Change Policy"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newDebate.description}
                  onChange={(e) => setNewDebate({ ...newDebate, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the debate topic..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Debate Type
                </label>
                <select
                  value={newDebate.debate_type}
                  onChange={(e) => setNewDebate({
                    ...newDebate,
                    debate_type: e.target.value as 'one_on_one' | 'group',
                    max_participants: e.target.value === 'one_on_one' ? 2 : 4
                  })}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="one_on_one">1v1 Debate</option>
                  <option value="group">Group Debate</option>
                </select>
              </div>

              {newDebate.debate_type === 'group' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={newDebate.max_participants}
                    onChange={(e) => setNewDebate({ ...newDebate, max_participants: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Represent Country
                </label>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const country = COUNTRIES.find(c => c.code === e.target.value);
                    if (country) setSelectedCountry(country);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition"
              >
                Create Debate
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Country Representative Debates
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Represent your country in global discussions
          </p>

          <button
            onClick={() => setView('create')}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition"
          >
            Create New Debate
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {debates.map((debate) => (
            <div
              key={debate.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{debate.topic}</h3>
                  <p className="text-slate-300 text-sm mb-3">{debate.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {debate.debate_type === 'one_on_one' ? '1v1' : 'Group'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Max {debate.max_participants}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">
                  Represent as:
                </label>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const country = COUNTRIES.find(c => c.code === e.target.value);
                    if (country) setSelectedCountry(country);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => joinDebate(debate.id)}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Join Debate
              </button>
            </div>
          ))}
        </div>

        {debates.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No active debates. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
