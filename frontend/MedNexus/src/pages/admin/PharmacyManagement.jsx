import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Pill,
  CheckCircle,
  X,
  Eye,
  Loader,
  MapPin,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';
import apiService from '../../services/api';
import './PharmacyManagement.css';

const PharmacyManagement = ({ onPendingChange }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    fetchPharmacies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 1000 };
      if (statusFilter !== 'all') params.status_filter = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await apiService.getAllPharmacies(params);
      setPharmacies(data.pharmacies);
      const nextStats = { total: data.total, approved: data.approved, pending: data.pending };
      setStats(nextStats);
      if (onPendingChange) onPendingChange(nextStats.pending);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching pharmacies', err);
      setError(err.message || 'Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, approve) => {
    try {
      await apiService.updatePharmacyApproval(id, approve);
      setPharmacies((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, is_approved: approve, is_active: approve && p.is_active } : p,
        ),
      );
      setStats((prev) => {
        const updated = {
          ...prev,
          approved: prev.approved + (approve ? 1 : -1),
          pending: prev.pending + (approve ? -1 : 1),
        };
        if (onPendingChange) onPendingChange(updated.pending);
        return updated;
      });
    } catch (err) {
      console.error('Error updating pharmacy approval', err);
      alert('Failed to update pharmacy approval.');
    }
  };

  const toggleActive = async (id) => {
    try {
      const pharmacy = pharmacies.find((p) => p.id === id);
      if (!pharmacy) return;
      const nextActive = !pharmacy.is_active;
      await apiService.updatePharmacyStatus(id, nextActive);
      setPharmacies((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: nextActive } : p)),
      );
    } catch (err) {
      console.error('Error updating pharmacy status', err);
      alert('Failed to update pharmacy status.');
    }
  };

  const getInitials = (name) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const totalPages = Math.ceil(pharmacies.length / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const currentPharmacies = pharmacies.slice(start, end);

  return (
    <div className="pharm-mgmt">
      {/* Header */}
      <div className="pharm-mgmt-header">
        <div className="pharm-mgmt-header-title">
          <h1>Pharmacy Management</h1>
          <p>Review and approve pharmacy registrations</p>
        </div>
        <div className="pharm-mgmt-header-actions">
          <button className="pharm-mgmt-pill">
            Pending approvals: <strong>{stats.pending}</strong>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="pharm-mgmt-stats">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pharm-mgmt-stat-card">
          <div className="pharm-mgmt-stat-info">
            <h3>Total Pharmacies</h3>
            <p className="pharm-mgmt-stat-value">{stats.total}</p>
          </div>
          <div className="pharm-mgmt-stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
            <Pill size={18} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="pharm-mgmt-stat-card">
          <div className="pharm-mgmt-stat-info">
            <h3>Approved</h3>
            <p className="pharm-mgmt-stat-value">{stats.approved}</p>
          </div>
          <div className="pharm-mgmt-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
            <CheckCircle size={18} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pharm-mgmt-stat-card">
          <div className="pharm-mgmt-stat-info">
            <h3>Pending</h3>
            <p className="pharm-mgmt-stat-value">{stats.pending}</p>
          </div>
          <div className="pharm-mgmt-stat-icon" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <Filter size={18} />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pharm-mgmt-filters">
        <div className="pharm-mgmt-filters-row">
          <div className="pharm-mgmt-filter-group">
            <label>Search Pharmacies</label>
            <div className="pharm-mgmt-search-input">
              <Search />
              <input
                type="text"
                placeholder="Search by name, email, phone or licence..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="pharm-mgmt-filter-group" style={{ maxWidth: 190 }}>
            <label>Status</label>
            <select
              className="pharm-mgmt-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pharm-mgmt-table-container">
        <div className="pharm-mgmt-table-header">
          <h2>All Pharmacies</h2>
          <span className="pharm-mgmt-table-count">{pharmacies.length} pharmacies</span>
        </div>

        <div className="pharm-mgmt-table-wrapper">
          <table className="pharm-mgmt-table">
            <thead>
              <tr>
                <th>Pharmacy</th>
                <th>Owner</th>
                <th>Licence No.</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader className="animate-spin" style={{ margin: '0 auto', color: '#8b5cf6' }} size={28} />
                    <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading pharmacies...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    <p>Error: {error}</p>
                    <button onClick={fetchPharmacies} style={{ marginTop: '12px', padding: '8px 16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer' }}>Retry</button>
                  </td>
                </tr>
              ) : currentPharmacies.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>No pharmacies found</p>
                  </td>
                </tr>
              ) : (
                currentPharmacies.map((ph) => (
                  <tr key={ph.id}>
                    <td>
                      <div className="pharm-mgmt-info">
                        <div className="pharm-mgmt-avatar">{getInitials(ph.pharmacy_name)}</div>
                        <div className="pharm-mgmt-details">
                          <div className="pharm-mgmt-name">{ph.pharmacy_name}</div>
                          <div className="pharm-mgmt-sub">{ph.city}{ph.state ? `, ${ph.state}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>{ph.owner_name}</td>
                    <td><span className="pharm-mgmt-licence">{ph.licence_number}</span></td>
                    <td>
                      <div className="pharm-mgmt-contact">
                        <span>{ph.email}</span>
                        <span>{ph.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className={`pharm-mgmt-status-pill ${ph.is_approved ? 'pharm-mgmt-status-pill--approved' : 'pharm-mgmt-status-pill--pending'}`}>
                        <span className="pharm-mgmt-status-dot" />
                        {ph.is_approved ? 'Approved' : 'Pending'}
                      </div>
                    </td>
                    <td>
                      <div className="pharm-mgmt-actions">
                        <button className="pharm-mgmt-action-btn view" title="View details" onClick={() => setSelectedPharmacy(ph)}>
                          <Eye size={14} />
                        </button>
                        {!ph.is_approved ? (
                          <>
                            <button className="pharm-mgmt-action-btn approve" title="Approve" onClick={() => handleApproval(ph.id, true)}>
                              <CheckCircle size={14} />
                            </button>
                            <button className="pharm-mgmt-action-btn reject" title="Reject" onClick={() => handleApproval(ph.id, false)}>
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button className="pharm-mgmt-action-btn reject" title={ph.is_active ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(ph.id)}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pharm-mgmt-pagination">
          <div>
            Showing {start + 1} to {Math.min(end, pharmacies.length)} of {pharmacies.length} pharmacies
          </div>
          <div className="pharm-mgmt-pagination-controls">
            <button className="pharm-mgmt-pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} className={`pharm-mgmt-pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
            ))}
            <button className="pharm-mgmt-pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>›</button>
          </div>
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedPharmacy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pharm-mgmt-modal-overlay" onClick={() => setSelectedPharmacy(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="pharm-mgmt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pharm-mgmt-modal-header">
                <h3>Pharmacy Details</h3>
                <button className="pharm-mgmt-modal-close" onClick={() => setSelectedPharmacy(null)}>
                  <X size={16} />
                </button>
              </div>
              <div className="pharm-mgmt-modal-body">
                <div className="pharm-mgmt-detail-section">
                  <h4>Business Information</h4>
                  <div className="pharm-mgmt-detail-grid">
                    <div>
                      <div className="pharm-mgmt-detail-label"><Pill size={13} /> Pharmacy Name</div>
                      <div className="pharm-mgmt-detail-value">{selectedPharmacy.pharmacy_name}</div>
                    </div>
                    <div>
                      <div className="pharm-mgmt-detail-label"><FileText size={13} /> Licence Number</div>
                      <div className="pharm-mgmt-detail-value">{selectedPharmacy.licence_number}</div>
                    </div>
                    <div className="pharm-mgmt-detail-full">
                      <div className="pharm-mgmt-detail-label"><MapPin size={13} /> Address</div>
                      <div className="pharm-mgmt-detail-value">
                        {selectedPharmacy.street_address}<br />
                        {selectedPharmacy.city}, {selectedPharmacy.state} {selectedPharmacy.postal_code}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pharm-mgmt-detail-section">
                  <h4>Owner & Contact</h4>
                  <div className="pharm-mgmt-detail-grid">
                    <div>
                      <div className="pharm-mgmt-detail-label">Owner Name</div>
                      <div className="pharm-mgmt-detail-value">{selectedPharmacy.owner_name}</div>
                    </div>
                    <div>
                      <div className="pharm-mgmt-detail-label"><Mail size={13} /> Email</div>
                      <div className="pharm-mgmt-detail-value">{selectedPharmacy.email}</div>
                    </div>
                    <div>
                      <div className="pharm-mgmt-detail-label"><Phone size={13} /> Phone</div>
                      <div className="pharm-mgmt-detail-value">{selectedPharmacy.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="pharm-mgmt-detail-section">
                  <h4>Status</h4>
                  <div className="pharm-mgmt-detail-grid">
                    <div>
                      <div className="pharm-mgmt-detail-label">Approved</div>
                      <div className="pharm-mgmt-detail-value">{selectedPharmacy.is_approved ? 'Yes' : 'Pending'}</div>
                    </div>
                    <div>
                      <div className="pharm-mgmt-detail-label">Active</div>
                      <div className="pharm-mgmt-detail-value">{selectedPharmacy.is_active ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <div className="pharm-mgmt-detail-label">Registered</div>
                      <div className="pharm-mgmt-detail-value">
                        {selectedPharmacy.created_at ? new Date(selectedPharmacy.created_at).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PharmacyManagement;
