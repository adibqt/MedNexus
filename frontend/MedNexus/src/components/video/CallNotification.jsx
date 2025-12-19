import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import './CallNotification.css';

const CallNotification = ({ callData, onAccept, onDecline }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!callData) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callData]);

  if (!callData) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="call-notification"
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.8 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="call-notification-content">
          <div className="call-notification-header">
            <div className="call-notification-avatar">
              <Video size={24} />
            </div>
            <div className="call-notification-info">
              <h3>Incoming Video Call</h3>
              <p>{callData.patient_name || callData.doctor_name}</p>
            </div>
          </div>

          <div className="call-notification-timer">
            <span>{formatTime(timeElapsed)}</span>
          </div>

          <div className="call-notification-actions">
            <button
              className="call-notification-btn accept"
              onClick={onAccept}
              aria-label="Accept call"
            >
              <Phone size={20} />
              <span>Accept</span>
            </button>
            <button
              className="call-notification-btn decline"
              onClick={onDecline}
              aria-label="Decline call"
            >
              <PhoneOff size={20} />
              <span>Decline</span>
            </button>
          </div>
        </div>

        <div className="call-notification-ring">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallNotification;

