import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  User,
  Clock,
  Activity,
  LogOut,
  Bell,
  ChevronRight,
  Video,
  Pill,
  Star,
  FileText,
  X,
  Stethoscope,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import './PatientDashboard.css';

const API_URL = 'http://localhost:8000';

// Helper function to get the correct image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}${url}`;
};

// Icon component wrapper for consistent styling
const Icon = ({ icon: IconComponent, className = '', size = 20 }) => (
  <IconComponent size={size} className={className} />
);

// Default concerns/symptoms
const fallbackConcerns = [
  'Abdominal pain',
  'Adenoviruses',
  'Anxiety',
  'Back pain',
  'Chest pain',
  'Cough',
  'Depression',
  'Diarrhea',
  'Dizziness',
  'Factors',
  'Fatigue',
  'Fever',
  'Headache',
  'Infection',
  'Insomnia',
  'Joint pain',
  'Muscle pain',
  'Nausea',
  'Rash',
  'Rhinoviruses',
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State management
  const [selected, setSelected] = useState([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [concerns, setConcerns] = useState(fallbackConcerns);
  const [showNotifications, setShowNotifications] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);

  const doctorsCarouselRef = useRef(null);

  // Sample notifications
  const notifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'Appointment Reminder',
      message: 'Your appointment with Dr. Sarah Wilson is tomorrow at 10:00 AM',
      time: '2 hours ago',
      read: false,
      icon: Calendar,
    },
    {
      id: 2,
      type: 'prescription',
      title: 'New Prescription',
      message: 'Dr. James Chen has uploaded a new prescription for you',
      time: '5 hours ago',
      read: false,
      icon: Pill,
    },
    {
      id: 3,
      type: 'report',
      title: 'Lab Report Ready',
      message: 'Your blood test results are now available',
      time: '1 day ago',
      read: true,
      icon: FileText,
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Health Checkup',
      message: 'Time for your monthly health checkup',
      time: '2 days ago',
      read: true,
      icon: Heart,
    },
  ];

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        
        // Load available doctors (mock data for now)
        setLoadingDoctors(true);
        // Simulated doctors data
        const mockDoctors = [
          {
            id: 1,
            full_name: 'Dr. Sarah Wilson',
            specialization: 'Cardiologist',
            profile_picture_url: null,
            is_verified: true,
            average_rating: 4.8,
            total_ratings: 124,
          },
          {
            id: 2,
            full_name: 'Dr. James Chen',
            specialization: 'General Physician',
            profile_picture_url: null,
            is_verified: true,
            average_rating: 4.6,
            total_ratings: 89,
          },
          {
            id: 3,
            full_name: 'Dr. Emily Brown',
            specialization: 'Dermatologist',
            profile_picture_url: null,
            is_verified: true,
            average_rating: 4.9,
            total_ratings: 156,
          },
          {
            id: 4,
            full_name: 'Dr. Michael Lee',
            specialization: 'Neurologist',
            profile_picture_url: null,
            is_verified: false,
            average_rating: 4.5,
            total_ratings: 67,
          },
        ];
        
        if (mounted) {
          setDoctors(mockDoctors);
          setLoadingDoctors(false);
        }

        // Load user appointments (mock data)
        const mockAppointments = [
          {
            id: 1,
            doctor: { name: 'Sarah Wilson', specialization: 'Cardiologist', profile_picture_url: null },
            doctor_id: 1,
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '10:00 AM',
            time_slot: '10:00 AM',
            status: 'Confirmed',
            reason: 'Regular checkup',
            symptoms: 'Chest discomfort',
          },
          {
            id: 2,
            doctor: { name: 'James Chen', specialization: 'General Physician', profile_picture_url: null },
            doctor_id: 2,
            appointment_date: '2025-12-20',
            appointment_time: '02:30 PM',
            time_slot: '02:30 PM',
            status: 'Pending',
            reason: 'Follow-up',
          },
        ];
        
        if (mounted) {
          setAppointments(mockAppointments);
        }

        setError('');
      } catch (e) {
        console.error(e);
        setError('Failed to load data.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto carousel for Available Doctors
  useEffect(() => {
    const el = doctorsCarouselRef.current;
    if (!el) return;
    if (loadingDoctors) return;
    if (!doctors || doctors.length <= 1) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const getStep = () => {
      const firstCard = el.querySelector('[data-carousel-item="doctor"]');
      if (!firstCard) return 0;
      const cardWidth = firstCard.getBoundingClientRect().width;
      const styles = window.getComputedStyle(el);
      const gapRaw = styles.columnGap || styles.gap || '0px';
      const gap = Number.parseFloat(gapRaw) || 0;
      return Math.round(cardWidth + gap);
    };

    const tick = () => {
      const step = getStep();
      if (!step) return;
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (nearEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    const id = window.setInterval(tick, 2500);
    return () => window.clearInterval(id);
  }, [doctors, loadingDoctors]);

  // Toggle concern selection
  const toggleConcern = (c) => {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  // Suggest doctor based on selected symptoms
  const onSuggestDoctor = async () => {
    if (!selected.length) return;
    try {
      setSuggesting(true);
      
      // Simple mapping logic
      const symptomSpecMap = {
        'Temperature': 'General Physician',
        'Headache': 'Neurologist',
        'Weakness': 'General Physician',
        'Cough': 'Pulmonologist',
        'Fever': 'General Physician',
        'Fatigue': 'General Physician',
        'Chest Pain': 'Cardiologist',
        'Dizziness': 'Neurologist',
        'Nausea': 'Gastroenterologist',
      };
      
      // Find the most relevant specialization
      const specs = selected.map(s => symptomSpecMap[s] || 'General Physician');
      const preferredSpec = specs[0] || 'General Physician';
      
      // Find matching doctor
      const matchingDoctors = doctors.filter(d => 
        d.specialization.toLowerCase().includes(preferredSpec.toLowerCase().split(' ')[0])
      );
      
      const availableDoctors = matchingDoctors.length > 0 ? matchingDoctors : doctors;
      
      if (availableDoctors.length > 0) {
        const suggestedDoctor = availableDoctors[0];
        setSuggestion({
          id: suggestedDoctor.id,
          name: suggestedDoctor.full_name,
          specialty: suggestedDoctor.specialization,
          photo_url: suggestedDoctor.profile_picture_url,
          experience_years: 8,
          rating: suggestedDoctor.average_rating || 4.5,
          total_ratings: suggestedDoctor.total_ratings || 0,
          concerns: selected,
        });
      } else {
        setSuggestion(null);
        alert('No doctors available at the moment.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to suggest doctor.');
    } finally {
      setSuggesting(false);
    }
  };

  // Filter today's appointments
  const todayAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return appointments.filter(apt => {
      if (!apt.appointment_date) return false;
      let aptDateStr = typeof apt.appointment_date === 'string' 
        ? apt.appointment_date.split('T')[0] 
        : apt.appointment_date;
      return aptDateStr === todayStr;
    });
  }, [appointments]);

  const todayAppointment = todayAppointments.length > 0 ? todayAppointments[0] : null;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="patient-dashboard--loading">
        <div className="patient-dashboard-loading-inner">
          <div className="patient-dashboard-spinner-lg" />
          <p className="patient-dashboard-loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-dashboard--error">
        <div className="patient-dashboard-error-inner">
          <div className="patient-dashboard-error-icon">⚠️</div>
          <p className="patient-dashboard-error-text">{error}</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="patient-dashboard">
      {/* Header */}
      <header className="patient-dashboard-header">
        <div className="patient-dashboard-header-inner">
          {/* Logo & greeting */}
          <div className="patient-dashboard-header-left">
            <div className="patient-dashboard-logo">
              <div className="patient-dashboard-logo-icon">
                <Heart />
              </div>
              <span className="patient-dashboard-logo-text">
                Med<span>Nexus</span>
              </span>
            </div>
            <div className="patient-dashboard-greeting">
              <p className="patient-dashboard-greeting-line1">{greeting},</p>
              <h1 className="patient-dashboard-greeting-line2">
                How do you feel today, {user?.name || 'Patient'}?
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div className="patient-dashboard-header-actions">
            <button
              type="button"
              onClick={() => navigate('/ai-consultation')}
              className="patient-dashboard-ai-button"
            >
              <Bot />
              <span>AI Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/patient/profile')}
              className="patient-dashboard-profile-button"
            >
              <User />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="patient-dashboard-icon-button"
              aria-label="Notifications"
            >
              <Bell />
              {unreadCount > 0 && (
                <span className="patient-dashboard-badge">{unreadCount}</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="patient-dashboard-logout"
              aria-label="Logout"
            >
              <LogOut />
              <span className="patient-dashboard-logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="patient-dashboard-header-spacer" />

      {/* Notifications drawer */}
      <div
        className={`patient-dashboard-notif-drawer ${
          showNotifications ? 'patient-dashboard-notif-drawer--open' : ''
        }`}
      >
        <div className="patient-dashboard-notif-inner">
          <div className="patient-dashboard-notif-header">
            <h3 className="patient-dashboard-notif-title">Notifications</h3>
            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="patient-dashboard-notif-close"
            >
              <X />
            </button>
          </div>
          <div className="patient-dashboard-notif-list">
            {notifications.map((notification) => {
              const NotifIcon = notification.icon;
              const unread = !notification.read;
              return (
                <div
                  key={notification.id}
                  className={`patient-dashboard-notif-item ${
                    unread ? 'patient-dashboard-notif-item--unread' : ''
                  }`}
                >
                  <div className="patient-dashboard-notif-body">
                    <div
                      className="patient-dashboard-notif-icon"
                      style={{
                        backgroundColor: unread ? '#2563eb' : '#e5e7eb',
                        color: unread ? '#ffffff' : '#6b7280',
                      }}
                    >
                      <NotifIcon />
                    </div>
                    <div className="patient-dashboard-notif-content">
                      <h4 className="patient-dashboard-notif-title-text">
                        {notification.title}
                      </h4>
                      <p className="patient-dashboard-notif-message">
                        {notification.message}
                      </p>
                      <p className="patient-dashboard-notif-time">{notification.time}</p>
                    </div>
                    {unread && <div className="patient-dashboard-notif-dot" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="patient-dashboard-notif-footer">
            <button type="button" className="patient-dashboard-notif-mark-all">
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div
          className="patient-dashboard-notif-overlay"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Main content */}
      <main className="patient-dashboard-main">
        {/* Concerns / Symptoms */}
        <section className="patient-dashboard-card">
          <div className="patient-dashboard-card-body">
            <div className="patient-dashboard-concerns-scroll">
              <div className="patient-dashboard-concerns-grid">
                {concerns.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleConcern(c)}
                    className="patient-dashboard-concern-button"
                  >
                    <span
                      className={`patient-dashboard-concern-dot ${
                        selected.includes(c) ? 'patient-dashboard-concern-dot--active' : ''
                      }`}
                    />
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onSuggestDoctor}
              disabled={!selected.length || suggesting}
              className="patient-dashboard-suggest-button"
            >
              {suggesting ? (
                <>
                  <div className="patient-dashboard-spinner-sm" />
                  Suggesting...
                </>
              ) : (
                'Suggest Doctor'
              )}
            </button>

            {suggestion && (
              <div className="patient-dashboard-suggestion">
                <div className="patient-dashboard-suggestion-inner">
                  <div className="patient-dashboard-suggestion-avatar">
                    {suggestion.photo_url ? (
                      <img
                        src={getImageUrl(suggestion.photo_url)}
                        alt=""
                      />
                    ) : (
                      <User />
                    )}
                  </div>
                  <div className="patient-dashboard-suggestion-body">
                    <h3 className="patient-dashboard-suggestion-name">{suggestion.name}</h3>
                    <p className="patient-dashboard-suggestion-spec">
                      {suggestion.specialty}
                    </p>
                    <div className="patient-dashboard-suggestion-meta">
                      <span>
                        <Star className="patient-dashboard-suggestion-rating-icon" />
                        {suggestion.rating.toFixed(1)} ({suggestion.total_ratings} reviews)
                      </span>
                      <span>•</span>
                      <span>{suggestion.experience_years} years exp.</span>
                    </div>
                    <p className="patient-dashboard-suggestion-note">
                      Recommended for:{' '}
                      <span>{suggestion.concerns.join(', ')}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/doctor/${suggestion.id}`)}
                    className="patient-dashboard-suggestion-cta"
                  >
                    <Calendar />
                    Book Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="patient-dashboard-section-spacer" />

        {/* Today's Appointment */}
        <section className="patient-dashboard-card">
          <div className="patient-dashboard-appointment-header">
            <h2 className="patient-dashboard-appointment-title">Today&apos;s Appointment</h2>
          </div>
          <div className="patient-dashboard-appointment-body">
            {todayAppointment ? (
              <div className="patient-dashboard-appointment-main">
                <div className="patient-dashboard-appointment-avatar">
                  {todayAppointment.doctor?.profile_picture_url ? (
                    <img
                      src={getImageUrl(todayAppointment.doctor.profile_picture_url)}
                      alt=""
                    />
                  ) : (
                    <User />
                  )}
                </div>
                <div className="patient-dashboard-appointment-info">
                  <h3 className="patient-dashboard-appointment-name">
                    Dr. {todayAppointment.doctor?.name}
                  </h3>
                  <p className="patient-dashboard-appointment-spec">
                    {todayAppointment.doctor?.specialization}
                  </p>
                  <div className="patient-dashboard-appointment-meta">
                    <span>
                      <Calendar />
                      {new Date(
                        todayAppointment.appointment_date,
                      ).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>
                      <Clock />
                      {todayAppointment.appointment_time}
                    </span>
                    <span
                      className={`patient-dashboard-appointment-status ${
                        todayAppointment.status === 'Confirmed'
                          ? 'patient-dashboard-appointment-status--confirmed'
                          : 'patient-dashboard-appointment-status--pending'
                      }`}
                    >
                      {todayAppointment.status}
                    </span>
                  </div>
                  {todayAppointment.reason && (
                    <p className="patient-dashboard-appointment-reason">
                      <span>Reason:</span> {todayAppointment.reason}
                    </p>
                  )}
                </div>
                <div className="patient-dashboard-appointment-actions">
                  <button
                    type="button"
                    onClick={() => navigate(`/doctor/${todayAppointment.doctor_id}`)}
                    className="patient-dashboard-appointment-more"
                  >
                    <ChevronRight />
                  </button>
                  {todayAppointment.status === 'Confirmed' && (
                    <button
                      type="button"
                      className="patient-dashboard-appointment-join"
                    >
                      <Video />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="patient-dashboard-appointment-empty">
                <div className="patient-dashboard-appointment-empty-icon">
                  <Calendar />
                </div>
                <p className="patient-dashboard-appointment-empty-text">
                  No appointments scheduled for today
                </p>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .querySelector('.patient-dashboard-doctors-body')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="patient-dashboard-appointment-empty-cta"
                >
                  Book an Appointment
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="patient-dashboard-section-spacer" />

        {/* Available Doctors */}
        <section className="patient-dashboard-card">
          <div className="patient-dashboard-card-header">
            <h2 className="patient-dashboard-card-title">Available Doctors</h2>
          </div>
          <div className="patient-dashboard-doctors-body">
            {loadingDoctors ? (
              <div className="patient-dashboard-doctors-loading">
                <div className="patient-dashboard-spinner-md" />
              </div>
            ) : doctors.length > 0 ? (
              <div
                ref={doctorsCarouselRef}
                className="patient-dashboard-doctors-scroll"
              >
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    data-carousel-item="doctor"
                    className="patient-dashboard-doctor-card"
                  >
                    <div className="patient-dashboard-doctor-photo-wrap">
                      <div className="patient-dashboard-doctor-photo">
                        {doctor.profile_picture_url ? (
                          <img src={getImageUrl(doctor.profile_picture_url)} alt="" />
                        ) : (
                          <User />
                        )}
                      </div>
                    </div>
                    <div className="patient-dashboard-doctor-info">
                      <h3 className="patient-dashboard-doctor-name">
                        {doctor.full_name}
                      </h3>
                      <p className="patient-dashboard-doctor-spec">
                        <Stethoscope />
                        {doctor.specialization}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/${doctor.id}`)}
                        className="patient-dashboard-doctor-cta"
                      >
                        <Calendar />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="patient-dashboard-doctors-empty">
                <div className="patient-dashboard-doctors-empty-icon">
                  <Stethoscope />
                </div>
                <p className="patient-dashboard-doctors-empty-text">
                  No doctors available at the moment
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="patient-dashboard-section-spacer" />

        {/* My Activities */}
        <section className="patient-dashboard-card">
          <div className="patient-dashboard-card-header">
            <h2 className="patient-dashboard-card-title">My Activities</h2>
          </div>
          <div className="patient-dashboard-activities-body">
            <div className="patient-dashboard-activities-grid">
              <button
                type="button"
                onClick={() => navigate('/view-prescription')}
                className="patient-dashboard-activity-card"
              >
                <div className="patient-dashboard-activity-icon patient-dashboard-activity-icon--pill">
                  <Pill />
                </div>
                <h3 className="patient-dashboard-activity-title">Prescriptions</h3>
                <p className="patient-dashboard-activity-text">
                  View your medications
                </p>
              </button>

              <button
                type="button"
                onClick={() => setShowAppointments(true)}
                className="patient-dashboard-activity-card"
              >
                <div className="patient-dashboard-activity-icon patient-dashboard-activity-icon--calendar">
                  <Calendar />
                </div>
                <h3 className="patient-dashboard-activity-title">Schedule</h3>
                <p className="patient-dashboard-activity-text">View appointments</p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/medical-records')}
                className="patient-dashboard-activity-card"
              >
                <div className="patient-dashboard-activity-icon patient-dashboard-activity-icon--records">
                  <FileText />
                </div>
                <h3 className="patient-dashboard-activity-title">Records</h3>
                <p className="patient-dashboard-activity-text">Medical documents</p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/ai-consultation')}
                className="patient-dashboard-activity-card patient-dashboard-activity-card--primary"
              >
                <div className="patient-dashboard-activity-icon patient-dashboard-activity-icon--primary">
                  <Bot />
                </div>
                <h3 className="patient-dashboard-activity-title">AI Doctor</h3>
                <p className="patient-dashboard-activity-text">Get instant advice</p>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Appointments Modal */}
      {showAppointments && (
        <>
          <div
            className="patient-dashboard-modal-overlay"
            onClick={() => setShowAppointments(false)}
          />
          <div className="patient-dashboard-modal">
            <div className="patient-dashboard-modal-header">
              <h3 className="patient-dashboard-modal-title">
                <Calendar />
                My Appointments
              </h3>
              <button
                type="button"
                onClick={() => setShowAppointments(false)}
                className="patient-dashboard-modal-close"
              >
                <X />
              </button>
            </div>
            <div className="patient-dashboard-modal-body">
              {appointments.length > 0 ? (
                appointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.appointment_date);
                  const statusClass =
                    appointment.status === 'Confirmed'
                      ? 'patient-dashboard-modal-apt-card--confirmed'
                      : appointment.status === 'Pending'
                      ? 'patient-dashboard-modal-apt-card--pending'
                      : '';
                  const statusPillClass =
                    appointment.status === 'Confirmed'
                      ? 'patient-dashboard-modal-apt-status--confirmed'
                      : appointment.status === 'Pending'
                      ? 'patient-dashboard-modal-apt-status--pending'
                      : '';
                  return (
                    <div
                      key={appointment.id}
                      className={`patient-dashboard-modal-apt-card ${statusClass}`}
                    >
                      <div className="patient-dashboard-modal-apt-inner">
                        <div className="patient-dashboard-modal-apt-date">
                          <span className="patient-dashboard-modal-apt-date-month">
                            {appointmentDate.toLocaleDateString('en-US', {
                              month: 'short',
                            })}
                          </span>
                          <span className="patient-dashboard-modal-apt-date-day">
                            {appointmentDate.getDate()}
                          </span>
                        </div>
                        <div className="patient-dashboard-modal-apt-main">
                          <div className="patient-dashboard-modal-apt-doctor">
                            <div className="patient-dashboard-modal-apt-avatar">
                              {appointment.doctor?.profile_picture_url ? (
                                <img
                                  src={getImageUrl(appointment.doctor.profile_picture_url)}
                                  alt=""
                                />
                              ) : (
                                <User />
                              )}
                            </div>
                            <div className="patient-dashboard-modal-apt-doctor-text">
                              <h4>Dr. {appointment.doctor?.name}</h4>
                              <p>{appointment.doctor?.specialization}</p>
                            </div>
                          </div>
                          <div className="patient-dashboard-modal-apt-meta">
                            <span>
                              <Clock />
                              {appointment.time_slot}
                            </span>
                            <span
                              className={`patient-dashboard-modal-apt-status ${statusPillClass}`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          {appointment.symptoms && (
                            <p className="patient-dashboard-modal-apt-symptoms">
                              <span>Symptoms:</span> {appointment.symptoms}
                            </p>
                          )}
                        </div>
                        <div className="patient-dashboard-modal-apt-actions">
                          {appointment.status === 'Confirmed' && (
                            <button
                              type="button"
                              className="patient-dashboard-modal-apt-join"
                            >
                              <Video />
                            </button>
                          )}
                          {appointment.status === 'Completed' && (
                            <button
                              type="button"
                              className="patient-dashboard-modal-apt-rate"
                            >
                              <Star />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="patient-dashboard-modal-empty">
                  <div className="patient-dashboard-modal-empty-icon">
                    <Calendar />
                  </div>
                  <p className="patient-dashboard-modal-empty-title">
                    No appointments scheduled
                  </p>
                  <p className="patient-dashboard-modal-empty-text">
                    Book an appointment with a doctor to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAppointments(false)}
                    className="patient-dashboard-modal-empty-cta"
                  >
                    Find a Doctor
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDashboard;
