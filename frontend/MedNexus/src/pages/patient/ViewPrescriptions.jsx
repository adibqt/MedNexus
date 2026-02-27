import { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Stethoscope,
  Calendar,
  Pill,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import '../doctor/PrescriptionEditor.css';   /* reuse rx-* template styles */
import './ViewPrescriptions.css';

/* ── Cache helpers ────────────────────────────── */
const CACHE_KEY = 'vp_prescriptions_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* quota exceeded — ignore */ }
};

/* ── Lazy-loaded expanded prescription template ── */
const PrescriptionDetail = lazy(() => import('./PrescriptionDetail.jsx'));

const ViewPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState(() => readCache() || []);
  const [loading, setLoading] = useState(() => !readCache());
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasFetched = useRef(false);

  const loadPrescriptions = useCallback(async (force = false) => {
    /* If not forced, try cache first */
    if (!force) {
      const cached = readCache();
      if (cached) {
        setPrescriptions(cached);
        setLoading(false);
        return;
      }
    }
    try {
      force ? setRefreshing(true) : setLoading(true);
      const data = await apiService.getPatientPrescriptions();
      setPrescriptions(data);
      writeCache(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/sign-in/patient', { replace: true });
      return;
    }
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadPrescriptions();
    }
  }, [navigate, loadPrescriptions]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const handlePrint = (rxId) => {
    setExpandedId(rxId);
    // Small delay so the DOM expands before print
    setTimeout(() => window.print(), 350);
  };

  return (
    <div className="vp-page">
      <div className="vp-container">
        {/* Header */}
        <div className="vp-header">
          <button className="vp-back-btn" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div>
            <h1 className="vp-title">My Prescriptions</h1>
            <p className="vp-subtitle">View and print prescriptions issued by your doctors</p>
          </div>
          <button
            className={`vp-refresh-btn ${refreshing ? 'vp-refresh-btn--spin' : ''}`}
            onClick={() => loadPrescriptions(true)}
            disabled={refreshing || loading}
            title="Refresh prescriptions"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="vp-stats">
          <div className="vp-stat">
            <div className="vp-stat-icon vp-stat-icon--teal"><FileText size={18} /></div>
            <div>
              <div className="vp-stat-value">{prescriptions.length}</div>
              <div className="vp-stat-label">Total prescriptions</div>
            </div>
          </div>
          <div className="vp-stat">
            <div className="vp-stat-icon vp-stat-icon--blue"><Stethoscope size={18} /></div>
            <div>
              <div className="vp-stat-value">
                {new Set(prescriptions.map((rx) => rx.doctor_name)).size}
              </div>
              <div className="vp-stat-label">Doctors</div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="vp-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="vp-loading"><div className="vp-spinner" /></div>
        ) : prescriptions.length === 0 ? (
          <div className="vp-empty">
            <FileText size={56} strokeWidth={1.2} />
            <h3>No prescriptions yet</h3>
            <p>Once your doctor issues a prescription after a consultation, it will appear here.</p>
          </div>
        ) : (
          <div className="vp-list">
            {prescriptions.map((rx, i) => {
              const isOpen = expandedId === rx.id;
              return (
                <motion.div
                  key={rx.id}
                  className={`vp-card ${isOpen ? 'vp-card--open' : ''}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {/* Collapsed row */}
                  <button className="vp-card-header" onClick={() => toggle(rx.id)}>
                    <div className="vp-card-left">
                      <div className="vp-card-avatar">
                        <Stethoscope size={18} />
                      </div>
                      <div className="vp-card-summary">
                        <div className="vp-card-doctor">Dr. {rx.doctor_name}</div>
                        <div className="vp-card-spec">{rx.doctor_specialization}</div>
                        <div className="vp-card-date">
                          <Calendar size={12} />
                          {formatDate(rx.appointment_date)}
                          {rx.appointment_time && <> &middot; {formatTime(rx.appointment_time)}</>}
                        </div>
                      </div>
                    </div>
                    <div className="vp-card-right-summary">
                      {rx.diagnosis && (
                        <span className="vp-card-diag-pill">{rx.diagnosis.length > 40 ? rx.diagnosis.slice(0, 40) + '…' : rx.diagnosis}</span>
                      )}
                      <span className="vp-card-med-count">
                        <Pill size={12} /> {rx.medicines?.length || 0} med{(rx.medicines?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* Expanded prescription view */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="vp-expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Suspense fallback={
                          <div className="vp-detail-loading"><div className="vp-spinner vp-spinner--sm" /></div>
                        }>
                          <PrescriptionDetail rx={rx} onPrint={handlePrint} />
                        </Suspense>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPrescriptions;
