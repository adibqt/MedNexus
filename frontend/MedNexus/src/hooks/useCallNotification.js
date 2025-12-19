import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

/**
 * Custom React Hook for polling-based call notifications.
 * Polls for active video rooms and shows notifications when someone joins.
 * 
 * @param {string} userId - The current user's ID
 * @param {string} userType - 'patient' or 'doctor'
 * @param {Array} appointments - Array of appointments to check
 * @param {Object} activeCall - Currently active call object (to avoid duplicate notifications)
 * @returns {Object} - notification state and control functions
 */
export const useCallNotification = (userId, userType, appointments = [], activeCall = null) => {
  const [notification, setNotification] = useState(null);
  const pollingIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastNotificationIdRef = useRef(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          playSound(ctx);
        });
      } else {
        playSound(ctx);
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  const playSound = (ctx) => {
    const now = ctx.currentTime;
    
    // Create oscillator for a pleasant notification sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Two-tone notification sound
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.setValueAtTime(1000, now + 0.1);
    
    // Fade in and out
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.15);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.25);
    
    oscillator.start(now);
    oscillator.stop(now + 0.25);
    
    console.log('Notification sound played');
  };

  const checkActiveRooms = useCallback(async () => {
    if (!userId || !userType) return;
    
    // Don't check if we don't have appointments
    if (!appointments || appointments.length === 0) return;

    // Only check confirmed appointments
    const confirmedAppointments = appointments.filter(
      apt => apt.status?.toLowerCase() === 'confirmed'
    );
    
    // No confirmed appointments, nothing to check
    if (confirmedAppointments.length === 0) return;

    let foundActiveRoom = false;

    for (const appointment of confirmedAppointments) {
      // Skip if we're already in this call
      if (activeCall && activeCall.appointmentId === appointment.id) {
        // Clear notification if we're in the call
        if (notification && notification.appointmentId === appointment.id) {
          setNotification(null);
        }
        continue;
      }

      try {
        const response = await apiService.checkRoomStatus(appointment.id, userType === 'doctor');
        
        if (response.is_active && response.participant_count > 0) {
          // Someone is in the room! Show notification
          const callerName = userType === 'patient' 
            ? appointment.doctor_name || 'Doctor'
            : appointment.patient_name || 'Patient';
          
          // Only update if it's a different appointment or we don't have a notification
          if (!notification || notification.appointmentId !== appointment.id) {
            const newNotificationId = `${appointment.id}_${response.timestamp || Date.now()}`;
            
            // Only play sound if this is truly a new notification
            if (lastNotificationIdRef.current !== newNotificationId) {
              console.log('Playing notification sound for appointment:', appointment.id);
              playNotificationSound();
              lastNotificationIdRef.current = newNotificationId;
            }
            
            setNotification({
              callerName,
              callerType: userType === 'patient' ? 'doctor' : 'patient',
              appointmentId: appointment.id,
              appointment,
              roomName: response.room_name,
              timestamp: new Date().toISOString()
            });
          }
          
          foundActiveRoom = true;
          break; // Only show one notification at a time
        } else {
          // Room is empty, clear notification if it's for this appointment
          if (notification && notification.appointmentId === appointment.id) {
            setNotification(null);
          }
        }
      } catch (error) {
        // Silently fail on room status checks to avoid spamming console
        if (error?.status !== 404) {
          console.error(`Error checking room status for appointment ${appointment.id}:`, error);
        }
      }
    }

    // If no active rooms found and we have a notification, clear it
    if (!foundActiveRoom && notification) {
      setNotification(null);
      lastNotificationIdRef.current = null;
    }
  }, [userId, userType, appointments.length, activeCall?.appointmentId, notification?.appointmentId, playNotificationSound]);

  useEffect(() => {
    if (!userId || !userType || !appointments || appointments.length === 0) return;

    // Delay initial check to not block dashboard loading
    const initialTimeout = setTimeout(checkActiveRooms, 2000);
    
    // Poll every 5 seconds (reduced frequency to improve performance)
    pollingIntervalRef.current = setInterval(checkActiveRooms, 5000);

    return () => {
      clearTimeout(initialTimeout);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [checkActiveRooms]);

  const dismissNotification = useCallback(() => {
    setNotification(null);
    lastNotificationIdRef.current = null;
  }, []);

  return { 
    notification, 
    dismissNotification
  };
};

export default useCallNotification;

