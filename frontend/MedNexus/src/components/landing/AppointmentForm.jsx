import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    date: '',
    time: '',
    fullName: '',
    phone: '',
    message: '',
  });
  const [error, setError] = useState('');

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

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

    navigate('/sign-in');
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
                <h3 style={{ fontSize: '22px', fontWeight: '700' }}>+1-800-456-7890</h3>
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
              <p style={{ color: '#6b7280', marginBottom: '18px' }}>Select a department, doctor, and an available slot.</p>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              {/* Department */}
              <div>
                <select
                  name="department"
                  value={formData.department}
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
                  <option value="">Select Department</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="dental">Dental</option>
                  <option value="general">General Medicine</option>
                </select>
              </div>

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
                  <option value="dr-ahmed">Dr. Ahmed Karim</option>
                  <option value="dr-fatima">Dr. Fatima Khan</option>
                  <option value="dr-ali">Dr. Ali Hassan</option>
                  <option value="dr-sara">Dr. Sara Ibrahim</option>
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
                placeholder="Message"
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
                <div style={{ color: '#b91c1c', fontSize: '13px', fontWeight: '600' }}>{error}</div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '14px 18px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  boxShadow: '0 12px 30px rgba(16, 185, 129, 0.28)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9970'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                Make Appointment
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
