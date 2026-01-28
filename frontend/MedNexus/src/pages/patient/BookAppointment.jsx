import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './BookAppointment.css';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const { isAuthenticated } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      const returnTo = `/patient/book-appointment/${doctorId}`;
      navigate('/sign-in/patient?redirect=' + encodeURIComponent(returnTo), { replace: true });
      return;
    }

    const loadDoctor = async () => {
      try {
        setLoading(true);
        const doctors = await apiService.getPublicDoctors();
        const foundDoctor = doctors.find(d => d.id === parseInt(doctorId));
        if (!foundDoctor) {
          setError('Doctor not found');
          return;
        }
        setDoctor(foundDoctor);
      } catch (err) {
        setError(err.message || 'Failed to load doctor information');
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [doctorId, isAuthenticated, navigate]);

  useEffect(() => {
    if (doctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [doctor, selectedDate]);

  const loadAvailableSlots = async () => {
    if (!doctor) return;
    try {
      setLoadingSlots(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slots = await apiService.getAvailableSlots(doctor.id, dateStr);
      setAvailableSlots(slots);
      setSelectedSlot(null);
    } catch (err) {
      setError(err.message || 'Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const time = typeof timeStr === 'string' ? timeStr : timeStr;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const appointmentData = {
        doctor_id: doctor.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedSlot.time,
        reason: reason.trim() || null,
        symptoms: symptoms.trim() || null,
      };

      await apiService.bookAppointment(appointmentData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="book-appointment-page">
        <div className="book-appointment-loading">
          <div className="book-appointment-spinner" />
        </div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="book-appointment-page">
        <div className="book-appointment-error">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/patient/dashboard')} className="book-appointment-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="book-appointment-page">
        <div className="book-appointment-success">
          <CheckCircle2 size={64} />
          <h2>Appointment Booked!</h2>
          <p>Your appointment request has been submitted. The doctor will confirm it shortly.</p>
        </div>
      </div>
    );
  }

  const nextDays = getNextDays();
  const selectedSlots = availableSlots.filter(slot => slot.date === selectedDate.toISOString().split('T')[0]);

  return (
    <div className="book-appointment-page">
      <div className="book-appointment-container">
        {/* Header */}
        <div className="book-appointment-header">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="book-appointment-back-btn"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="book-appointment-title">Book Appointment</h1>
        </div>

        {/* Doctor Info */}
        {doctor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="book-appointment-doctor-card"
          >
            <div className="book-appointment-doctor-avatar">
              {doctor.profile_picture ? (
                <img src={apiService.getProfilePictureUrl(doctor.profile_picture)} alt={doctor.name} />
              ) : (
                <User size={32} />
              )}
            </div>
            <div className="book-appointment-doctor-info">
              <h2 className="book-appointment-doctor-name">Dr. {doctor.name}</h2>
              <p className="book-appointment-doctor-spec">
                <Stethoscope size={16} />
                {doctor.specialization}
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="book-appointment-error-message"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="book-appointment-section"
        >
          <h3 className="book-appointment-section-title">
            <Calendar size={20} />
            Select Date
          </h3>
          <div className="book-appointment-dates">
            {nextDays.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`book-appointment-date-btn ${isSelected ? 'selected' : ''}`}
                  disabled={date < new Date().setHours(0, 0, 0, 0)}
                >
                  <div className="book-appointment-date-day">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="book-appointment-date-number">{date.getDate()}</div>
                  {isToday && <div className="book-appointment-date-badge">Today</div>}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Time Slot Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="book-appointment-section"
        >
          <h3 className="book-appointment-section-title">
            <Clock size={20} />
            Select Time Slot - {formatDate(selectedDate)}
          </h3>
          {loadingSlots ? (
            <div className="book-appointment-slots-loading">
              <div className="book-appointment-spinner" />
              Loading available slots...
            </div>
          ) : selectedSlots.length === 0 ? (
            <div className="book-appointment-no-slots">
              <AlertCircle size={24} />
              <p>No available slots for this date. Please select another date.</p>
            </div>
          ) : (
            <div className="book-appointment-slots">
              {selectedSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => slot.available && setSelectedSlot(slot)}
                  disabled={!slot.available}
                  className={`book-appointment-slot-btn ${
                    selectedSlot?.time === slot.time ? 'selected' : ''
                  } ${!slot.available ? 'booked' : ''}`}
                >
                  {formatTime(slot.time)}
                  {!slot.available && <span className="book-appointment-slot-badge">Booked</span>}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Reason and Symptoms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="book-appointment-section"
        >
          <h3 className="book-appointment-section-title">Additional Information (Optional)</h3>
          <div className="book-appointment-form">
            <div className="book-appointment-field">
              <label htmlFor="reason">Reason for Visit</label>
              <input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Regular checkup, Follow-up"
                className="book-appointment-input"
              />
            </div>
            <div className="book-appointment-field">
              <label htmlFor="symptoms">Symptoms (if any)</label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe any symptoms you're experiencing"
                rows={4}
                className="book-appointment-textarea"
              />
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="book-appointment-actions"
        >
          <button
            onClick={handleBookAppointment}
            disabled={!selectedSlot || submitting}
            className="book-appointment-submit-btn"
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BookAppointment;

