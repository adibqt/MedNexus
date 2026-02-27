import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Send,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Truck,
  Pill,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/api';
import './RequestQuotation.css';

const RequestQuotation = ({ prescriptionId, medicines }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [sending, setSending] = useState(null); // pharmacy_id being sent
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedQuote, setExpandedQuote] = useState(null);

  const loadPharmacies = useCallback(async () => {
    setLoadingPharmacies(true);
    try {
      const data = await apiService.request('/api/quotations/pharmacies');
      setPharmacies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPharmacies(false);
    }
  }, []);

  const loadQuotations = useCallback(async () => {
    setLoadingQuotations(true);
    try {
      const data = await apiService.request(`/api/quotations/patient/prescription/${prescriptionId}`);
      setQuotations(data);
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoadingQuotations(false);
    }
  }, [prescriptionId]);

  useEffect(() => {
    if (showPanel) {
      loadPharmacies();
      loadQuotations();
    }
  }, [showPanel, loadPharmacies, loadQuotations]);

  const handleSendRequest = async (pharmacyId) => {
    setSending(pharmacyId);
    setError('');
    setSuccess('');
    try {
      await apiService.request('/api/quotations/request', {
        method: 'POST',
        body: JSON.stringify({
          prescription_id: prescriptionId,
          pharmacy_id: pharmacyId,
          note: note || null,
        }),
      });
      setSuccess('Quotation request sent!');
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
      await apiService.request(`/api/quotations/patient/${requestId}/accept`, { method: 'PATCH' });
      await loadQuotations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await apiService.request(`/api/quotations/patient/${requestId}/reject`, { method: 'PATCH' });
      await loadQuotations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Pharmacies that already have a request
  const requestedPharmacyIds = new Set(
    quotations
      .filter(q => ['pending', 'quoted', 'accepted'].includes(q.request.status))
      .map(q => q.request.pharmacy_id)
  );

  const statusConfig = {
    pending: { icon: <Clock size={13} />, color: '#f59e0b', label: 'Pending' },
    quoted: { icon: <DollarSign size={13} />, color: '#6366f1', label: 'Quoted' },
    accepted: { icon: <CheckCircle2 size={13} />, color: '#10b981', label: 'Accepted' },
    rejected: { icon: <XCircle size={13} />, color: '#ef4444', label: 'Rejected' },
  };

  return (
    <div className="rq-wrapper">
      <button
        className={`rq-toggle-btn ${showPanel ? 'rq-toggle-btn--active' : ''}`}
        onClick={() => setShowPanel(!showPanel)}
      >
        <ShoppingCart size={15} />
        Request Medicine Quotation
        {quotations.length > 0 && (
          <span className="rq-badge">{quotations.length}</span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="rq-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rq-panel-inner">
              {/* Existing quotations */}
              {quotations.length > 0 && (
                <div className="rq-section">
                  <h4 className="rq-section-title">
                    <DollarSign size={14} /> Your Quotation Requests
                  </h4>
                  <div className="rq-quotes-list">
                    {quotations.map((q) => {
                      const st = statusConfig[q.request.status] || statusConfig.pending;
                      const isExpanded = expandedQuote === q.request.id;
                      const items = q.response?.items ? (() => { try { return JSON.parse(q.response.items); } catch { return []; } })() : [];
                      return (
                        <div key={q.request.id} className="rq-quote-card">
                          <div className="rq-quote-header" onClick={() => setExpandedQuote(isExpanded ? null : q.request.id)}>
                            <div className="rq-quote-left">
                              <Building2 size={14} />
                              <span className="rq-quote-pharmacy">{q.request.pharmacy_name || 'Pharmacy'}</span>
                              <span className="rq-quote-status" style={{ background: `${st.color}14`, color: st.color }}>
                                {st.icon} {st.label}
                              </span>
                            </div>
                            <div className="rq-quote-right">
                              {q.response && (
                                <span className="rq-quote-total">৳{parseFloat(q.response.total_amount).toFixed(2)}</span>
                              )}
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && q.response && (
                              <motion.div
                                className="rq-quote-detail"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <table className="rq-items-table">
                                  <thead>
                                    <tr>
                                      <th>Medicine</th>
                                      <th>Available</th>
                                      <th>Price</th>
                                      <th>Qty</th>
                                      <th>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {items.map((item, idx) => (
                                      <tr key={idx} className={!item.available ? 'rq-row--unavail' : ''}>
                                        <td>{item.medicine_name}</td>
                                        <td>{item.available ? '✓' : '✗'}</td>
                                        <td>৳{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                                        <td>{item.quantity}</td>
                                        <td>৳{parseFloat(item.subtotal || 0).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                <div className="rq-quote-summary">
                                  {q.response.delivery_available && (
                                    <div className="rq-delivery-info">
                                      <Truck size={13} /> Delivery available
                                      {q.response.delivery_fee > 0 && <span> — ৳{parseFloat(q.response.delivery_fee).toFixed(2)}</span>}
                                    </div>
                                  )}
                                  {q.response.notes && (
                                    <div className="rq-pharmacy-notes">{q.response.notes}</div>
                                  )}
                                  <div className="rq-total-row">
                                    <span>Total</span>
                                    <strong>৳{(parseFloat(q.response.total_amount) + (q.response.delivery_available ? parseFloat(q.response.delivery_fee || 0) : 0)).toFixed(2)}</strong>
                                  </div>
                                </div>

                                {q.request.status === 'quoted' && (
                                  <div className="rq-quote-actions">
                                    <button className="rq-act-btn rq-act-btn--accept" onClick={() => handleAccept(q.request.id)}>
                                      <CheckCircle2 size={14} /> Accept
                                    </button>
                                    <button className="rq-act-btn rq-act-btn--reject" onClick={() => handleReject(q.request.id)}>
                                      <XCircle size={14} /> Reject
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {isExpanded && !q.response && q.request.status === 'pending' && (
                            <div className="rq-waiting">
                              <Clock size={14} /> Waiting for pharmacy response...
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pharmacy list */}
              <div className="rq-section">
                <h4 className="rq-section-title">
                  <Building2 size={14} /> Available Pharmacies
                </h4>

                {/* Optional note */}
                <div className="rq-note-field">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add an optional note for the pharmacy..."
                    className="rq-note-input"
                  />
                </div>

                {error && (
                  <div className="rq-alert rq-alert--error">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                {success && (
                  <div className="rq-alert rq-alert--success">
                    <CheckCircle2 size={14} /> {success}
                  </div>
                )}

                {loadingPharmacies ? (
                  <div className="rq-loading"><div className="rq-spinner" /></div>
                ) : pharmacies.length === 0 ? (
                  <div className="rq-empty-text">No pharmacies available at the moment.</div>
                ) : (
                  <div className="rq-pharmacy-list">
                    {pharmacies.map((ph) => {
                      const alreadySent = requestedPharmacyIds.has(ph.id);
                      return (
                        <div key={ph.id} className={`rq-pharmacy-card ${alreadySent ? 'rq-pharmacy-card--sent' : ''}`}>
                          <div className="rq-pharmacy-info">
                            <div className="rq-pharmacy-avatar">
                              <Pill size={16} />
                            </div>
                            <div>
                              <div className="rq-pharmacy-name">{ph.pharmacy_name}</div>
                              <div className="rq-pharmacy-addr">
                                <MapPin size={11} /> {ph.city}{ph.state ? `, ${ph.state}` : ''}
                              </div>
                              <div className="rq-pharmacy-phone">
                                <Phone size={11} /> {ph.phone}
                              </div>
                            </div>
                          </div>
                          <div className="rq-pharmacy-action">
                            {alreadySent ? (
                              <span className="rq-sent-badge"><CheckCircle2 size={12} /> Sent</span>
                            ) : (
                              <button
                                className="rq-send-btn"
                                disabled={sending === ph.id}
                                onClick={() => handleSendRequest(ph.id)}
                              >
                                {sending === ph.id ? (
                                  <div className="rq-spinner rq-spinner--sm" />
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

export default RequestQuotation;
