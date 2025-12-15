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
  Search,
  ChevronRight,
  Video,
  Pill,
  Star,
  MapPin,
  Home,
  FileText,
  Settings,
  Menu,
  Droplets,
  Scale,
  X,
  Stethoscope,
  Thermometer,
  Bot,
  LayoutDashboard,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

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
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-poppins">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Welcome */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Med<span className="text-emerald-500">Nexus</span>
                </span>
              </div>
              <div className="hidden md:block pl-4 border-l border-slate-200">
                <p className="text-sm text-slate-500">{greeting},</p>
                <h1 className="text-lg font-semibold text-slate-800">
                  How do you feel today, {user?.name || 'Patient'}?
                </h1>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/ai-consultation')}
                className="hidden sm:flex items-center gap-3 px-10 py-4 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors font-medium text-base"
              >
                <Bot size={16} />
                <span>AI Doctor</span>
              </button>
              
              <button
                onClick={() => navigate('/patient/profile')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
              >
                <User size={18} />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Notifications"
              >
                <Bell size={22} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
                aria-label="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer under sticky header */}
      <div className="h-8 sm:h-10" />

      {/* Notification Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          showNotifications ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((notification) => {
              const NotifIcon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    notification.read
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        notification.read ? 'bg-slate-200 text-slate-500' : 'bg-blue-500 text-white'
                      }`}
                    >
                      <NotifIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 text-sm">{notification.title}</h4>
                      <p className="text-sm text-slate-600 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-200">
            <button className="w-full py-2.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium transition-colors">
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      {/* Notification Overlay */}
      {showNotifications && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Concerns/Symptoms Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 space-y-5">
            {/* Scrollable symptoms grid */}
            <div className="h-36 overflow-y-auto pr-1 custom-scrollbar border-b border-slate-100 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4">
                {concerns.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleConcern(c)}
                    className={`flex items-center gap-3 text-left transition-all ${
                      selected.includes(c)
                        ? 'text-teal-600 font-semibold'
                        : 'text-slate-700 hover:text-teal-600'
                    } bg-transparent border-0 p-0`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
                      selected.includes(c) ? 'bg-teal-500 ring-4 ring-teal-100' : 'bg-teal-500'
                    }`}></span>
                    <span className="text-base">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggest Doctor Button */}
            <button
              onClick={onSuggestDoctor}
              disabled={!selected.length || suggesting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                !selected.length || suggesting
                  ? 'bg-gradient-to-r from-teal-400/50 to-cyan-500/50 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {suggesting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Suggesting...
                </>
              ) : (
                'Suggest Doctor'
              )}
            </button>

            {/* Suggestion Card */}
            {suggestion && (
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    {suggestion.photo_url ? (
                      <img src={getImageUrl(suggestion.photo_url)} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <User size={28} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg">{suggestion.name}</h3>
                    <p className="text-blue-600 font-medium text-sm">{suggestion.specialty}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        {suggestion.rating.toFixed(1)} ({suggestion.total_ratings} reviews)
                      </span>
                      <span>•</span>
                      <span>{suggestion.experience_years} years exp.</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Recommended for: <span className="text-blue-600">{suggestion.concerns.join(', ')}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/doctor/${suggestion.id}`)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
                  >
                    <Calendar size={16} />
                    Book Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Spacer between sections */}
        <div className="h-8 sm:h-10 !mt-0" />

        {/* Today's Appointment */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden !mt-0">
          <div className="p-6 border-b border-slate-100 grid grid-cols-3 items-center">
            <div />
            <h2 className="text-lg font-semibold text-slate-800 text-center">Today's Appointment</h2>
            
            
            <div className="h-8 sm:h-10 !mt-0" />
          </div>
         
          <div className="p-6">
            {todayAppointment ? (
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                  {todayAppointment.doctor?.profile_picture_url ? (
                    <img src={getImageUrl(todayAppointment.doctor.profile_picture_url)} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Dr. {todayAppointment.doctor?.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{todayAppointment.doctor?.specialization}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(todayAppointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {todayAppointment.appointment_time}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        todayAppointment.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {todayAppointment.status}
                    </span>
                  </div>
                  {todayAppointment.reason && (
                    <p className="text-sm text-slate-600 mt-2">
                      <span className="font-medium">Reason:</span> {todayAppointment.reason}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/doctor/${todayAppointment.doctor_id}`)}
                    className="p-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                  >
                    <ChevronRight size={20} />
                  </button>
                  {todayAppointment.status === 'Confirmed' && (
                    <button className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
                      <Video size={20} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No appointments scheduled for today</p>
                <button
                  onClick={() => document.querySelector('.uh-doctors')?.scrollIntoView({ behavior: 'smooth' })}
                  className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Book an Appointment
                </button>
              </div>
            )}
          </div>
        </section>
    <div className="h-8 sm:h-10 !mt-0" />
        {/* Available Doctors */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 !mt-0">
          <div className="p-6 border-b border-slate-100 text-center">
            <h2 className="text-lg font-semibold text-slate-800">Available Doctors</h2>
            <div className="h-6 sm:h-7 !mt-0" />
            
          </div>
          
          <div className="p-6 pt-8">
            {loadingDoctors ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : doctors.length > 0 ? (
              <div
                ref={doctorsCarouselRef}
                className="flex gap-6 overflow-x-auto px-2 pt-2 pb-6 snap-x snap-mandatory no-scrollbar"
              >
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    data-carousel-item="doctor"
                    className="w-80 sm:w-96 shrink-0 snap-center bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="bg-slate-50 py-14 flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full bg-white border-2 border-slate-200 shadow-lg flex items-center justify-center overflow-hidden">
                        {doctor.profile_picture_url ? (
                          <img
                            src={getImageUrl(doctor.profile_picture_url)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={44} className="text-slate-600" />
                        )}
                      </div>
                    </div>

                    <div className="px-8 py-10">
                      <h3 className="text-xl font-semibold text-slate-900 text-center">{doctor.full_name}</h3>
                      <p className="mt-3 text-base text-slate-500 flex items-center justify-center gap-2">
                        <Stethoscope size={16} className="text-slate-400" />
                        {doctor.specialization}
                      </p>

                      <button
                        onClick={() => navigate(`/doctor/${doctor.id}`)}
                        className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-semibold text-base hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                      >
                        <Calendar size={18} />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope size={28} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No doctors available at the moment</p>
              </div>
            )}
          </div>
        </section>
 <div className="h-8 sm:h-10 !mt-0" />

        {/* My Activities */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 !mt-0">
          <div className="p-6 border-b border-slate-100 text-center">
            <h2 className="text-lg font-semibold text-slate-800">My Activities</h2>
          </div>
          <div className="h-8 sm:h-10 !mt-0" />
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/view-prescription')}
                className="p-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                  <Pill size={24} />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">Prescriptions</h3>
                <p className="text-xs text-slate-500 mt-1">View your medications</p>
              </button>

              <button
                onClick={() => setShowAppointments(true)}
                className="p-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">Schedule</h3>
                <p className="text-xs text-slate-500 mt-1">View appointments</p>
              </button>

              <button
                onClick={() => navigate('/medical-records')}
                className="p-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">Records</h3>
                <p className="text-xs text-slate-500 mt-1">Medical documents</p>
              </button>

              <button
                onClick={() => navigate('/ai-consultation')}
                className="p-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30 text-white group hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Bot size={24} />
                </div>
                <h3 className="font-semibold text-sm">AI Doctor</h3>
                <p className="text-xs text-white/80 mt-1">Get instant advice</p>
              </button>
            </div>
          </div>
        </section>
<div className="h-8 sm:h-10 !mt-0" />
       
      
      </main>

      {/* Appointments Modal */}
      {showAppointments && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAppointments(false)}
          />
          <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                My Appointments
              </h3>
              <button
                onClick={() => setShowAppointments(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.appointment_date);
                    return (
                      <div
                        key={appointment.id}
                        className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                          appointment.status === 'Confirmed'
                            ? 'bg-emerald-50 border-emerald-200'
                            : appointment.status === 'Pending'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center justify-center w-14 h-14 bg-white rounded-lg border shadow-sm shrink-0">
                            <span className="text-xs font-bold text-blue-600 uppercase">
                              {appointmentDate.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-slate-800">
                              {appointmentDate.getDate()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
                                {appointment.doctor?.profile_picture_url ? (
                                  <img src={getImageUrl(appointment.doctor.profile_picture_url)} alt="" className="w-full h-full rounded-lg object-cover" />
                                ) : (
                                  <User size={18} />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">Dr. {appointment.doctor?.name}</h4>
                                <p className="text-sm text-slate-500">{appointment.doctor?.specialization}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm">
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock size={14} />
                                {appointment.time_slot}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  appointment.status === 'Confirmed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : appointment.status === 'Pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {appointment.status}
                              </span>
                            </div>
                            {appointment.symptoms && (
                              <p className="text-sm text-slate-600 mt-2 truncate">
                                <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            {appointment.status === 'Confirmed' && (
                              <button className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
                                <Video size={18} />
                              </button>
                            )}
                            {appointment.status === 'Completed' && (
                              <button className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                                <Star size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={36} className="text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium mb-2">No appointments scheduled</p>
                  <p className="text-sm text-slate-500 mb-6">Book an appointment with a doctor to get started</p>
                  <button
                    onClick={() => {
                      setShowAppointments(false);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
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
