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
} from 'lucide-react';
import apiService from '../../services/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState(null);

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

    load();
  }, [navigate]);

  const scheduleEntries = schedule
    ? Object.entries(schedule).filter(([, v]) => v.enabled)
    : [];

  const avatarUrl =
    doctor && doctor.profile_picture
      ? apiService.getProfilePictureUrl(doctor.profile_picture)
      : null;

  const handleLogout = () => {
    localStorage.removeItem('doctor_access_token');
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
          <div className="doctor-dashboard-stat-value">0</div>
          <div className="doctor-dashboard-stat-caption">No visits scheduled yet</div>
        </div>
        <div className="doctor-dashboard-stat-card">
          <div className="doctor-dashboard-stat-label">This week</div>
          <div className="doctor-dashboard-stat-value">0</div>
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
              <CalendarDays size={13} style={{ marginRight: 6 }} />
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
                // Placeholder: hook into prescription flow when implemented
              >
                Open
              </button>
            </div>

            <div className="doctor-dashboard-quick-card">
              <div className="doctor-dashboard-quick-header">
                <div className="doctor-dashboard-quick-label">
                  <Clock size={14} style={{ marginRight: 4 }} />
                  This week&apos;s appointments
                </div>
                <span className="doctor-dashboard-quick-pill">0 scheduled</span>
              </div>
              <p className="doctor-dashboard-quick-empty">
                Once booking is live, all appointments for the current week will appear
                here.
              </p>
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


