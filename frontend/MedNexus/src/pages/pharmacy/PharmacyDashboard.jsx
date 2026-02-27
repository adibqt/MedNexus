import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Heart,
  LogOut,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  User,
  Phone,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Package,
  Truck,
  MessageSquare,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import './PharmacyDashboard.css';

/* ── Cache ──────────────────────────────── */
const CACHE_STATS = 'phd_stats_v2';
const CACHE_REQS = 'phd_requests_v2';
const CACHE_TTL = 3 * 60 * 1000;

const readCache = (k) => {
  try {
    const raw = sessionStorage.getItem(k);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(k); return null; }
    return data;
  } catch { return null; }
};

const writeCache = (k, d) => {
  try { sessionStorage.setItem(k, JSON.stringify({ ts: Date.now(), data: d })); } catch {}
};

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [pharmacy, setPharmacy] = useState(null);
  const [stats, setStats] = useState(() => readCache(CACHE_STATS) || { total_requests: 0, pending_requests: 0, quoted_requests: 0, accepted_requests: 0 });
  const [requests, setRequests] = useState(() => readCache(CACHE_REQS) || []);
  const [loading, setLoading] = useState(() => !readCache(CACHE_REQS));
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [quoteModal, setQuoteModal] = useState(null); // request object being quoted
  const [quoteItems, setQuoteItems] = useState([]);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* ── Auth helpers ──────────────────────── */
  const getPharmacyHeaders = useCallback(() => {
    const token = localStorage.getItem('pharmacy_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const pharmacyRequest = useCallback(async (endpoint, opts = {}) => {
    const url = `http://localhost:8000${endpoint}`;
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...getPharmacyHeaders(),
        ...(opts.headers || {}),
      },
    });
    if (res.status === 401 || res.status === 403) {
      // Try refresh
      const refreshToken = localStorage.getItem('pharmacy_refresh_token');
      if (refreshToken) {
        try {
          const rr = await fetch('http://localhost:8000/api/pharmacies/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (rr.ok) {
            const rd = await rr.json();
            localStorage.setItem('pharmacy_access_token', rd.access_token);
            // Retry
            const retry = await fetch(url, {
              ...opts,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${rd.access_token}`,
                ...(opts.headers || {}),
              },
            });
            const retryData = await retry.json();
            if (!retry.ok) throw new Error(retryData.detail || 'Request failed');
            return retryData;
          }
        } catch {}
      }
      navigate('/sign-in/pharmacy', { replace: true });
      throw new Error('Session expired');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
  }, [getPharmacyHeaders, navigate]);

  /* ── Data loading ──────────────────────── */
  const loadStats = useCallback(async () => {
    try {
      const s = await pharmacyRequest('/api/quotations/pharmacy/stats');
      setStats(s);
      writeCache(CACHE_STATS, s);
    } catch {}
  }, [pharmacyRequest]);

  const loadRequests = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache(CACHE_REQS);
      if (cached) { setRequests(cached); setLoading(false); return; }
    }
    force ? setRefreshing(true) : setLoading(true);
    try {
      const data = await pharmacyRequest('/api/quotations/pharmacy/requests');
      setRequests(data);
      writeCache(CACHE_REQS, data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pharmacyRequest]);

  const loadAll = useCallback(async (force = false) => {
    await Promise.all([loadStats(), loadRequests(force)]);
  }, [loadStats, loadRequests]);

  useEffect(() => {
    const token = localStorage.getItem('pharmacy_access_token');
    if (!token) { navigate('/sign-in/pharmacy', { replace: true }); return; }
    const user = localStorage.getItem('pharmacy_user');
    if (user) { try { setPharmacy(JSON.parse(user)); } catch {} }
    if (!hasFetched.current) { hasFetched.current = true; loadAll(); }
  }, [navigate, loadAll]);

  /* ── Quotation submit ───────────────────── */
  const openQuoteModal = (req) => {
    const meds = JSON.parse(req.medicines_snapshot || '[]');
    setQuoteItems(meds.map(m => ({
      medicine_name: m.name,
      available: true,
      unit_price: '',
      quantity: 1,
      note: '',
    })));
    setQuoteNotes('');
    setDeliveryAvailable(false);
    setDeliveryFee('');
    setQuoteModal(req);
  };

  const handleQuoteItemChange = (idx, field, value) => {
    setQuoteItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const calculateTotal = () => {
    return quoteItems.reduce((sum, item) => {
      if (!item.available) return sum;
      const price = parseFloat(item.unit_price) || 0;
      return sum + price * (parseInt(item.quantity) || 1);
    }, 0);
  };

  const handleSubmitQuote = async () => {
    setSubmitting(true);
    setError('');
    try {
      const items = quoteItems.map(item => ({
        ...item,
        unit_price: parseFloat(item.unit_price) || 0,
        quantity: parseInt(item.quantity) || 1,
        subtotal: item.available ? (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 1) : 0,
      }));
      await pharmacyRequest('/api/quotations/pharmacy/respond', {
        method: 'POST',
        body: JSON.stringify({
          request_id: quoteModal.id,
          items,
          total_amount: calculateTotal(),
          delivery_available: deliveryAvailable,
          delivery_fee: parseFloat(deliveryFee) || 0,
          notes: quoteNotes || null,
        }),
      });
      setQuoteModal(null);
      sessionStorage.removeItem(CACHE_REQS);
      sessionStorage.removeItem(CACHE_STATS);
      await loadAll(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Helpers ───────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem('pharmacy_access_token');
    localStorage.removeItem('pharmacy_refresh_token');
    localStorage.removeItem('pharmacy_user');
    localStorage.removeItem('pharmacy_id');
    localStorage.removeItem('pharmacy_name');
    sessionStorage.removeItem(CACHE_STATS);
    sessionStorage.removeItem(CACHE_REQS);
    navigate('/sign-in/pharmacy', { replace: true });
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const filtered = requests.filter(r => {
    const st = r.request ? r.request.status : r.status;
    if (activeTab === 'all') return true;
    return st === activeTab;
  });

  const statusColors = {
    pending: '#f59e0b',
    quoted: '#6366f1',
    accepted: '#10b981',
    rejected: '#ef4444',
  };

  const statusIcons = {
    pending: <Clock size={13} />,
    quoted: <Send size={13} />,
    accepted: <CheckCircle2 size={13} />,
    rejected: <XCircle size={13} />,
  };

  return (
    <div className="phd-page">
      {/* Header */}
      <header className="phd-header">
        <div className="phd-header-left">
          <div className="phd-logo">
            <Heart size={20} />
            <span>Med<b>Nexus</b></span>
          </div>
          <div className="phd-header-divider" />
          <div className="phd-header-info">
            <Building2 size={16} />
            <span>{pharmacy?.pharmacy_name || localStorage.getItem('pharmacy_name') || 'Pharmacy'}</span>
          </div>
        </div>
        <div className="phd-header-right">
          <button
            className={`phd-refresh-btn ${refreshing ? 'phd-refresh-btn--spin' : ''}`}
            onClick={() => loadAll(true)}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button className="phd-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <div className="phd-content">
        {/* Stats */}
        <div className="phd-stats">
          {[
            { label: 'Total Requests', value: stats.total_requests, icon: <FileText size={20} />, color: '#6366f1' },
            { label: 'Pending', value: stats.pending_requests, icon: <Clock size={20} />, color: '#f59e0b' },
            { label: 'Quoted', value: stats.quoted_requests, icon: <Send size={20} />, color: '#8b5cf6' },
            { label: 'Accepted', value: stats.accepted_requests, icon: <CheckCircle2 size={20} />, color: '#10b981' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="phd-stat-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="phd-stat-icon" style={{ background: `${s.color}14`, color: s.color }}>
                {s.icon}
              </div>
              <div className="phd-stat-info">
                <div className="phd-stat-value">{s.value}</div>
                <div className="phd-stat-label">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="phd-tabs">
          {['pending', 'quoted', 'accepted', 'rejected', 'all'].map((tab) => (
            <button
              key={tab}
              className={`phd-tab ${activeTab === tab ? 'phd-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span className="phd-tab-count">
                  {requests.filter(r => r.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="phd-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Requests list */}
        {loading ? (
          <div className="phd-loading"><div className="phd-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="phd-empty">
            <Package size={56} strokeWidth={1.2} />
            <h3>No {activeTab === 'all' ? '' : activeTab} requests</h3>
            <p>
              {activeTab === 'pending'
                ? 'When patients request quotations, they will appear here.'
                : 'No requests with this status yet.'}
            </p>
          </div>
        ) : (
          <div className="phd-list">
            {filtered.map((item, i) => {
              const req = item.request || item;
              const qResponse = item.response || null;
              const isOpen = expandedId === req.id;
              const meds = (() => { try { return JSON.parse(req.medicines_snapshot || '[]'); } catch { return []; } })();
              const quotedItems = (() => { try { return qResponse ? JSON.parse(qResponse.items || '[]') : []; } catch { return []; } })();
              return (
                <motion.div
                  key={req.id}
                  className={`phd-card ${isOpen ? 'phd-card--open' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button className="phd-card-header" onClick={() => setExpandedId(isOpen ? null : req.id)}>
                    <div className="phd-card-left">
                      <div className="phd-card-avatar">
                        <User size={18} />
                      </div>
                      <div className="phd-card-summary">
                        <div className="phd-card-patient">{req.patient_name || 'Patient'}</div>
                        {req.doctor_name && (
                          <div className="phd-card-doctor">
                            <Stethoscope size={12} /> Dr. {req.doctor_name}
                          </div>
                        )}
                        <div className="phd-card-date">{formatDate(req.created_at)}</div>
                      </div>
                    </div>
                    <div className="phd-card-right">
                      <span className="phd-card-med-count">
                        <Pill size={12} /> {meds.length} med{meds.length !== 1 ? 's' : ''}
                      </span>
                      <span className="phd-status-badge" style={{ background: `${statusColors[req.status]}18`, color: statusColors[req.status] }}>
                        {statusIcons[req.status]} {req.status}
                      </span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="phd-card-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="phd-detail-grid">
                          <div className="phd-detail-section">
                            <h4><User size={14} /> Patient Details</h4>
                            <div className="phd-detail-row">
                              <span>Name:</span> <strong>{req.patient_name || '—'}</strong>
                            </div>
                            <div className="phd-detail-row">
                              <span><Phone size={12} /> Phone:</span> <strong>{req.patient_phone || '—'}</strong>
                            </div>
                            {req.diagnosis && (
                              <div className="phd-detail-row">
                                <span>Diagnosis:</span> <strong>{req.diagnosis}</strong>
                              </div>
                            )}
                            {req.note && (
                              <div className="phd-detail-row">
                                <span><MessageSquare size={12} /> Note:</span> <strong>{req.note}</strong>
                              </div>
                            )}
                          </div>

                          <div className="phd-detail-section">
                            <h4><Pill size={14} /> Medicines Requested</h4>
                            <div className="phd-meds-list">
                              {meds.map((med, mi) => (
                                <div key={mi} className="phd-med-item">
                                  <div className="phd-med-num">{mi + 1}.</div>
                                  <div>
                                    <div className="phd-med-name">{med.name}</div>
                                    <div className="phd-med-detail">
                                      {med.dosage && <span>{med.dosage}</span>}
                                      {med.frequency && <span> · {med.frequency}</span>}
                                      {med.duration && <span> · {med.duration}</span>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {req.status === 'pending' && (
                          <div className="phd-card-actions">
                            <button className="phd-btn phd-btn--primary" onClick={() => openQuoteModal(req)}>
                              <DollarSign size={15} /> Send Quotation
                            </button>
                          </div>
                        )}

                        {req.status === 'accepted' && (
                          <div className="phd-accepted-banner">
                            <CheckCircle2 size={16} /> Patient accepted your quotation
                          </div>
                        )}

                        {/* Show submitted quotation pricing for quoted/accepted */}
                        {(req.status === 'accepted' || req.status === 'quoted') && qResponse && quotedItems.length > 0 && (
                          <div className="phd-quote-summary">
                            <h4><DollarSign size={14} /> Your Quotation</h4>
                            <div className="phd-quote-summary-table-wrap">
                              <table className="phd-quote-summary-table">
                                <thead>
                                  <tr>
                                    <th>Medicine</th>
                                    <th>Available</th>
                                    <th>Unit ৳</th>
                                    <th>Qty</th>
                                    <th>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {quotedItems.map((qi, qIdx) => (
                                    <tr key={qIdx} className={!qi.available ? 'phd-quote-row--unavail' : ''}>
                                      <td>{qi.medicine_name}</td>
                                      <td>{qi.available ? '✓' : '✗'}</td>
                                      <td>{qi.available ? `৳${(qi.unit_price || 0).toFixed(2)}` : '—'}</td>
                                      <td>{qi.available ? qi.quantity : '—'}</td>
                                      <td>{qi.available ? `৳${(qi.subtotal || 0).toFixed(2)}` : '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="phd-quote-summary-footer">
                              {qResponse.delivery_available && (
                                <div className="phd-quote-summary-row">
                                  <span><Truck size={13} /> Delivery Fee</span>
                                  <span>৳{(qResponse.delivery_fee || 0).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="phd-quote-summary-row phd-quote-summary-total">
                                <span>Total</span>
                                <span>৳{((qResponse.total_amount || 0) + (qResponse.delivery_available ? (qResponse.delivery_fee || 0) : 0)).toFixed(2)}</span>
                              </div>
                              {qResponse.notes && (
                                <div className="phd-quote-summary-notes">
                                  <MessageSquare size={12} /> {qResponse.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quote Modal ───────────────────── */}
      <AnimatePresence>
        {quoteModal && (
          <motion.div
            className="phd-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuoteModal(null)}
          >
            <motion.div
              className="phd-modal"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="phd-modal-header">
                <h2><DollarSign size={20} /> Send Quotation</h2>
                <p>for {quoteModal.patient_name || 'Patient'}</p>
              </div>

              <div className="phd-modal-body">
                {/* Itemised pricing table */}
                <div className="phd-quote-table-wrap">
                  <table className="phd-quote-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th style={{ width: 70 }}>Avail.</th>
                        <th style={{ width: 100 }}>Unit ৳</th>
                        <th style={{ width: 70 }}>Qty</th>
                        <th style={{ width: 100 }}>Subtotal</th>
                        <th style={{ width: 120 }}>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.map((item, idx) => {
                        const sub = item.available ? (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 1) : 0;
                        return (
                          <tr key={idx} className={!item.available ? 'phd-quote-row--unavail' : ''}>
                            <td className="phd-quote-med">{item.medicine_name}</td>
                            <td>
                              <label className="phd-toggle">
                                <input
                                  type="checkbox"
                                  checked={item.available}
                                  onChange={(e) => handleQuoteItemChange(idx, 'available', e.target.checked)}
                                />
                                <span className="phd-toggle-slider" />
                              </label>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => handleQuoteItemChange(idx, 'unit_price', e.target.value)}
                                disabled={!item.available}
                                className="phd-quote-input"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuoteItemChange(idx, 'quantity', e.target.value)}
                                disabled={!item.available}
                                className="phd-quote-input"
                              />
                            </td>
                            <td className="phd-quote-subtotal">৳{sub.toFixed(2)}</td>
                            <td>
                              <input
                                type="text"
                                value={item.note}
                                onChange={(e) => handleQuoteItemChange(idx, 'note', e.target.value)}
                                className="phd-quote-input"
                                placeholder="Optional"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="phd-quote-extras">
                  <div className="phd-quote-delivery">
                    <label className="phd-toggle-label">
                      <input
                        type="checkbox"
                        checked={deliveryAvailable}
                        onChange={(e) => setDeliveryAvailable(e.target.checked)}
                      />
                      <Truck size={15} /> Delivery Available
                    </label>
                    {deliveryAvailable && (
                      <div className="phd-quote-delivery-fee">
                        <span>Delivery Fee ৳</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={deliveryFee}
                          onChange={(e) => setDeliveryFee(e.target.value)}
                          className="phd-quote-input"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="phd-quote-notes">
                    <label>Notes (optional)</label>
                    <textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="e.g. Substitute available for unavailable items..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="phd-quote-total">
                  <span>Grand Total</span>
                  <span className="phd-quote-total-amount">
                    ৳{(calculateTotal() + (deliveryAvailable ? (parseFloat(deliveryFee) || 0) : 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="phd-modal-footer">
                <button className="phd-btn phd-btn--ghost" onClick={() => setQuoteModal(null)} disabled={submitting}>
                  Cancel
                </button>
                <button className="phd-btn phd-btn--primary" onClick={handleSubmitQuote} disabled={submitting}>
                  {submitting ? <div className="phd-spinner phd-spinner--sm" /> : <><Send size={15} /> Submit Quotation</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PharmacyDashboard;
