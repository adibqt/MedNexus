import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    doctor_id: '',
    date: '',
    time: '',
    fullName: '',
    phone: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load doctors from API on mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsData = await apiService.getPublicDoctors();
        setDoctors(doctorsData || []);
      } catch (err) {
        console.warn('Failed to load doctors:', err);
      }
    };
    loadDoctors();
  }, []);

  const toLocalDate = (value) => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const todayIso = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const availability = {
    0: { label: 'Sun - Wed', start: '08:00', end: '17:00' },
    1: { label: 'Sun - Wed', start: '08:00', end: '17:00' },
    2: { label: 'Sun - Wed', start: '08:00', end: '17:00' },
    3: { label: 'Sun - Wed', start: '08:00', end: '17:00' },
    4: { label: 'Thu - Fri', start: '09:00', end: '17:00' },
    5: { label: 'Thu - Fri', start: '09:00', end: '17:00' },
    6: { label: 'Sat - Sun', start: '10:00', end: '17:00' },
  };

  const selectedDay = formData.date ? toLocalDate(formData.date)?.getDay() ?? null : null;
  const dayWindow = selectedDay !== null ? availability[selectedDay] : null;

  const timeOptions = useMemo(() => {
    const slots = [];
    const baseStart = dayWindow ? dayWindow.start : '08:00';
    const baseEnd = dayWindow ? dayWindow.end : '17:00';

    const now = new Date();
    const startDate = formData.date ? toLocalDate(formData.date) : new Date();
    startDate.setHours(0, 0, 0, 0);

    const [startH, startM] = baseStart.split(':').map(Number);
    const [endH, endM] = baseEnd.split(':').map(Number);

    const start = new Date(startDate);
    start.setHours(startH, startM, 0, 0);
    const end = new Date(startDate);
    end.setHours(endH, endM, 0, 0);

    // If selected date is today, bump start to the next 30-minute slot after now
    let cutoff = start;
    if (formData.date === todayIso) {
      cutoff = new Date(now);
      cutoff.setMinutes(Math.ceil(cutoff.getMinutes() / 30) * 30, 0, 0);
      if (cutoff > start) start.setTime(cutoff.getTime());
    }

    for (let t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + 30)) {
      if (formData.date === todayIso && t < cutoff) continue;
      slots.push(t.toTimeString().slice(0, 5));
    }
    return slots;
  }, [dayWindow, formData.date, todayIso]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'doctor') {
      const selectedDoctor = doctors.find(d => d.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        doctor_id: selectedDoctor ? selectedDoctor.id : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.doctor_id) {
      setError('Please select a doctor.');
      return;
    }

    if (!formData.date) {
      setError('Please select a date.');
      return;
    }

    if (!formData.time) {
      setError('Please select an available time.');
      return;
    }

    if (formData.date < todayIso) {
      setError('Date cannot be in the past.');
      return;
    }

    if (!timeOptions.includes(formData.time)) {
      setError('Selected time is not available.');
      return;
    }

    if (!user) {
      navigate('/sign-in/patient?redirect=' + encodeURIComponent(window.location.pathname + (window.location.search || '') + (window.location.hash || '#appointment')), { replace: true });
      return;
    }

    // User is logged in, proceed with appointment booking
    try {
      setLoading(true);
      
      // Prepare appointment data in the format backend expects
      const appointmentData = {
        doctor_id: formData.doctor_id,
        appointment_date: formData.date,
        appointment_time: formData.time,
        reason: formData.message || null,
        symptoms: null,
      };

      // Call backend API to book appointment
      const result = await apiService.bookAppointment(appointmentData);
      console.log('Appointment booked:', result);

      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        department: '',
        doctor: '',
        doctor_id: '',
        date: '',
        time: '',
        fullName: '',
        phone: '',
        message: '',
      });

      // Navigate to dashboard after 800ms
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 800);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="appointment" style={{ paddingTop: '50px', paddingBottom: '50px', backgroundColor: '#f9f9f9' }}>
      <div className="container mx-auto px-4">
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '32px', alignItems: 'center' }}>
          {/* Left Side - Image */}
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 16px 40px rgba(16, 185, 129, 0.12)',
              padding: '20px',
              border: '1px solid rgba(16, 185, 129, 0.12)'
            }}>
              <img 
                src="/novena/images/about/img-3.jpg" 
                alt="Doctor" 
                style={{ width: '100%', height: '380px', borderRadius: '12px', marginBottom: '16px', display: 'block', objectFit: 'contain', objectPosition: 'center' }}
              />
              <div style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '16px 18px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>Emergency Cases</h4>
                <p style={{ fontSize: '13px', lineHeight: '1.55', marginBottom: '6px', fontWeight: '600' }}>
                  Please call our emergency hotline for immediate assistance.
                </p>
                <h3 style={{ fontSize: '22px', fontWeight: '700' }}>+880-02-4821-39572</h3>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 16px 40px rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.12)'
            }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>
                Book an Appointment
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '18px' }}>Select a doctor and an available slot.</p>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
                {/* Doctor Selection */}
                <div>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <input
                    type="date"
                    name="date"
                    min={todayIso}
                    value={formData.date}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData(prev => ({ ...prev, time: '' }));
                    }}
                    style={{
                      padding: '13px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={!dayWindow}
                    style={{
                      padding: '13px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="" disabled>{dayWindow ? 'Select time' : 'Pick a date first'}</option>
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Full Name */}
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    padding: '13px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />

                {/* Phone Number */}
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    padding: '13px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />

                {/* Message */}
                <textarea
                  name="message"
                  placeholder="Message (optional)"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  style={{
                    padding: '13px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                ></textarea>

                {error && (
                  <div style={{ color: '#b91c1c', fontSize: '13px', fontWeight: '600', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>{error}</div>
                )}

                {success && (
                  <div style={{ 
                    color: '#059669', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    padding: '12px 16px', 
                    backgroundColor: '#d1fae5', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={18} strokeWidth={2.5} />
                    <span>Appointment booked successfully! Redirecting to dashboard...</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || success}
                  style={{
                    backgroundColor: loading || success ? '#9ca3af' : '#10b981',
                    color: 'white',
                    padding: '14px 18px',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading || success ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                    boxShadow: '0 12px 30px rgba(16, 185, 129, 0.28)',
                    opacity: loading || success ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => !loading && !success && (e.target.style.backgroundColor = '#0d9970')}
                  onMouseLeave={(e) => !loading && !success && (e.target.style.backgroundColor = '#10b981')}
                >
                  {loading ? 'Booking...' : success ? 'Appointment Booked!' : 'Make Appointment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentForm;
