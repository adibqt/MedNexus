import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Filter, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import './DoctorAppointments.css';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('doctor_access_token');
    if (!token) {
      navigate('/sign-in/doctor', { replace: true });
      return;
    }

    loadAppointments();
  }, [navigate, statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDoctorAppointments(statusFilter);
      setAppointments(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      setProcessingId(appointmentId);
      await apiService.confirmAppointment(appointmentId);
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to confirm appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setProcessingId(appointmentId);
      await apiService.cancelAppointment(appointmentId);
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (appointmentId) => {
    if (!window.confirm('Mark this appointment as completed?')) {
      return;
    }

    try {
      setProcessingId(appointmentId);
      await apiService.completeAppointment(appointmentId);
      await loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to complete appointment');
    } finally {
      setProcessingId(null);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b';
      case 'Confirmed':
        return '#10b981';
      case 'Completed':
        return '#6366f1';
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <AlertCircle size={16} />;
      case 'Confirmed':
        return <CheckCircle2 size={16} />;
      case 'Completed':
        return <CheckCircle2 size={16} />;
      case 'Cancelled':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const filteredAppointments = statusFilter
    ? appointments.filter(apt => apt.status === statusFilter)
    : appointments;

  const pendingCount = appointments.filter(apt => apt.status === 'Pending').length;
  const confirmedCount = appointments.filter(apt => apt.status === 'Confirmed').length;
  const completedCount = appointments.filter(apt => apt.status === 'Completed').length;
  const cancelledCount = appointments.filter(apt => apt.status === 'Cancelled').length;

  if (loading) {
    return (
      <div className="doctor-appointments-page">
        <div className="doctor-appointments-loading">
          <div className="doctor-appointments-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments-page">
      <div className="doctor-appointments-container">
        {/* Header */}
        <div className="doctor-appointments-header">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="doctor-appointments-back-btn"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="doctor-appointments-title">My Appointments</h1>
        </div>

        {/* Stats */}
        <div className="doctor-appointments-stats">
          <div className="doctor-appointments-stat-card">
            <div className="doctor-appointments-stat-value">{pendingCount}</div>
            <div className="doctor-appointments-stat-label">Pending</div>
          </div>
          <div className="doctor-appointments-stat-card">
            <div className="doctor-appointments-stat-value">{confirmedCount}</div>
            <div className="doctor-appointments-stat-label">Confirmed</div>
          </div>
          <div className="doctor-appointments-stat-card">
            <div className="doctor-appointments-stat-value">{completedCount}</div>
            <div className="doctor-appointments-stat-label">Completed</div>
          </div>
          <div className="doctor-appointments-stat-card">
            <div className="doctor-appointments-stat-value">{cancelledCount}</div>
            <div className="doctor-appointments-stat-label">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="doctor-appointments-filters">
          <Filter size={18} />
          <button
            onClick={() => setStatusFilter(null)}
            className={`doctor-appointments-filter-btn ${statusFilter === null ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`doctor-appointments-filter-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('Confirmed')}
            className={`doctor-appointments-filter-btn ${statusFilter === 'Confirmed' ? 'active' : ''}`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`doctor-appointments-filter-btn ${statusFilter === 'Completed' ? 'active' : ''}`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('Cancelled')}
            className={`doctor-appointments-filter-btn ${statusFilter === 'Cancelled' ? 'active' : ''}`}
          >
            Cancelled
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="doctor-appointments-error-message"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="doctor-appointments-empty">
            <Calendar size={64} />
            <h2>No Appointments</h2>
            <p>
              {statusFilter
                ? `No ${statusFilter.toLowerCase()} appointments found.`
                : 'You don\'t have any appointments yet.'}
            </p>
          </div>
        ) : (
          <div className="doctor-appointments-list">
            {filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="doctor-appointments-card"
              >
                <div className="doctor-appointments-card-header">
                  <div className="doctor-appointments-card-patient">
                    <div className="doctor-appointments-card-avatar">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="doctor-appointments-card-name">
                        {appointment.patient_name}
                      </h3>
                      <p className="doctor-appointments-card-contact">
                        {appointment.patient_email} • {appointment.patient_phone}
                      </p>
                    </div>
                  </div>
                  <div
                    className="doctor-appointments-card-status"
                    style={{ color: getStatusColor(appointment.status) }}
                  >
                    {getStatusIcon(appointment.status)}
                    {appointment.status}
                  </div>
                </div>

                <div className="doctor-appointments-card-body">
                  <div className="doctor-appointments-card-info">
                    <div className="doctor-appointments-card-info-item">
                      <Calendar size={18} />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="doctor-appointments-card-info-item">
                      <Clock size={18} />
                      <span>{formatTime(appointment.time)}</span>
                    </div>
                  </div>

                  {appointment.reason && (
                    <div className="doctor-appointments-card-detail">
                      <strong>Reason:</strong> {appointment.reason}
                    </div>
                  )}

                  {appointment.symptoms && (
                    <div className="doctor-appointments-card-detail">
                      <strong>Symptoms:</strong> {appointment.symptoms}
                    </div>
                  )}

                  {appointment.created_at && (
                    <div className="doctor-appointments-card-meta">
                      Booked on {new Date(appointment.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {appointment.status === 'Pending' && (
                  <div className="doctor-appointments-card-actions">
                    <button
                      onClick={() => handleConfirm(appointment.id)}
                      disabled={processingId === appointment.id}
                      className="doctor-appointments-card-btn confirm"
                    >
                      <CheckCircle2 size={18} />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      disabled={processingId === appointment.id}
                      className="doctor-appointments-card-btn cancel"
                    >
                      <XCircle size={18} />
                      Cancel
                    </button>
                  </div>
                )}

                {appointment.status === 'Confirmed' && (
                  <div className="doctor-appointments-card-actions">
                    <button
                      onClick={() => handleComplete(appointment.id)}
                      disabled={processingId === appointment.id}
                      className="doctor-appointments-card-btn complete"
                    >
                      <CheckCircle2 size={18} />
                      Complete
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      disabled={processingId === appointment.id}
                      className="doctor-appointments-card-btn cancel"
                    >
                      <XCircle size={18} />
                      Cancel
                    </button>
                  </div>
                )}

                {appointment.status === 'Completed' && (
                  <div className="doctor-appointments-card-actions">
                    <button
                      onClick={() =>
                        navigate(`/doctor/prescriptions/write/${appointment.id}`, {
                          state: {
                            appointmentInfo: {
                              id: appointment.id,
                              appointment_date: appointment.appointment_date,
                              appointment_time: appointment.appointment_time,
                              patient_name: appointment.patient_name,
                            },
                          },
                        })
                      }
                      className="doctor-appointments-card-btn prescription"
                    >
                      <FileText size={16} />
                      Write Prescription
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;

