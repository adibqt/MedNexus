import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Home,
  FlaskConical,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import './RequestLabQuotation.css';

const RequestLabQuotation = ({ prescriptionId, labTests }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [sending, setSending] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedQuote, setExpandedQuote] = useState(null);

  const loadClinics = useCallback(async () => {
    setLoadingClinics(true);
    try {
      const data = await apiService.request('/api/lab-quotations/clinics');
      setClinics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingClinics(false);
    }
  }, []);

  const loadQuotations = useCallback(async () => {
    setLoadingQuotations(true);
    try {
      const data = await apiService.request(`/api/lab-quotations/patient/prescription/${prescriptionId}`);
      setQuotations(data);
    } catch (err) {
      console.error('Failed to load lab quotations:', err);
    } finally {
      setLoadingQuotations(false);
    }
  }, [prescriptionId]);

  useEffect(() => {
    if (showPanel) {
      loadClinics();
      loadQuotations();
    }
  }, [showPanel, loadClinics, loadQuotations]);

  const handleSendRequest = async (clinicId) => {
    setSending(clinicId);
    setError('');
    setSuccess('');
    try {
      await apiService.request('/api/lab-quotations/request', {
        method: 'POST',
        body: JSON.stringify({
          prescription_id: prescriptionId,
          clinic_id: clinicId,
          note: note || null,
        }),
      });
      setSuccess('Lab quotation request sent!');
      await loadQuotations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setSending(null);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await apiService.request(`/api/lab-quotations/patient/${requestId}/accept`, { method: 'PATCH' });
      await loadQuotations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await apiService.request(`/api/lab-quotations/patient/${requestId}/reject`, { method: 'PATCH' });
      await loadQuotations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReRequest = async (clinicId) => {
    setSending(clinicId);
    setError('');
    setSuccess('');
    try {
      await apiService.request('/api/lab-quotations/request', {
        method: 'POST',
        body: JSON.stringify({
          prescription_id: prescriptionId,
          clinic_id: clinicId,
          note: note || null,
        }),
      });
      setSuccess('New lab quotation request sent!');
      await loadQuotations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setSending(null);
    }
  };

  // Clinics that already have an active (in-progress) request
  const requestedClinicIds = new Set(
    quotations
      .filter(q => ['pending', 'quoted'].includes(q.request.status))
      .map(q => q.request.clinic_id)
  );

  const statusConfig = {
    pending:  { icon: <Clock size={13} />,        color: '#f59e0b', label: 'Pending'  },
    quoted:   { icon: <DollarSign size={13} />,    color: '#0891b2', label: 'Quoted'   },
    accepted: { icon: <CheckCircle2 size={13} />,  color: '#10b981', label: 'Accepted' },
    rejected: { icon: <XCircle size={13} />,       color: '#ef4444', label: 'Rejected' },
  };

  return (
    <div className="rlq-wrapper">
      <button
        className={`rlq-toggle-btn ${showPanel ? 'rlq-toggle-btn--active' : ''}`}
        onClick={() => setShowPanel(!showPanel)}
      >
        <FlaskConical size={15} />
        Request Lab Test Quotation
        {quotations.length > 0 && (
          <span className="rlq-badge">{quotations.length}</span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="rlq-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rlq-panel-inner">
              {/* Existing quotations */}
              {quotations.length > 0 && (
                <div className="rlq-section">
                  <h4 className="rlq-section-title">
                    <DollarSign size={14} /> Your Lab Quotation Requests
                  </h4>
                  <div className="rlq-quotes-list">
                    {quotations.map((q) => {
                      const st = statusConfig[q.request.status] || statusConfig.pending;
                      const isExpanded = expandedQuote === q.request.id;
                      const items = q.response?.items ? (() => { try { return JSON.parse(q.response.items); } catch { return []; } })() : [];
                      return (
                        <div key={q.request.id} className="rlq-quote-card">
                          <div className="rlq-quote-header" onClick={() => setExpandedQuote(isExpanded ? null : q.request.id)}>
                            <div className="rlq-quote-left">
                              <Building2 size={14} />
                              <span className="rlq-quote-clinic">{q.request.clinic_name || 'Clinic'}</span>
                              <span className="rlq-quote-status" style={{ background: `${st.color}14`, color: st.color }}>
                                {st.icon} {st.label}
                              </span>
                            </div>
                            <div className="rlq-quote-right">
                              {q.response && (
                                <span className="rlq-quote-total">৳{parseFloat(q.response.total_amount).toFixed(2)}</span>
                              )}
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && q.response && (
                              <motion.div
                                className="rlq-quote-detail"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <table className="rlq-items-table">
                                  <thead>
                                    <tr>
                                      <th>Test</th>
                                      <th>Available</th>
                                      <th>Price</th>
                                      <th>Turnaround</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {items.map((item, idx) => (
                                      <tr key={idx} className={!item.available ? 'rlq-row--unavail' : ''}>
                                        <td>{item.test_name}</td>
                                        <td>{item.available ? '✓' : '✗'}</td>
                                        <td>৳{parseFloat(item.price || 0).toFixed(2)}</td>
                                        <td>{item.turnaround || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                <div className="rlq-quote-summary">
                                  {q.response.home_collection_available && (
                                    <div className="rlq-home-info">
                                      <Home size={13} /> Home collection available
                                      {q.response.home_collection_fee > 0 && <span> — ৳{parseFloat(q.response.home_collection_fee).toFixed(2)}</span>}
                                    </div>
                                  )}
                                  {q.response.notes && (
                                    <div className="rlq-clinic-notes">{q.response.notes}</div>
                                  )}
                                  <div className="rlq-total-row">
                                    <span>Total</span>
                                    <strong>৳{(parseFloat(q.response.total_amount) + (q.response.home_collection_available ? parseFloat(q.response.home_collection_fee || 0) : 0)).toFixed(2)}</strong>
                                  </div>
                                </div>

                                {q.request.status === 'quoted' && (
                                  <div className="rlq-quote-actions">
                                    <button className="rlq-act-btn rlq-act-btn--accept" onClick={() => handleAccept(q.request.id)}>
                                      <CheckCircle2 size={14} /> Accept
                                    </button>
                                    <button className="rlq-act-btn rlq-act-btn--reject" onClick={() => handleReject(q.request.id)}>
                                      <XCircle size={14} /> Reject
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {isExpanded && !q.response && q.request.status === 'pending' && (
                            <div className="rlq-waiting">
                              <Clock size={14} /> Waiting for clinic response...
                            </div>
                          )}

                          {/* Re-request button for finished quotations */}
                          {['accepted', 'rejected'].includes(q.request.status) && (
                            <div className="rlq-re-request">
                              <button
                                className="rlq-re-request-btn"
                                disabled={sending === q.request.clinic_id}
                                onClick={() => handleReRequest(q.request.clinic_id)}
                              >
                                {sending === q.request.clinic_id ? (
                                  <div className="rlq-spinner rlq-spinner--sm" />
                                ) : (
                                  <><Send size={13} /> Request New Quotation</>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clinic list */}
              <div className="rlq-section">
                <h4 className="rlq-section-title">
                  <Building2 size={14} /> Available Clinics
                </h4>

                {/* Optional note */}
                <div className="rlq-note-field">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add an optional note for the clinic..."
                    className="rlq-note-input"
                  />
                </div>

                {error && (
                  <div className="rlq-alert rlq-alert--error">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                {success && (
                  <div className="rlq-alert rlq-alert--success">
                    <CheckCircle2 size={14} /> {success}
                  </div>
                )}

                {loadingClinics ? (
                  <div className="rlq-loading"><div className="rlq-spinner" /></div>
                ) : clinics.length === 0 ? (
                  <div className="rlq-empty-text">No clinics available at the moment.</div>
                ) : (
                  <div className="rlq-clinic-list">
                    {clinics.map((cl) => {
                      const alreadySent = requestedClinicIds.has(cl.id);
                      return (
                        <div key={cl.id} className={`rlq-clinic-card ${alreadySent ? 'rlq-clinic-card--sent' : ''}`}>
                          <div className="rlq-clinic-info">
                            <div className="rlq-clinic-avatar">
                              <FlaskConical size={16} />
                            </div>
                            <div>
                              <div className="rlq-clinic-name">{cl.clinic_name}</div>
                              <div className="rlq-clinic-addr">
                                <MapPin size={11} /> {cl.city}{cl.state ? `, ${cl.state}` : ''}
                              </div>
                              <div className="rlq-clinic-phone">
                                <Phone size={11} /> {cl.phone}
                              </div>
                            </div>
                          </div>
                          <div className="rlq-clinic-action">
                            {alreadySent ? (
                              <span className="rlq-sent-badge"><CheckCircle2 size={12} /> Sent</span>
                            ) : (
                              <button
                                className="rlq-send-btn"
                                disabled={sending === cl.id}
                                onClick={() => handleSendRequest(cl.id)}
                              >
                                {sending === cl.id ? (
                                  <div className="rlq-spinner rlq-spinner--sm" />
                                ) : (
                                  <><Send size={13} /> Request</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RequestLabQuotation;
