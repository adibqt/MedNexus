import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  CalendarDays,
  Heart,
  FileText,
  Clock,
  History,
  CheckCircle2,
  Pencil,
  LogOut,
  Video,
} from 'lucide-react';
import { useVideoCall } from '../../context/VideoCallContext';
import apiService from '../../services/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { initiateCall } = useVideoCall();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('doctor_access_token');
    if (!token) {
      navigate('/sign-in/doctor', { replace: true });
      return;
    }

    const load = async () => {
      try {
        const data = await apiService.request('/api/doctors/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctor(data);
        if (data.schedule) {
          try {
            setSchedule(JSON.parse(data.schedule));
          } catch {
            setSchedule(null);
          }
        }
      } catch {
        navigate('/sign-in/doctor', { replace: true });
      }
    };

    const loadAppointments = async () => {
      try {
        setLoadingAppointments(true);
        const data = await apiService.getDoctorAppointments();
        setAppointments(data || []);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    load();
    loadAppointments();
  }, [navigate]);

  const scheduleEntries = schedule
    ? Object.entries(schedule).filter(([, v]) => v.enabled)
    : [];

  const avatarUrl =
    doctor && doctor.profile_picture
      ? apiService.getProfilePictureUrl(doctor.profile_picture)
      : null;

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get start of week (Monday)
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Get end of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter appointments for this week
  const thisWeekAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate >= startOfWeek && aptDate <= endOfWeek;
  });

  // Filter appointments for today
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });

  // Format time helper
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const time = typeof timeStr === 'string' ? timeStr : timeStr;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor_access_token');
    localStorage.removeItem('doctor_refresh_token');
    localStorage.removeItem('doctor_user');
    navigate('/sign-in/doctor', { replace: true });
  };

  return (
    <div className="doctor-dashboard-page">
      <header className="doctor-dashboard-hero">
        <div className="doctor-dashboard-hero-left">
          <div className="doctor-dashboard-avatar doctor-dashboard-avatar--large">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Doctor avatar" />
            ) : (
              <span>
                {doctor && doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
              </span>
            )}
          </div>
          <div className="doctor-dashboard-hero-info">
            <div className="doctor-dashboard-hero-name">
              {doctor ? `Dr. ${doctor.name}` : 'Doctor Name'}
            </div>
            <div className="doctor-dashboard-hero-meta">
              <span className="doctor-dashboard-hero-specialty">
                <Stethoscope size={14} />
                {doctor?.specialization || 'Specialization'}
              </span>
              {doctor?.is_approved && (
                <span className="doctor-dashboard-hero-verified">
                  <CheckCircle2 size={14} />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="doctor-dashboard-hero-right">
          <button
            type="button"
            className="doctor-dashboard-hero-btn secondary"
            onClick={() => navigate('/doctor/profile')}
          >
            <Pencil size={14} />
            Edit Profile
          </button>
          <button
            type="button"
            className="doctor-dashboard-hero-btn danger"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <section className="doctor-dashboard-stats-row">
        <div className="doctor-dashboard-stat-card">
          <div className="doctor-dashboard-stat-label">Today&apos;s patients</div>
          <div className="doctor-dashboard-stat-value">{todayAppointments.length}</div>
          <div className="doctor-dashboard-stat-caption">
            {todayAppointments.length === 0 ? 'No visits scheduled yet' : `${todayAppointments.length} appointment${todayAppointments.length === 1 ? '' : 's'}`}
          </div>
        </div>
        <div className="doctor-dashboard-stat-card">
          <div className="doctor-dashboard-stat-label">This week</div>
          <div className="doctor-dashboard-stat-value">{thisWeekAppointments.length}</div>
          <div className="doctor-dashboard-stat-caption">Appointments this week</div>
        </div>
        <div className="doctor-dashboard-stat-card">
          <div className="doctor-dashboard-stat-label">Patient rating</div>
          <div className="doctor-dashboard-stat-value">4.9★</div>
          <div className="doctor-dashboard-stat-caption">Based on future feedback</div>
        </div>
        <div className="doctor-dashboard-stat-card">
          <div className="doctor-dashboard-stat-label">Avg. visit length</div>
          <div className="doctor-dashboard-stat-value">60 min</div>
          <div className="doctor-dashboard-stat-caption">Per consultation slot</div>
        </div>
      </section>

      <div className="doctor-dashboard-grid">
        {/* Left column: schedule + this week */}
        <section className="doctor-dashboard-card doctor-dashboard-card--primary">
          <div className="doctor-dashboard-card-header">
            <div className="doctor-dashboard-card-title">
              <CalendarDays size={14} />
              Weekly availability
            </div>
            <div className="doctor-dashboard-badge">
              {scheduleEntries.length} active day
              {scheduleEntries.length === 1 ? '' : 's'}
            </div>
          </div>

          {scheduleEntries.length === 0 ? (
            <div className="doctor-dashboard-empty">
              You haven’t configured your schedule yet. Patients won’t be able to book
              until at least one day is active.
            </div>
          ) : (
            <div className="doctor-dashboard-schedule-list">
              {scheduleEntries
                .slice(0, 7)
                .map(([day, slot]) => (
                  <div key={day} className="doctor-dashboard-schedule-row">
                    <span className="doctor-dashboard-schedule-day">{day}</span>
                    <span className="doctor-dashboard-schedule-time">
                      {slot.start} – {slot.end}
                    </span>
                  </div>
                ))}
            </div>
          )}

          <div className="doctor-dashboard-cta">
            <button onClick={() => navigate('/doctor/schedule')}>
              Adjust schedule
            </button>
          </div>
        </section>

        {/* Right column: quick actions */}
        <section className="doctor-dashboard-card doctor-dashboard-card--stacked">
          <div className="doctor-dashboard-quick-grid">
            <div className="doctor-dashboard-quick-card doctor-dashboard-quick-card--accent">
              <div className="doctor-dashboard-quick-icon">
                <FileText size={16} />
              </div>
              <div className="doctor-dashboard-quick-content">
                <div className="doctor-dashboard-quick-title">Write Prescription</div>
                <div className="doctor-dashboard-quick-subtitle">
                  Start a new e‑prescription for your patient.
                </div>
              </div>
              <button
                type="button"
                className="doctor-dashboard-quick-button"
                onClick={() => navigate('/doctor/prescriptions')}
              >
                Open
              </button>
            </div>

            <div className="doctor-dashboard-quick-card">
              <div className="doctor-dashboard-quick-header">
                <div className="doctor-dashboard-quick-label">
                  <Clock size={18} style={{ marginRight: 6 }} />
                  This week&apos;s appointments
                </div>
                <span className="doctor-dashboard-quick-pill">
                  {thisWeekAppointments.length} scheduled
                </span>
              </div>
              {loadingAppointments ? (
                <p className="doctor-dashboard-quick-empty">Loading appointments...</p>
              ) : thisWeekAppointments.length === 0 ? (
                <div>
                  <p className="doctor-dashboard-quick-empty">
                    No appointments scheduled for this week yet.
                  </p>
                  <button
                    type="button"
                    className="doctor-dashboard-view-all-btn"
                    onClick={() => navigate('/doctor/appointments')}
                    style={{ marginTop: '8px' }}
                  >
                    View All Appointments
                  </button>
                </div>
              ) : (
                <div className="doctor-dashboard-appointments-list">
                  {thisWeekAppointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="doctor-dashboard-appointment-item">
                      <div className="doctor-dashboard-appointment-main">
                        <div className="doctor-dashboard-appointment-info">
                          <div className="doctor-dashboard-appointment-date-time">
                            <div className="doctor-dashboard-appointment-date">
                              {formatDate(apt.appointment_date)}
                            </div>
                            <div className="doctor-dashboard-appointment-time">
                              {formatTime(apt.appointment_time)}
                            </div>
                          </div>
                          <div className="doctor-dashboard-appointment-patient">
                            {apt.patient_name}
                          </div>
                        </div>
                        <div className="doctor-dashboard-appointment-actions">
                          <div 
                            className="doctor-dashboard-appointment-status"
                            style={{ 
                              color: apt.status === 'Confirmed' ? '#10b981' : 
                                     apt.status === 'Pending' ? '#f59e0b' : '#ef4444',
                              backgroundColor: apt.status === 'Confirmed' ? '#ecfdf5' : 
                                             apt.status === 'Pending' ? '#fffbeb' : '#fef2f2'
                            }}
                          >
                            {apt.status}
                          </div>
                          {apt.status === 'Confirmed' && (
                            <button
                              type="button"
                              className="doctor-dashboard-video-call-btn"
                              title="Start video call"
                              onClick={() => initiateCall(apt.id)}
                            >
                              <Video size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="doctor-dashboard-view-all-btn"
                    onClick={() => navigate('/doctor/appointments')}
                  >
                    {thisWeekAppointments.length > 5 ? 'View All Appointments' : 'Manage Appointments'}
                  </button>
                </div>
              )}
            </div>

            <div className="doctor-dashboard-quick-card">
              <div className="doctor-dashboard-quick-header">
                <div className="doctor-dashboard-quick-label">
                  <History size={14} style={{ marginRight: 4 }} />
                  Appointment history
                </div>
                <span className="doctor-dashboard-quick-pill">No records yet</span>
              </div>
              <p className="doctor-dashboard-quick-empty">
                View a chronological log of all completed consultations once patients start
                booking.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorDashboard;


