import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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

    setSocketInitialized(true);
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current.on('connected', (data) => {
      console.log('Connected to signaling server:', data.sid);
    });

    socketRef.current.on('match-request', (data: MatchRequest) => {
      console.log('Match request received:', data);
      pendingMatchRef.current = data;
      setMatchRequest(data);
    });

    socketRef.current.on('match-found', async (data) => {
      console.log('Match found:', data);
      partnerIdRef.current = data.partnerId;
      setIsSearching(false);
      setIsConnected(true);
      setMatchRequest(null);

      await setupPeerConnection(data.initiator);
    });

    socketRef.current.on('match-rejected', () => {
      console.log('Match was rejected');
      setMatchRequest(null);
      pendingMatchRef.current = null;
      setIsSearching(true);
    });

    socketRef.current.on('waiting', (data) => {
      console.log(data.message);
    });

    socketRef.current.on('offer', async (data) => {
      console.log('Received offer from:', data.sender);
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
      }
    });

    socketRef.current.on('answer', async (data) => {
      console.log('Received answer from:', data.sender);
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }
    });

    socketRef.current.on('ice_candidate', async (data) => {
      console.log('Received ICE candidate from:', data.sender);
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    });

    socketRef.current.on('peer-disconnected', () => {
      console.log('Peer disconnected');
      cleanup();
    });

    socketRef.current.on('peer-left', () => {
      console.log('Peer left the room');
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      const peerConnection = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        console.log('Received remote track');
        setRemoteStream(event.streams[0]);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('ice_candidate', {
            target: partnerIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected') {
          cleanup();
        }
      };

      if (initiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socketRef.current?.emit('offer', {
          target: partnerIdRef.current,
          offer: offer,
        });
      }
    } catch (err) {
      console.error('Error setting up peer connection:', err);
      setError('Failed to access camera/microphone');
    }
  };

  const startSearch = (topic: string = 'general', email: string = 'Anonymous') => {
    initializeSocket();
    setIsSearching(true);
    setError(null);
    setTimeout(() => {
      socketRef.current?.emit('find_match', { topic, email });
    }, 100);
  };

  const acceptMatch = () => {
    if (pendingMatchRef.current) {
      socketRef.current?.emit('accept_match', {
        partnerId: pendingMatchRef.current.partnerId
      });
      setMatchRequest(null);
    }
  };

  const rejectMatch = () => {
    if (pendingMatchRef.current) {
      socketRef.current?.emit('reject_match', {
        partnerId: pendingMatchRef.current.partnerId
      });
      setMatchRequest(null);
      pendingMatchRef.current = null;
    }
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setMatchRequest(null);
    socketRef.current?.emit('cancel_search', {});
  };

  const endCall = () => {
    socketRef.current?.emit('leave_room', {});
    cleanup();
  };

  const cleanup = () => {
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
