import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CalendarDays, ArrowRight, Heart } from 'lucide-react';
import apiService from '../../services/api';
import './DoctorSchedule.css';

const defaultDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const [days, setDays] = useState(() =>
    defaultDays.reduce(
      (acc, d) => ({
        ...acc,
        [d]: {
          enabled: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(d),
          start: '09:00',
          end: '17:00',
        },
      }),
      {},
    ),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeCount = useMemo(
    () => Object.values(days).filter((d) => d.enabled).length,
    [days],
  );

  useEffect(() => {
    const token = localStorage.getItem('doctor_access_token');
    if (!token) {
      navigate('/sign-in/doctor', { replace: true });
    }
  }, [navigate]);

  const updateTime = (day, field, value) => {
    setDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.request('/api/doctors/schedule', {
        method: 'PUT',
        body: JSON.stringify(days),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('doctor_access_token') || ''}`,
        },
      });
      navigate('/doctor/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const firstSlot = useMemo(() => {
    const first = defaultDays.find((d) => days[d]?.enabled);
    if (!first) return 'Not set';
    const slot = days[first];
    return `${first}: ${slot.start} – ${slot.end}`;
  }, [days]);

  const previewSlots = useMemo(() => {
    const first = defaultDays.find((d) => days[d]?.enabled);
    if (!first) return [];
    const { start, end } = days[first];
    const [startH] = start.split(':').map(Number);
    const [endH] = end.split(':').map(Number);
    if (isNaN(startH) || isNaN(endH) || endH <= startH) return [];

    const slots = [];
    for (let h = startH; h < endH; h += 1) {
      const from = `${String(h).padStart(2, '0')}:00`;
      const to = `${String(h + 1).padStart(2, '0')}:00`;
      slots.push(`${from} – ${to}`);
    }
    return slots;
  }, [days]);

  return (
    <div className="doctor-schedule-page">
      <div className="doctor-schedule-shell">
        <div className="doctor-schedule-left">
          <div className="doctor-schedule-header">
            <div>
              <div className="doctor-schedule-title">Set your weekly schedule</div>
              <p className="doctor-schedule-subtitle">
                Choose which days you see patients and the time window for each day.
              </p>
            </div>
            <div className="doctor-schedule-pill">
              <Clock size={12} style={{ marginRight: 4 }} />
              Smart availability
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="doctor-schedule-grid">
              <div className="doctor-schedule-grid-head">
                <div className="doctor-schedule-grid-title">
                  Weekly availability
                </div>
                <div className="doctor-schedule-grid-badge">
                  {activeCount} active day{activeCount === 1 ? '' : 's'}
                </div>
              </div>

              <div className="doctor-schedule-days">
                {defaultDays.map((day) => {
                  const data = days[day];
                  const active = data.enabled;
                  return (
                    <div
                      key={day}
                      className={`doctor-schedule-day ${
                        active ? 'doctor-schedule-day--active' : ''
                      }`}
                    >
                      <div className="doctor-schedule-day-main">
                        <button
                          type="button"
                          className="doctor-schedule-checkbox"
                          onClick={() =>
                            setDays((prev) => ({
                              ...prev,
                              [day]: { ...prev[day], enabled: !prev[day].enabled },
                            }))
                          }
                        >
                          {active ? '✓' : ''}
                        </button>
                        <div>
                          <div className="doctor-schedule-day-label">{day}</div>
                          <div className="doctor-schedule-day-caption">
                            {active ? `${data.start} – ${data.end}` : 'Unavailable'}
                          </div>
                        </div>
                      </div>
                      {active && (
                        <div className="doctor-schedule-day-times">
                          <div className="doctor-schedule-time-field">
                            <label className="doctor-schedule-time-label">Start</label>
                            <input
                              type="time"
                              className="doctor-schedule-time-input"
                              value={data.start}
                              onChange={(e) =>
                                updateTime(day, 'start', e.target.value)
                              }
                            />
                          </div>
                          <div className="doctor-schedule-time-field">
                            <label className="doctor-schedule-time-label">End</label>
                            <input
                              type="time"
                              className="doctor-schedule-time-input"
                              value={data.end}
                              onChange={(e) => updateTime(day, 'end', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="doctor-schedule-footer">
                <p className="doctor-schedule-note">
                  You can fine‑tune slots later from your <span>Doctor Dashboard</span>.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="doctor-schedule-submit"
                >
                  {loading ? 'Saving…' : 'Save & continue'}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </div>

              {error && <div className="doctor-schedule-error">{error}</div>}
            </div>
          </form>
        </div>

        <div className="doctor-schedule-right">
          <div className="doctor-schedule-right-header">
            <div className="doctor-schedule-right-title">
              <CalendarDays size={14} style={{ marginRight: 6 }} />
              Live schedule preview
            </div>
            <div className="doctor-schedule-right-pill">
              <Heart size={11} style={{ marginRight: 4 }} />
              MedNexus
            </div>
          </div>

          <div className="doctor-schedule-summary">
            <div className="doctor-schedule-summary-row">
              <span className="doctor-schedule-summary-label">Active days</span>
              <span className="doctor-schedule-summary-value">{activeCount}</span>
            </div>
            <div className="doctor-schedule-summary-row">
              <span className="doctor-schedule-summary-label">First slot</span>
              <span className="doctor-schedule-summary-value">{firstSlot}</span>
            </div>
            {previewSlots.length > 0 && (
              <div className="doctor-schedule-summary-row">
                <span className="doctor-schedule-summary-label">Example 1‑hour slots</span>
                <span className="doctor-schedule-summary-value">
                  {previewSlots.slice(0, 3).join(', ')}
                  {previewSlots.length > 3 ? '…' : ''}
                </span>
              </div>
            )}
          </div>

          <p className="doctor-schedule-hint">
            Patients will only see **1‑hour appointment slots** generated between your start
            and end times for each active day.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;


