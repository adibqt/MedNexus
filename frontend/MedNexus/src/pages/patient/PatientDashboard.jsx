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
import { useVideoCall } from '../../context/VideoCallContext';
import apiService from '../../services/api';
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
  const { initiateCall } = useVideoCall();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State management
  const [selected, setSelected] = useState([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [concerns, setConcerns] = useState(fallbackConcerns);
  const [symptoms, setSymptoms] = useState([]); // Store full symptom objects with specialization
  const [showNotifications, setShowNotifications] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);

  const doctorsCarouselRef = useRef(null);
  const carouselIntervalRef = useRef(null);
  const carouselPausedRef = useRef(false);

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

        // Load doctors and appointments from backend
        setLoadingDoctors(true);
        try {
          const [doctorsData, appointmentsData] = await Promise.all([
            apiService.getPublicDoctors(),
            apiService.getPatientAppointments(),
          ]);

          if (mounted) {
            setDoctors(doctorsData || []);
            setAppointments(appointmentsData || []);
            setLoadingDoctors(false);
          }
        } catch (e) {
          console.warn('Failed to load doctors or appointments from API.', e);
          if (mounted) {
            setLoadingDoctors(false);
          }
        }

        // Load symptoms from backend
        try {
          const symptomsData = await apiService.getAllSymptoms();
          if (mounted && Array.isArray(symptomsData) && symptomsData.length > 0) {
            const activeSymptoms = symptomsData.filter((s) => s.is_active);
            setSymptoms(activeSymptoms); // Store full symptom objects
            setConcerns(activeSymptoms.map((s) => s.name)); // Store names for display
          }
        } catch (e) {
          console.warn('Failed to load symptoms from API, using fallback list.', e);
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
    if (loadingDoctors) return;
    if (!doctors || doctors.length <= 1) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Clear any existing interval
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }

    carouselPausedRef.current = false;
    let scrollTimeout = null;
    let startDelayId = null;
    let pauseCarouselFn = null;
    let resumeCarouselFn = null;
    let handleScrollFn = null;

    // Setup carousel function
    const setupCarousel = (el) => {
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
        if (carouselPausedRef.current || !el) return;
        
        const step = getStep();
        if (!step) return;
        
        const scrollLeft = el.scrollLeft;
        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;
        const nearEnd = scrollLeft + clientWidth >= scrollWidth - 20;
        
        if (nearEnd) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: step, behavior: 'smooth' });
        }
      };

      pauseCarouselFn = () => {
        carouselPausedRef.current = true;
      };

      resumeCarouselFn = () => {
        carouselPausedRef.current = false;
      };

      handleScrollFn = () => {
        carouselPausedRef.current = true;
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          carouselPausedRef.current = false;
        }, 5000);
      };

      // Start carousel
      console.log('Carousel: Starting...');
      startDelayId = setTimeout(() => {
        console.log('Carousel: Interval started');
        carouselIntervalRef.current = window.setInterval(tick, 3000);
        // Also trigger first tick immediately
        setTimeout(tick, 500);
      }, 500);

      // Event listeners
      el.addEventListener('mouseenter', pauseCarouselFn);
      el.addEventListener('mouseleave', resumeCarouselFn);
      el.addEventListener('scroll', handleScrollFn, { passive: true });
    };

    // Retry mechanism to wait for element
    let retryCount = 0;
    const maxRetries = 15;
    let retryTimeoutId = null;
    
    const tryInit = () => {
      const el = doctorsCarouselRef.current;
      if (!el) {
        retryCount++;
        if (retryCount < maxRetries) {
          retryTimeoutId = setTimeout(tryInit, 200);
        } else {
          console.log('Carousel: Element not found after retries');
        }
        return;
      }

      // Check if scrolling is needed
      const needsScroll = el.scrollWidth > el.clientWidth;
      console.log('Carousel check:', {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        needsScroll,
        doctorsCount: doctors.length
      });

      if (!needsScroll) {
        console.log('Carousel: No scroll needed, content fits');
        return;
      }

      // Setup carousel
      setupCarousel(el);
    };

    // Start trying to initialize after a short delay
    retryTimeoutId = setTimeout(tryInit, 500);

    return () => {
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      if (startDelayId) clearTimeout(startDelayId);
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
        carouselIntervalRef.current = null;
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      const el = doctorsCarouselRef.current;
      if (el && pauseCarouselFn && resumeCarouselFn && handleScrollFn) {
        el.removeEventListener('mouseenter', pauseCarouselFn);
        el.removeEventListener('mouseleave', resumeCarouselFn);
        el.removeEventListener('scroll', handleScrollFn);
      }
    };
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
      
      // Find specializations for selected symptoms from database
      const selectedSymptoms = symptoms.filter((s) => selected.includes(s.name));
      
      // Get the specialization from the first selected symptom (or use the most common one)
      let preferredSpec = null;
      if (selectedSymptoms.length > 0) {
        // Find the first symptom with a specialization, or use the first symptom's specialization
        const specCounts = {};
        selectedSymptoms.forEach((symptom) => {
          if (symptom.specialization) {
            specCounts[symptom.specialization] = (specCounts[symptom.specialization] || 0) + 1;
          }
        });
        
        // Get the most common specialization, or the first one found
        if (Object.keys(specCounts).length > 0) {
          preferredSpec = Object.keys(specCounts).reduce((a, b) =>
            specCounts[a] > specCounts[b] ? a : b
          );
        } else {
          // Fallback: use the first symptom's specialization if available
          preferredSpec = selectedSymptoms[0]?.specialization || null;
        }
      }
      
      // If no specialization found, default to General Physician
      if (!preferredSpec) {
        preferredSpec = 'General Physician';
      }
      
      // Find matching doctors by exact specialization match
      const matchingDoctors = doctors.filter((d) => {
        if (!d.specialization) return false;
        // Case-insensitive exact match or contains match
        const docSpec = d.specialization.toLowerCase().trim();
        const targetSpec = preferredSpec.toLowerCase().trim();
        return docSpec === targetSpec || docSpec.includes(targetSpec) || targetSpec.includes(docSpec);
      });

      // If no exact match, try partial match
      const availableDoctors = matchingDoctors.length > 0 
        ? matchingDoctors 
        : doctors.filter((d) => {
            if (!d.specialization) return false;
            const docSpec = d.specialization.toLowerCase();
            const targetSpec = preferredSpec.toLowerCase();
            // Check if any word in the specialization matches
            const targetWords = targetSpec.split(' ');
            return targetWords.some(word => docSpec.includes(word));
          });

      // Final fallback: if still no match, use all doctors
      const finalDoctors = availableDoctors.length > 0 ? availableDoctors : doctors;

      if (finalDoctors.length > 0) {
        const suggestedDoctor = finalDoctors[0];
        setSuggestion({
          id: suggestedDoctor.id,
          name: suggestedDoctor.name,
          specialty: suggestedDoctor.specialization,
          photo_url: suggestedDoctor.profile_picture,
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
              onClick={() => navigate('/patient/ai-consultation')}
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
                    onClick={() => navigate(`/patient/book-appointment/${suggestion.id}`)}
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
                  {todayAppointment.doctor?.profile_picture_url || todayAppointment.doctor?.profile_picture ? (
                    <img
                      src={getImageUrl(todayAppointment.doctor.profile_picture_url || todayAppointment.doctor.profile_picture)}
                      alt=""
                    />
                  ) : (
                    <User />
                  )}
                </div>
                <div className="patient-dashboard-appointment-info">
                  <h3 className="patient-dashboard-appointment-name">
                    Dr. {todayAppointment.doctor_name || 'Unknown'}
                  </h3>
                  <p className="patient-dashboard-appointment-spec">
                    {todayAppointment.doctor_specialization || ''}
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
                    onClick={() => navigate(`/patient/book-appointment/${todayAppointment.doctor_id}`)}
                    className="patient-dashboard-appointment-more"
                  >
                    <ChevronRight />
                  </button>
                  {todayAppointment.status === 'Confirmed' && (
                    <button
                      type="button"
                      className="patient-dashboard-appointment-join"
                      onClick={() => initiateCall(todayAppointment.id)}
                      title="Start video call"
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
                        {doctor.profile_picture ? (
                          <img src={getImageUrl(doctor.profile_picture)} alt="" />
                        ) : (
                          <User />
                        )}
                      </div>
                    </div>
                    <div className="patient-dashboard-doctor-info">
                      <h3 className="patient-dashboard-doctor-name">Dr. {doctor.name}</h3>
                      <p className="patient-dashboard-doctor-spec">
                        <Stethoscope />
                        {doctor.specialization}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/patient/book-appointment/${doctor.id}`)}
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
                onClick={() => navigate('/patient/ai-consultation')}
                className="patient-dashboard-activity-card patient-dashboard-activity-card--ai"
              >
                <div className="patient-dashboard-activity-icon patient-dashboard-activity-icon--ai">
                  <Bot />
                </div>
                <h3 className="patient-dashboard-activity-title">AI Doctor</h3>
                <p className="patient-dashboard-activity-text">
                  Get instant consultation
                </p>
              </button>

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
                onClick={() => navigate('/patient/ai-consultation')}
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
                              <h4>Dr. {appointment.doctor_name || appointment.doctor?.name}</h4>
                              <p>
                                {appointment.doctor_specialization ||
                                  appointment.doctor?.specialization}
                              </p>
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
