import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { rtcLogger } from '../utils/logger';

const SOCKET_URL = 'https://mycourse-32jb.onrender.com/';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export interface MatchRequest {
  partnerId: string;
  partnerEmail: string;
  topic: string;
}

export function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchRequest, setMatchRequest] = useState<MatchRequest | null>(null);
  const [socketInitialized, setSocketInitialized] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const partnerIdRef = useRef<string | null>(null);
  const pendingMatchRef = useRef<MatchRequest | null>(null);

  const initializeSocket = () => {
    if (socketRef.current || socketInitialized) return;

    rtcLogger.info('Initializing WebRTC socket connection', { socketUrl: SOCKET_URL });
    setSocketInitialized(true);
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current.on('connected', (data) => {
      rtcLogger.info('Connected to signaling server', { sessionId: data.sid });
    });

    socketRef.current.on('match-request', (data: MatchRequest) => {
      rtcLogger.info('Match request received', { partnerId: data.partnerId, topic: data.topic });
      pendingMatchRef.current = data;
      setMatchRequest(data);
    });

    socketRef.current.on('match-found', async (data) => {
      rtcLogger.info('Match found, establishing connection', { partnerId: data.partnerId, initiator: data.initiator });
      partnerIdRef.current = data.partnerId;
      setIsSearching(false);
      setIsConnected(true);
      setMatchRequest(null);

      await setupPeerConnection(data.initiator);
    });

    socketRef.current.on('match-rejected', () => {
      rtcLogger.info('Match was rejected, continuing search');
      setMatchRequest(null);
      pendingMatchRef.current = null;
      setIsSearching(true);
    });

    socketRef.current.on('waiting', (data) => {
      rtcLogger.debug('Waiting for match', { message: data.message });
    });

    socketRef.current.on('offer', async (data) => {
      rtcLogger.debug('Received WebRTC offer', { sender: data.sender });
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socketRef.current?.emit('answer', {
          target: data.sender,
          answer: answer,
        });
        rtcLogger.debug('Sent WebRTC answer', { target: data.sender });
      }
    });

    socketRef.current.on('answer', async (data) => {
      rtcLogger.debug('Received WebRTC answer', { sender: data.sender });
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }
    });

    socketRef.current.on('ice_candidate', async (data) => {
      rtcLogger.debug('Received ICE candidate', { sender: data.sender });
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (e) {
          rtcLogger.error('Error adding ICE candidate', e);
        }
      }
    });

    socketRef.current.on('peer-disconnected', () => {
      rtcLogger.info('Peer disconnected');
      cleanup();
    });

    socketRef.current.on('peer-left', () => {
      rtcLogger.info('Peer left the room');
      cleanup();
    });

  };

  useEffect(() => {
    return () => {
      cleanup();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const setupPeerConnection = async (initiator: boolean) => {
    rtcLogger.info('Setting up peer connection', { initiator });
    try {
      rtcLogger.debug('Requesting user media access');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      rtcLogger.info('Media access granted', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      setLocalStream(stream);

      const peerConnection = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        rtcLogger.info('Received remote track', { streamId: event.streams[0]?.id });
        setRemoteStream(event.streams[0]);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          rtcLogger.debug('Sending ICE candidate to peer');
          socketRef.current?.emit('ice_candidate', {
            target: partnerIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        rtcLogger.info('Connection state changed', { state: peerConnection.connectionState });
        if (peerConnection.connectionState === 'disconnected') {
          cleanup();
        }
      };

      if (initiator) {
        rtcLogger.debug('Creating and sending WebRTC offer');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socketRef.current?.emit('offer', {
          target: partnerIdRef.current,
          offer: offer,
        });
      }
    } catch (err) {
      rtcLogger.error('Error setting up peer connection', err);
      setError('Failed to access camera/microphone');
    }
  };

  const startSearch = (topic: string = 'general', email: string = 'Anonymous') => {
    rtcLogger.info('Starting debate partner search', { topic, email });
    initializeSocket();
    setIsSearching(true);
    setError(null);
    setTimeout(() => {
      socketRef.current?.emit('find_match', { topic, email });
      rtcLogger.debug('Find match request sent', { topic });
    }, 100);
  };

  const acceptMatch = () => {
    if (pendingMatchRef.current) {
      rtcLogger.info('Accepting match', { partnerId: pendingMatchRef.current.partnerId });
      socketRef.current?.emit('accept_match', {
        partnerId: pendingMatchRef.current.partnerId
      });
      setMatchRequest(null);
    }
  };

  const rejectMatch = () => {
    if (pendingMatchRef.current) {
      rtcLogger.info('Rejecting match', { partnerId: pendingMatchRef.current.partnerId });
      socketRef.current?.emit('reject_match', {
        partnerId: pendingMatchRef.current.partnerId
      });
      setMatchRequest(null);
      pendingMatchRef.current = null;
    }
  };

  const cancelSearch = () => {
    rtcLogger.info('Cancelling debate partner search');
    setIsSearching(false);
    setMatchRequest(null);
    socketRef.current?.emit('cancel_search', {});
  };

  const endCall = () => {
    rtcLogger.info('Ending video call');
    socketRef.current?.emit('leave_room', {});
    cleanup();
  };

  const cleanup = () => {
    rtcLogger.debug('Cleaning up WebRTC resources');
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    partnerIdRef.current = null;
    setIsConnected(false);
    setIsSearching(false);
    rtcLogger.info('WebRTC cleanup complete');
  };

  return {
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
  };
}
