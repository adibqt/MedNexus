import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import apiService from '../services/api';
import CallNotification from '../components/video/CallNotification';
import VideoCall from '../components/video/VideoCallNew';
import '../components/video/VideoCallNew.css';

const VideoCallContext = createContext(null);

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

export const VideoCallProvider = ({ children, userId, userType, userName, appointments = [] }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [fetchedAppointments, setFetchedAppointments] = useState([]);
  const pollingIntervalRef = useRef(null);
  const checkedRoomsRef = useRef(new Set());
  const isFetchingRef = useRef(false);

  // Fetch appointments once if not provided
  useEffect(() => {
    if (!userId || !userType) return;
    if (appointments && appointments.length > 0) {
      console.log('[VideoCallContext] Using provided appointments:', appointments.length);
      return;
    }
    if (fetchedAppointments.length > 0) return; // Already fetched
    if (isFetchingRef.current) return; // Currently fetching

    console.log('[VideoCallContext] Fetching appointments for notifications...');
    const fetchAppointments = async () => {
      isFetchingRef.current = true;
      try {
        const data = userType === 'doctor' 
          ? await apiService.getDoctorAppointments()
          : await apiService.getPatientAppointments();
        console.log('[VideoCallContext] Fetched appointments:', data?.length || 0);
        setFetchedAppointments(data || []);
      } catch (error) {
        console.error('[VideoCallContext] Error fetching appointments for notifications:', error);
        setFetchedAppointments([]);
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchAppointments();
  }, [userId, userType, appointments.length, fetchedAppointments.length]);

  // Use provided appointments or fetched appointments
  const appointmentsToUse = appointments.length > 0 ? appointments : fetchedAppointments;

  // Poll for active rooms to show notifications using React Hook pattern
  useEffect(() => {
    if (!userId || !userType) return;
    
    // Don't poll if we don't have appointments yet
    if (!appointmentsToUse || appointmentsToUse.length === 0) return;

    const checkActiveRooms = async () => {
      console.log('[VideoCallContext] Checking active rooms...', {
        appointmentsCount: appointmentsToUse.length,
        userType,
        userId
      });
      
      // Only check confirmed appointments
      const confirmedAppointments = appointmentsToUse.filter(
        apt => apt.status?.toLowerCase() === 'confirmed'
      );
      
      console.log('[VideoCallContext] Confirmed appointments:', confirmedAppointments.length);
      
      // No confirmed appointments, nothing to check
      if (confirmedAppointments.length === 0) return;

      let foundActiveRoom = false;

      for (const appointment of confirmedAppointments) {
        // Skip if we're already in this call
        if (activeCall && activeCall.appointmentId === appointment.id) {
          // Clear notification if we're in the call
          if (incomingCall && incomingCall.appointment_id === appointment.id) {
            setIncomingCall(null);
          }
          continue;
        }

        try {
          console.log(`[VideoCallContext] Checking room status for appointment ${appointment.id}`);
          const response = await apiService.checkRoomStatus(appointment.id, userType === 'doctor');
          console.log(`[VideoCallContext] Room status response:`, response);
          
          if (response.is_active && response.participant_count > 0) {
            // Someone is in the room! Show notification
            const callerName = userType === 'patient' 
              ? appointment.doctor_name || 'Doctor'
              : appointment.patient_name || 'Patient';
            
            console.log('[VideoCallContext] Active room found!', {
              appointmentId: appointment.id,
              callerName,
              participantCount: response.participant_count
            });
            
            // Only update if it's a different appointment or we don't have a notification
            if (!incomingCall || incomingCall.appointment_id !== appointment.id) {
              const callData = {
                type: 'incoming_call',
                appointment_id: appointment.id,
                [userType === 'patient' ? 'doctor_name' : 'patient_name']: callerName,
                [userType === 'patient' ? 'doctor_id' : 'patient_id']: userType === 'patient' ? appointment.doctor_id : appointment.patient_id,
                room_name: response.room_name,
                timestamp: new Date().toISOString()
              };
              console.log('[VideoCallContext] Setting incoming call notification:', callData);
              setIncomingCall(callData);
            }
            
            foundActiveRoom = true;
            break; // Only show one notification at a time
          } else {
            // Room is empty, clear notification if it's for this appointment
            if (incomingCall && incomingCall.appointment_id === appointment.id) {
              setIncomingCall(null);
            }
          }
        } catch (error) {
          // Silently fail on room status checks to avoid spamming console
          // Only log if it's an actual error, not a 404
          if (error?.status !== 404) {
            console.error(`Error checking room status for appointment ${appointment.id}:`, error);
          }
        }
      }

      // If no active rooms found and we have a notification, verify it's still valid
      if (!foundActiveRoom && incomingCall) {
        setIncomingCall(null);
      }
    };

    // Start polling immediately (don't delay - we want notifications ASAP)
    checkActiveRooms();
    
    // Poll every 5 seconds (reduced frequency to improve performance)
    pollingIntervalRef.current = setInterval(checkActiveRooms, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userId, userType, appointmentsToUse.length, activeCall?.appointmentId, incomingCall?.appointment_id]);

  const initiateCall = useCallback(async (appointmentId) => {
    try {
      setIsConnecting(true);
      
      // First, call the initiate endpoint to send notification to the other party
      if (userType === 'doctor') {
        await apiService.initiateCallDoctor(appointmentId);
      } else {
        await apiService.initiateCall(appointmentId);
      }
      
      // Set active call - the VideoCall component will fetch the token itself
      setActiveCall({
        appointmentId,
        // The new component will fetch token itself
      });
      
      setIsConnecting(false);
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to initiate call. Please try again.');
      setIsConnecting(false);
    }
  }, [userType]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      setIsConnecting(true);
      
      // Use the new join-appointment endpoint (following guide)
      setActiveCall({
        appointmentId: incomingCall.appointment_id,
        // The new component will fetch token itself
      });
      
      setIncomingCall(null);
      setIsConnecting(false);
    } catch (error) {
      console.error('Error accepting call:', error);
      alert('Failed to accept call. Please try again.');
      setIsConnecting(false);
    }
  }, [incomingCall, userId, userType, userName]);

  const declineCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  // Debug log when incomingCall changes
  useEffect(() => {
    console.log('[VideoCallContext] incomingCall state changed:', incomingCall);
  }, [incomingCall]);

  const endCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const value = useMemo(() => ({
    incomingCall,
    activeCall,
    isConnecting,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
  }), [incomingCall, activeCall, isConnecting, initiateCall, acceptCall, declineCall, endCall]);

  return (
    <VideoCallContext.Provider value={value}>
      {children}
      {incomingCall && (
        <CallNotification
          callData={incomingCall}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}
      {isConnecting && (
        <div className="video-call-connecting-overlay">
          <div className="connecting-popup">
            <div className="connecting-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <h3>Connecting to video call...</h3>
            <p>Please wait while we set up your consultation</p>
          </div>
        </div>
      )}
      {activeCall && (
        <VideoCall
          key={`appointment-${activeCall.appointmentId}`}
          appointmentId={activeCall.appointmentId}
          onLeave={endCall}
          userType={userType}
        />
      )}
    </VideoCallContext.Provider>
  );
};

export default VideoCallContext;

