import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  PlusCircle,
  AlertCircle,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../../services/api';
import './WritePrescription.css';

const WritePrescription = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('doctor_access_token');
    if (!token) {
      navigate('/sign-in/doctor', { replace: true });
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompletedAppointmentsForPrescription();
      setAppointments(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filtered = appointments.filter((apt) =>
    apt.patient_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="wp-page">
      <div className="wp-container">
        {/* Header */}
        <div className="wp-header">
          <button className="wp-back-btn" onClick={() => navigate('/doctor/dashboard')}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 className="wp-title">E‑Prescriptions</h1>
            <p className="wp-subtitle">Write prescriptions for your completed appointments</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="wp-stats">
          <div className="wp-stat-card">
            <div className="wp-stat-value">{appointments.length}</div>
            <div className="wp-stat-label">Completed appointments</div>
          </div>
          <div className="wp-stat-card wp-stat-card--green">
            <div className="wp-stat-value">
              {appointments.filter((a) => a.has_prescription && a.prescription_finalized).length}
            </div>
            <div className="wp-stat-label">Prescriptions issued</div>
          </div>
          <div className="wp-stat-card wp-stat-card--amber">
            <div className="wp-stat-value">
              {appointments.filter((a) => !a.has_prescription).length}
            </div>
            <div className="wp-stat-label">Awaiting prescription</div>
          </div>
        </div>

        {/* Search */}
        <div className="wp-search-row">
          <div className="wp-search-wrap">
            <Search size={16} className="wp-search-icon" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="wp-search-input"
            />
          </div>
        </div>

        {error && (
          <div className="wp-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="wp-loading">
            <div className="wp-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="wp-empty">
            <FileText size={48} />
            <h3>No completed appointments</h3>
            <p>Once you mark an appointment as completed, it will appear here.</p>
          </div>
        ) : (
          <div className="wp-list">
            {filtered.map((apt, i) => (
              <motion.div
                key={apt.id}
                className="wp-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="wp-card-left">
                  <div className="wp-card-avatar">
                    {apt.patient_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="wp-card-info">
                    <div className="wp-card-patient">{apt.patient_name}</div>
                    <div className="wp-card-meta">
                      <Clock size={13} />
                      {formatDate(apt.appointment_date)} &nbsp;·&nbsp; {formatTime(apt.appointment_time)}
                    </div>
                    {apt.reason && (
                      <div className="wp-card-reason">Reason: {apt.reason}</div>
                    )}
                  </div>
                </div>

                <div className="wp-card-right">
                  {apt.has_prescription ? (
                    <>
                      <span
                        className={`wp-badge ${apt.prescription_finalized ? 'wp-badge--green' : 'wp-badge--amber'}`}
                      >
                        <CheckCircle2 size={12} />
                        {apt.prescription_finalized ? 'Issued' : 'Draft'}
                      </span>
                      <button
                        className="wp-btn wp-btn--outline"
                        onClick={() =>
                          navigate(`/doctor/prescriptions/write/${apt.id}`, {
                            state: { appointmentInfo: apt },
                          })
                        }
                      >
                        {apt.prescription_finalized ? 'View' : 'Edit'} Prescription
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="wp-badge wp-badge--gray">No Rx yet</span>
                      <button
                        className="wp-btn wp-btn--primary"
                        onClick={() =>
                          navigate(`/doctor/prescriptions/write/${apt.id}`, {
                            state: { appointmentInfo: apt },
                          })
                        }
                      >
                        <PlusCircle size={14} />
                        Write Prescription
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WritePrescription;
