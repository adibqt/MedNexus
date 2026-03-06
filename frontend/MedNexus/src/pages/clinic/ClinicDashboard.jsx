import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
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
  Home,
  MessageSquare,
  AlertCircle,
  Building2,
  ClipboardList,
  Download,
  FileDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ClinicDashboard.css';

/* ── Cache ──────────────────────────────── */
const CACHE_STATS = 'cld_stats_v1';
const CACHE_REQS  = 'cld_requests_v1';
const CACHE_TTL   = 3 * 60 * 1000;

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

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [clinic, setClinic] = useState(null);
  const [stats, setStats] = useState(() => readCache(CACHE_STATS) || { total_requests: 0, pending_requests: 0, quoted_requests: 0, accepted_requests: 0, completed_requests: 0 });
  const [requests, setRequests] = useState(() => readCache(CACHE_REQS) || []);
  const [loading, setLoading] = useState(() => !readCache(CACHE_REQS));
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [quoteModal, setQuoteModal] = useState(null);
  const [quoteItems, setQuoteItems] = useState([]);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [homeCollectionAvailable, setHomeCollectionAvailable] = useState(false);
  const [homeCollectionFee, setHomeCollectionFee] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* ── Report state ──── */
  const [reportModal, setReportModal] = useState(null);
  const [reportItems, setReportItems] = useState([]);
  const [reportSummary, setReportSummary] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  /* ── Auth helpers ──────────────────────── */
  const getClinicHeaders = useCallback(() => {
    const token = localStorage.getItem('clinic_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const clinicRequest = useCallback(async (endpoint, opts = {}) => {
    const url = `http://localhost:8000${endpoint}`;
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...getClinicHeaders(),
        ...(opts.headers || {}),
      },
    });
    if (res.status === 401 || res.status === 403) {
      const refreshToken = localStorage.getItem('clinic_refresh_token');
      if (refreshToken) {
        try {
          const rr = await fetch('http://localhost:8000/api/clinics/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (rr.ok) {
            const rd = await rr.json();
            localStorage.setItem('clinic_access_token', rd.access_token);
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
      navigate('/sign-in/clinic', { replace: true });
      throw new Error('Session expired');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
  }, [getClinicHeaders, navigate]);

  /* ── Data loading ──────────────────────── */
  const loadStats = useCallback(async () => {
    try {
      const s = await clinicRequest('/api/lab-quotations/clinic/stats');
      setStats(s);
      writeCache(CACHE_STATS, s);
    } catch {}
  }, [clinicRequest]);

  const loadRequests = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache(CACHE_REQS);
      if (cached) { setRequests(cached); setLoading(false); return; }
    }
    force ? setRefreshing(true) : setLoading(true);
    try {
      const data = await clinicRequest('/api/lab-quotations/clinic/requests');
      setRequests(data);
      writeCache(CACHE_REQS, data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clinicRequest]);

  const loadAll = useCallback(async (force = false) => {
    await Promise.all([loadStats(), loadRequests(force)]);
  }, [loadStats, loadRequests]);

  useEffect(() => {
    const token = localStorage.getItem('clinic_access_token');
    if (!token) { navigate('/sign-in/clinic', { replace: true }); return; }
    const user = localStorage.getItem('clinic_user');
    if (user) { try { setClinic(JSON.parse(user)); } catch {} }
    if (!hasFetched.current) { hasFetched.current = true; loadAll(); }
  }, [navigate, loadAll]);

  /* ── Quotation submit ───────────────────── */
  const openQuoteModal = (req) => {
    const tests = (() => { try { return JSON.parse(req.lab_tests_snapshot || '[]'); } catch { return []; } })();
    setQuoteItems(tests.map(t => ({
      test_name: t.name,
      available: true,
      price: '',
      turnaround: '',
      note: '',
    })));
    setQuoteNotes('');
    setHomeCollectionAvailable(false);
    setHomeCollectionFee('');
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
      return sum + (parseFloat(item.price) || 0);
    }, 0);
  };

  const handleSubmitQuote = async () => {
    setSubmitting(true);
    setError('');
    try {
      const items = quoteItems.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0,
      }));
      await clinicRequest('/api/lab-quotations/clinic/respond', {
        method: 'POST',
        body: JSON.stringify({
          request_id: quoteModal.id,
          items,
          total_amount: calculateTotal(),
          home_collection_available: homeCollectionAvailable,
          home_collection_fee: parseFloat(homeCollectionFee) || 0,
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

  /* ── Report handlers ─────────────────── */
  const openReportModal = (req) => {
    const tests = (() => { try { return JSON.parse(req.lab_tests_snapshot || '[]'); } catch { return []; } })();
    setReportItems(tests.map(t => ({
      test_name: t.name,
      result: '',
      unit: '',
      reference_range: '',
      status: 'normal',
      remarks: '',
    })));
    setReportSummary('');
    setReportNotes('');
    setReportModal(req);
  };

  const handleReportItemChange = (idx, field, value) => {
    setReportItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSubmitReport = async () => {
    setSubmittingReport(true);
    setError('');
    try {
      await clinicRequest('/api/lab-reports/clinic/submit', {
        method: 'POST',
        body: JSON.stringify({
          request_id: reportModal.id,
          results: reportItems,
          summary: reportSummary || null,
          notes: reportNotes || null,
        }),
      });
      setReportModal(null);
      sessionStorage.removeItem(CACHE_REQS);
      sessionStorage.removeItem(CACHE_STATS);
      await loadAll(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleDownloadReport = async (requestId) => {
    setDownloadingPdf(requestId);
    try {
      const token = localStorage.getItem('clinic_access_token');
      const res = await fetch(`http://localhost:8000/api/lab-reports/clinic/request/${requestId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LabReport_${requestId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingPdf(null);
    }
  };

  /* ── Helpers ───────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem('clinic_access_token');
    localStorage.removeItem('clinic_refresh_token');
    localStorage.removeItem('clinic_user');
    localStorage.removeItem('clinic_id');
    localStorage.removeItem('clinic_name');
    sessionStorage.removeItem(CACHE_STATS);
    sessionStorage.removeItem(CACHE_REQS);
    navigate('/sign-in/clinic', { replace: true });
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    completed: '#0891b2',
  };

  const statusIcons = {
    pending: <Clock size={13} />,
    quoted: <Send size={13} />,
    accepted: <CheckCircle2 size={13} />,
    rejected: <XCircle size={13} />,
    completed: <ClipboardList size={13} />,
  };

  return (
    <div className="cld-page">
      {/* Header */}
      <header className="cld-header">
        <div className="cld-header-left">
          <div className="cld-logo">
            <Heart size={20} />
            <span>Med<b>Nexus</b></span>
          </div>
          <div className="cld-header-divider" />
          <div className="cld-header-info">
            <Building2 size={16} />
            <span>{clinic?.clinic_name || localStorage.getItem('clinic_name') || 'Clinic'}</span>
          </div>
        </div>
        <div className="cld-header-right">
          <button
            className={`cld-refresh-btn ${refreshing ? 'cld-refresh-btn--spin' : ''}`}
            onClick={() => loadAll(true)}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button className="cld-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <div className="cld-content">
        {/* Stats */}
        <div className="cld-stats">
          {[
            { label: 'Total Requests', value: stats.total_requests, icon: <FileText size={20} />, color: '#6366f1' },
            { label: 'Pending', value: stats.pending_requests, icon: <Clock size={20} />, color: '#f59e0b' },
            { label: 'Quoted', value: stats.quoted_requests, icon: <Send size={20} />, color: '#0891b2' },
            { label: 'Accepted', value: stats.accepted_requests, icon: <CheckCircle2 size={20} />, color: '#10b981' },
            { label: 'Completed', value: stats.completed_requests, icon: <ClipboardList size={20} />, color: '#0e7490' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="cld-stat-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="cld-stat-icon" style={{ background: `${s.color}14`, color: s.color }}>
                {s.icon}
              </div>
              <div className="cld-stat-info">
                <div className="cld-stat-value">{s.value}</div>
                <div className="cld-stat-label">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="cld-tabs">
          {['pending', 'quoted', 'accepted', 'completed', 'rejected', 'all'].map((tab) => (
            <button
              key={tab}
              className={`cld-tab ${activeTab === tab ? 'cld-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span className="cld-tab-count">
                  {requests.filter(r => (r.request ? r.request.status : r.status) === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="cld-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Requests list */}
        {loading ? (
          <div className="cld-loading"><div className="cld-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="cld-empty">
            <Package size={56} strokeWidth={1.2} />
            <h3>No {activeTab === 'all' ? '' : activeTab} requests</h3>
            <p>
              {activeTab === 'pending'
                ? 'When patients request lab test quotations, they will appear here.'
                : 'No requests with this status yet.'}
            </p>
          </div>
        ) : (
          <div className="cld-list">
            {filtered.map((item, i) => {
              const req = item.request || item;
              const qResponse = item.response || null;
              const isOpen = expandedId === req.id;
              const tests = (() => { try { return JSON.parse(req.lab_tests_snapshot || '[]'); } catch { return []; } })();
              const quotedItems = (() => { try { return qResponse ? JSON.parse(qResponse.items || '[]') : []; } catch { return []; } })();
              return (
                <motion.div
                  key={req.id}
                  className={`cld-card ${isOpen ? 'cld-card--open' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button className="cld-card-header" onClick={() => setExpandedId(isOpen ? null : req.id)}>
                    <div className="cld-card-left">
                      <div className="cld-card-avatar">
                        <User size={18} />
                      </div>
                      <div className="cld-card-summary">
                        <div className="cld-card-patient">{req.patient_name || 'Patient'}</div>
                        {req.doctor_name && (
                          <div className="cld-card-doctor">
                            <Stethoscope size={12} /> Dr. {req.doctor_name}
                          </div>
                        )}
                        <div className="cld-card-date">{formatDate(req.created_at)}</div>
                      </div>
                    </div>
                    <div className="cld-card-right">
                      <span className="cld-card-test-count">
                        <FlaskConical size={12} /> {tests.length} test{tests.length !== 1 ? 's' : ''}
                      </span>
                      <span className="cld-status-badge" style={{ background: `${statusColors[req.status]}18`, color: statusColors[req.status] }}>
                        {statusIcons[req.status]} {req.status}
                      </span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="cld-card-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="cld-detail-grid">
                          <div className="cld-detail-section">
                            <h4><User size={14} /> Patient Details</h4>
                            <div className="cld-detail-row">
                              <span>Name:</span> <strong>{req.patient_name || '—'}</strong>
                            </div>
                            <div className="cld-detail-row">
                              <span>Phone:</span> <strong>{req.patient_phone || '—'}</strong>
                            </div>
                            {req.diagnosis && (
                              <div className="cld-detail-row">
                                <span>Diagnosis:</span> <strong>{req.diagnosis}</strong>
                              </div>
                            )}
                            {req.note && (
                              <div className="cld-detail-row">
                                <span><MessageSquare size={12} /> Note:</span> <strong>{req.note}</strong>
                              </div>
                            )}
                          </div>

                          <div className="cld-detail-section">
                            <h4><FlaskConical size={14} /> Lab Tests Requested</h4>
                            <div className="cld-tests-list">
                              {tests.map((test, ti) => (
                                <div key={ti} className="cld-test-item">
                                  <div className="cld-test-num">{ti + 1}.</div>
                                  <div>
                                    <div className="cld-test-name">{test.name}</div>
                                    {test.instructions && (
                                      <div className="cld-test-detail">{test.instructions}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {req.status === 'pending' && (
                          <div className="cld-card-actions">
                            <button className="cld-btn cld-btn--primary" onClick={() => openQuoteModal(req)}>
                              <DollarSign size={15} /> Send Quotation
                            </button>
                          </div>
                        )}

                        {req.status === 'accepted' && (
                          <div className="cld-card-actions">
                            <div className="cld-accepted-banner">
                              <CheckCircle2 size={16} /> Patient accepted your quotation
                            </div>
                            <button className="cld-btn cld-btn--report" onClick={() => openReportModal(req)}>
                              <ClipboardList size={15} /> Submit Lab Report
                            </button>
                          </div>
                        )}

                        {req.status === 'completed' && (
                          <div className="cld-completed-banner">
                            <ClipboardList size={16} /> Lab report submitted
                            <button
                              className="cld-btn cld-btn--download"
                              onClick={() => handleDownloadReport(req.id)}
                              disabled={downloadingPdf === req.id}
                            >
                              {downloadingPdf === req.id ? <div className="cld-spinner cld-spinner--sm" /> : <><Download size={14} /> Download PDF</>}
                            </button>
                          </div>
                        )}

                        {/* Show submitted quotation pricing for quoted/accepted/completed */}
                        {['accepted', 'quoted', 'completed'].includes(req.status) && qResponse && quotedItems.length > 0 && (
                          <div className="cld-quote-summary">
                            <h4><DollarSign size={14} /> Your Quotation</h4>
                            <div className="cld-quote-summary-table-wrap">
                              <table className="cld-quote-summary-table">
                                <thead>
                                  <tr>
                                    <th>Test</th>
                                    <th>Available</th>
                                    <th>Price ৳</th>
                                    <th>Turnaround</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {quotedItems.map((qi, qIdx) => (
                                    <tr key={qIdx} className={!qi.available ? 'cld-quote-row--unavail' : ''}>
                                      <td>{qi.test_name}</td>
                                      <td>{qi.available ? '✓' : '✗'}</td>
                                      <td>{qi.available ? `৳${(qi.price || 0).toFixed(2)}` : '—'}</td>
                                      <td>{qi.available ? (qi.turnaround || '—') : '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="cld-quote-summary-footer">
                              {qResponse.home_collection_available && (
                                <div className="cld-quote-summary-row">
                                  <span><Home size={13} /> Home Collection Fee</span>
                                  <span>৳{(qResponse.home_collection_fee || 0).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="cld-quote-summary-row cld-quote-summary-total">
                                <span>Total</span>
                                <span>৳{((qResponse.total_amount || 0) + (qResponse.home_collection_available ? (qResponse.home_collection_fee || 0) : 0)).toFixed(2)}</span>
                              </div>
                              {qResponse.notes && (
                                <div className="cld-quote-summary-notes">
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
            className="cld-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuoteModal(null)}
          >
            <motion.div
              className="cld-modal"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cld-modal-header">
                <h2><DollarSign size={20} /> Send Lab Quotation</h2>
                <p>for {quoteModal.patient_name || 'Patient'}</p>
              </div>

              <div className="cld-modal-body">
                <div className="cld-quote-table-wrap">
                  <table className="cld-quote-table">
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th style={{ width: 70 }}>Avail.</th>
                        <th style={{ width: 100 }}>Price ৳</th>
                        <th style={{ width: 110 }}>Turnaround</th>
                        <th style={{ width: 120 }}>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.map((item, idx) => (
                        <tr key={idx} className={!item.available ? 'cld-quote-row--unavail' : ''}>
                          <td className="cld-quote-test">{item.test_name}</td>
                          <td>
                            <label className="cld-toggle">
                              <input
                                type="checkbox"
                                checked={item.available}
                                onChange={(e) => handleQuoteItemChange(idx, 'available', e.target.checked)}
                              />
                              <span className="cld-toggle-slider" />
                            </label>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleQuoteItemChange(idx, 'price', e.target.value)}
                              disabled={!item.available}
                              className="cld-quote-input"
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.turnaround}
                              onChange={(e) => handleQuoteItemChange(idx, 'turnaround', e.target.value)}
                              disabled={!item.available}
                              className="cld-quote-input"
                              placeholder="e.g. 24 hrs"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.note}
                              onChange={(e) => handleQuoteItemChange(idx, 'note', e.target.value)}
                              className="cld-quote-input"
                              placeholder="Optional"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="cld-quote-extras">
                  <div className="cld-quote-home-collection">
                    <label className="cld-toggle-label">
                      <input
                        type="checkbox"
                        checked={homeCollectionAvailable}
                        onChange={(e) => setHomeCollectionAvailable(e.target.checked)}
                      />
                      <Home size={15} /> Home Collection Available
                    </label>
                    {homeCollectionAvailable && (
                      <div className="cld-quote-home-fee">
                        <span>Home Collection Fee ৳</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={homeCollectionFee}
                          onChange={(e) => setHomeCollectionFee(e.target.value)}
                          className="cld-quote-input"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="cld-quote-notes">
                    <label>Notes (optional)</label>
                    <textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="e.g. Fasting required for certain tests..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="cld-quote-total">
                  <span>Grand Total</span>
                  <span className="cld-quote-total-amount">
                    ৳{(calculateTotal() + (homeCollectionAvailable ? (parseFloat(homeCollectionFee) || 0) : 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="cld-modal-footer">
                <button className="cld-btn cld-btn--ghost" onClick={() => setQuoteModal(null)} disabled={submitting}>
                  Cancel
                </button>
                <button className="cld-btn cld-btn--primary" onClick={handleSubmitQuote} disabled={submitting}>
                  {submitting ? <div className="cld-spinner cld-spinner--sm" /> : <><Send size={15} /> Submit Quotation</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Report Modal ───────────────────── */}
      <AnimatePresence>
        {reportModal && (
          <motion.div
            className="cld-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReportModal(null)}
          >
            <motion.div
              className="cld-modal cld-modal--report"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cld-modal-header">
                <h2><ClipboardList size={20} /> Submit Lab Report</h2>
                <p>for {reportModal.patient_name || 'Patient'}</p>
              </div>

              <div className="cld-modal-body">
                <div className="cld-report-table-wrap">
                  <table className="cld-report-table">
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th style={{ width: 100 }}>Result</th>
                        <th style={{ width: 70 }}>Unit</th>
                        <th style={{ width: 110 }}>Ref. Range</th>
                        <th style={{ width: 90 }}>Status</th>
                        <th style={{ width: 110 }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportItems.map((item, idx) => (
                        <tr key={idx} className={item.status === 'critical' ? 'cld-report-row--critical' : item.status === 'abnormal' ? 'cld-report-row--abnormal' : ''}>
                          <td className="cld-report-test">{item.test_name}</td>
                          <td>
                            <input
                              type="text"
                              value={item.result}
                              onChange={(e) => handleReportItemChange(idx, 'result', e.target.value)}
                              className="cld-quote-input"
                              placeholder="Value"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleReportItemChange(idx, 'unit', e.target.value)}
                              className="cld-quote-input"
                              placeholder="e.g. mg/dL"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.reference_range}
                              onChange={(e) => handleReportItemChange(idx, 'reference_range', e.target.value)}
                              className="cld-quote-input"
                              placeholder="e.g. 70-110"
                            />
                          </td>
                          <td>
                            <select
                              value={item.status}
                              onChange={(e) => handleReportItemChange(idx, 'status', e.target.value)}
                              className="cld-report-select"
                            >
                              <option value="normal">Normal</option>
                              <option value="abnormal">Abnormal</option>
                              <option value="critical">Critical</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.remarks}
                              onChange={(e) => handleReportItemChange(idx, 'remarks', e.target.value)}
                              className="cld-quote-input"
                              placeholder="Optional"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="cld-report-extras">
                  <div className="cld-quote-notes">
                    <label>Summary / Impression (optional)</label>
                    <textarea
                      value={reportSummary}
                      onChange={(e) => setReportSummary(e.target.value)}
                      placeholder="e.g. All values within normal range..."
                      rows={2}
                    />
                  </div>
                  <div className="cld-quote-notes">
                    <label>Notes for Patient (optional)</label>
                    <textarea
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      placeholder="e.g. Please consult your doctor with these results..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="cld-modal-footer">
                <button className="cld-btn cld-btn--ghost" onClick={() => setReportModal(null)} disabled={submittingReport}>
                  Cancel
                </button>
                <button className="cld-btn cld-btn--report" onClick={handleSubmitReport} disabled={submittingReport}>
                  {submittingReport ? <div className="cld-spinner cld-spinner--sm" /> : <><ClipboardList size={15} /> Submit Report</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClinicDashboard;
