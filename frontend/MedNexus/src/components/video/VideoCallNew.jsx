import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  LiveKitRoom, 
  VideoConference, 
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { PhoneOff, Video, Shield } from 'lucide-react';
import apiService from '../../services/api';
import './VideoCallNew.css';

const VideoCall = ({ appointmentId, onLeave, userType = 'patient' }) => {
  const [token, setToken] = useState('');
  const [wsURL, setWsURL] = useState('');
  const [roomName, setRoomName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantIdentity, setParticipantIdentity] = useState('');
  const [shouldConnect, setShouldConnect] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const roomRef = useRef(null);

  // Call duration timer
  useEffect(() => {
    if (!shouldConnect) return;
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [shouldConnect]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleEndCall = useCallback(async () => {
    try {
      if (roomRef.current) {
        await roomRef.current.disconnect();
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
    } finally {
      // Always call onLeave regardless of disconnect success
      onLeave?.();
    }
  }, [onLeave]);

  // Fetch token from backend when component mounts
  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the join-appointment endpoint
      const endpoint = userType === 'doctor' 
        ? '/api/livekit/join-appointment/doctor'
        : '/api/livekit/join-appointment';
      
      const result = await apiService.request(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          appointment_id: appointmentId,
          room_type: 'consultation'
        }),
      });
      
      // Ensure URL is properly formatted
      let wsUrl = result.url;
      if (wsUrl && !wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        if (wsUrl.includes('localhost') || wsUrl.includes('127.0.0.1')) {
          wsUrl = `ws://${wsUrl}`;
        } else {
          wsUrl = `wss://${wsUrl}`;
        }
      }
      
      console.log('LiveKit connection details:', {
        url: wsUrl,
        room: result.room_name,
        participant: result.participant_name
      });
      
      setToken(result.token);
      setWsURL(wsUrl);
      setRoomName(result.room_name);
      setParticipantName(result.participant_name);
      setParticipantIdentity(result.participant_identity);
      
      setTimeout(() => {
        setShouldConnect(true);
        setIsLoading(false);
      }, 100);
    } catch (err) {
      console.error('Error fetching token:', err);
      setError(err.message || 'Failed to join video call');
      setIsLoading(false);
      if (onLeave) {
        setTimeout(() => onLeave(), 2000);
      }
    }
  }, [appointmentId, userType, onLeave]);

  useEffect(() => {
    if (!token) {
      fetchToken();
    }
  }, [token, fetchToken]);

  const handleError = (error) => {
    console.error('LiveKit error:', error);
    setError(error.message || 'Connection error occurred');
  };

  const handleConnected = (room) => {
    console.log('Connected to room:', roomName);
    roomRef.current = room;
    setError(null);
  };

  const handleDisconnected = (reason) => {
    console.log('Disconnected from room:', reason);
    roomRef.current = null;
    
    // Always call onLeave when disconnected
    if (onLeave) {
      onLeave();
    }
  };

  if (isLoading) {
    return (
      <div className="video-call-loading">
        <div className="loading-spinner"></div>
        <p>Connecting to video call...</p>
        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
          <Shield size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Secure connection
        </span>
      </div>
    );
  }

  if (error && !shouldConnect) {
    return (
      <div className="video-call-loading">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={onLeave} className="error-close-btn">
          Close
        </button>
      </div>
    );
  }

  if (!token || !wsURL || !roomName) {
    return (
      <div className="video-call-loading">
        <div className="loading-spinner"></div>
        <p>Preparing video call...</p>
      </div>
    );
  }

  return (
    <div className="video-call-container-new">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={wsURL}
        connect={shouldConnect}
        onError={handleError}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        options={{
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            videoCodec: 'vp8',
            videoEncoding: {
              maxBitrate: 1_500_000,
            },
          },
          reconnectAttempts: 5,
          reconnectAttemptDelay: 2000,
        }}
        data-lk-theme="default"
      >
        <VideoConference chatMessageFormatter={undefined} />
        <RoomAudioRenderer />
        
        {/* Custom header with professional design */}
        <div className="video-call-header-new">
          <div className="room-info-new">
            <div className="room-info-text">
              <span className="room-name-new">
                <Video size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Medical Consultation
              </span>
              <span className="participant-name-new">{participantName} • {formatDuration(callDuration)}</span>
            </div>
          </div>
          
          <div className="call-status">
            <div className="call-status-dot"></div>
            <span className="call-status-text">Live</span>
          </div>
          
          <button onClick={handleEndCall} className="leave-call-btn-new">
            <PhoneOff size={18} />
            <span>End Call</span>
          </button>
        </div>

        {error && (
          <div className="video-call-error-banner">
            <span>{error}</span>
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
};

export default VideoCall;

