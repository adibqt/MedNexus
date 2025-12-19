import { useEffect, useState, useRef } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';
import './VideoCall.css';

const VideoCall = ({ token, url, roomName, participantName, onLeave, isDoctor = false }) => {
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const onLeaveRef = useRef(onLeave);
  const roomRef = useRef(null);
  
  // Keep onLeave ref updated without causing re-renders
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    let isMounted = true;
    let currentRoom = null;
    let connecting = false;

    const connectToRoom = async () => {
      // Prevent multiple simultaneous connections
      if (connecting || (roomRef.current && roomRef.current.state !== 'disconnected')) {
        console.log('Already connecting or connected, skipping');
        return;
      }

      connecting = true;

      try {
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          // Add connection options
          publishDefaults: {
            videoCodec: 'vp8',
            videoEncoding: {
              maxBitrate: 1_500_000,
            },
          },
        });

        currentRoom = newRoom;

        newRoom.on(RoomEvent.Connected, async () => {
          if (!isMounted || currentRoom !== newRoom) return;
          console.log('Connected to room');
          setIsConnected(true);
          connecting = false;
          
          // Wait for connection to fully stabilize before enabling media
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!isMounted || currentRoom !== newRoom || newRoom.state !== 'connected') return;
            
            // Check if we can access media devices
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const hasVideo = devices.some(device => device.kind === 'videoinput');
              const hasAudio = devices.some(device => device.kind === 'audioinput');
              
              console.log('Available devices:', { hasVideo, hasAudio });
              
              // Enable camera and microphone separately with error handling
              if (hasVideo) {
                try {
                  await newRoom.localParticipant.setCameraEnabled(true);
                  console.log('Camera enabled successfully');
                } catch (error) {
                  console.error('Error enabling camera:', error);
                  alert('Could not access camera. Please check permissions and ensure no other application is using it.');
                }
              } else {
                console.warn('No video input device found');
              }
              
              if (hasAudio) {
                try {
                  await newRoom.localParticipant.setMicrophoneEnabled(true);
                  console.log('Microphone enabled successfully');
                } catch (error) {
                  console.error('Error enabling microphone:', error);
                  alert('Could not access microphone. Please check permissions and ensure no other application is using it.');
                }
              } else {
                console.warn('No audio input device found');
              }
            } catch (deviceError) {
              console.error('Error checking media devices:', deviceError);
              // Try to enable anyway
              try {
                await newRoom.localParticipant.enableCameraAndMicrophone();
              } catch (error) {
                console.error('Error enabling camera/microphone:', error);
                alert('Could not access camera/microphone. Please check browser permissions.');
              }
            }
          } catch (error) {
            console.error('Error enabling camera/microphone:', error);
          }
        });

        newRoom.on(RoomEvent.Disconnected, (reason) => {
          if (!isMounted || currentRoom !== newRoom) return;
          console.log('Disconnected from room, reason:', reason);
          connecting = false;
          setIsConnected(false);
          setRemoteParticipants([]);
          if (roomRef.current === newRoom) {
            roomRef.current = null;
          }
          // Only call onLeave if it was an unexpected disconnect
          // Reason 2 = CLIENT_INITIATED (user clicked leave)
          if (reason !== 2 && reason !== 'CLIENT_INITIATED' && onLeaveRef.current) {
            setTimeout(() => {
              if (onLeaveRef.current) onLeaveRef.current();
            }, 100);
          }
        });

        newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
          if (!isMounted || currentRoom !== newRoom) return;
          console.log('Participant connected:', participant.identity);
          setRemoteParticipants((prev) => {
            if (!prev.find((p) => p.identity === participant.identity)) {
              return [...prev, participant];
            }
            return prev;
          });
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
          if (!isMounted) return;
          console.log('Participant disconnected:', participant.identity);
          setRemoteParticipants((prev) => prev.filter((p) => p.identity !== participant.identity));
        });

        newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (!isMounted || currentRoom !== newRoom) return;
          if (track.kind === Track.Kind.Video) {
            const videoElement = remoteVideoRef.current;
            if (videoElement) {
              track.attach(videoElement);
            }
          } else if (track.kind === Track.Kind.Audio) {
            track.attach();
          }
        });

        newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach();
        });

        newRoom.on(RoomEvent.LocalTrackPublished, (publication, participant) => {
          if (!isMounted || currentRoom !== newRoom) return;
          if (publication.track && publication.track.kind === Track.Kind.Video) {
            const videoElement = localVideoRef.current;
            if (videoElement) {
              publication.track.attach(videoElement);
            }
          }
        });

        newRoom.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
          if (participant && participant.isLocal) {
            console.log('Connection quality:', quality);
          }
        });

        // Connect with timeout
        const connectPromise = newRoom.connect(url, token);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        
        if (!isMounted) {
          // Component unmounted during connection, disconnect
          await newRoom.disconnect();
          return;
        }
        
        if (currentRoom === newRoom && isMounted) {
          roomRef.current = newRoom;
          setRoom(newRoom);
        }
      } catch (error) {
        connecting = false;
        console.error('Error connecting to room:', error);
        if (isMounted) {
          alert(`Failed to connect to video call: ${error.message || 'Please check your internet connection and try again.'}`);
          if (onLeaveRef.current) {
            setTimeout(() => {
              if (onLeaveRef.current) onLeaveRef.current();
            }, 100);
          }
        }
      }
    };

    // Only connect if we don't have a room or the room is disconnected
    if (token && url && roomName && (!roomRef.current || roomRef.current.state === 'disconnected')) {
      connectToRoom();
    }

    return () => {
      isMounted = false;
      connecting = false;
      // Only disconnect if this is the current room and we're actually unmounting
      // Check if token/url/roomName changed (which would mean we want a new connection)
      if (currentRoom && currentRoom === roomRef.current && currentRoom.state !== 'disconnected') {
        // Only disconnect if the connection params changed (new call) or component is unmounting
        const shouldDisconnect = !token || !url || !roomName;
        if (shouldDisconnect) {
          console.log('Cleaning up room connection - params changed or unmounting');
          currentRoom.disconnect().catch(console.error);
          roomRef.current = null;
        }
      }
    };
  }, [token, url, roomName]); // Removed onLeave and room from dependencies to prevent re-renders

  const toggleMute = async () => {
    if (room) {
      if (isMuted) {
        await room.localParticipant.setMicrophoneEnabled(true);
      } else {
        await room.localParticipant.setMicrophoneEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (room) {
      if (isVideoOff) {
        await room.localParticipant.setCameraEnabled(true);
      } else {
        await room.localParticipant.setCameraEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleLeave = async () => {
    if (room && room.state !== 'disconnected') {
      try {
        await room.disconnect();
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
    if (onLeaveRef.current) onLeaveRef.current();
  };

  if (!isConnected) {
    return (
      <div className="video-call-loading">
        <div className="loading-spinner"></div>
        <p>Connecting to video call...</p>
      </div>
    );
  }

  return (
    <div className={`video-call-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="video-call-header">
        <div className="video-call-title">
          <h3>Video Call - {roomName}</h3>
          <span className="video-call-status">
            <span className="status-dot"></span>
            Connected
          </span>
        </div>
        <button
          className="video-call-minimize-btn"
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={isMinimized ? 'Maximize' : 'Minimize'}
        >
          {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className="video-call-content">
            <div className="video-call-main">
              <div className="remote-video-container">
                {remoteParticipants.length > 0 ? (
                  remoteParticipants.map((participant) => (
                    <div key={participant.identity} className="remote-video-wrapper">
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="remote-video"
                      />
                      <div className="participant-name">
                        {participant.name || participant.identity}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="waiting-for-participant">
                    <div className="waiting-icon">
                      <Video size={48} />
                    </div>
                    <p>Waiting for participant to join...</p>
                  </div>
                )}
              </div>

              <div className="local-video-container">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="local-video"
                />
                <div className="local-participant-name">{participantName}</div>
              </div>
            </div>
          </div>

          <div className="video-call-controls">
            <button
              className={`control-btn ${isMuted ? 'active' : ''}`}
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              className={`control-btn ${isVideoOff ? 'active' : ''}`}
              onClick={toggleVideo}
              aria-label={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              <span>{isVideoOff ? 'Camera On' : 'Camera Off'}</span>
            </button>

            <button
              className="control-btn leave"
              onClick={handleLeave}
              aria-label="Leave call"
            >
              <PhoneOff size={20} />
              <span>Leave</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCall;

