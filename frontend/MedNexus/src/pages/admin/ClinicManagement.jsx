import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  FlaskConical,
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
import './ClinicManagement.css';

const ClinicManagement = ({ onPendingChange }) => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    fetchClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 1000 };
      if (statusFilter !== 'all') params.status_filter = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await apiService.getAllClinics(params);
      setClinics(data.clinics);
      const nextStats = { total: data.total, approved: data.approved, pending: data.pending };
      setStats(nextStats);
      if (onPendingChange) onPendingChange(nextStats.pending);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching clinics', err);
      setError(err.message || 'Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, approve) => {
    try {
      await apiService.updateClinicApproval(id, approve);
      setClinics((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_approved: approve, is_active: approve && c.is_active } : c,
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
      console.error('Error updating clinic approval', err);
      alert('Failed to update clinic approval.');
    }
  };

  const toggleActive = async (id) => {
    try {
      const clinic = clinics.find((c) => c.id === id);
      if (!clinic) return;
      const nextActive = !clinic.is_active;
      await apiService.updateClinicStatus(id, nextActive);
      setClinics((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: nextActive } : c)),
      );
    } catch (err) {
      console.error('Error updating clinic status', err);
      alert('Failed to update clinic status.');
    }
  };

  const getInitials = (name) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const totalPages = Math.ceil(clinics.length / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const currentClinics = clinics.slice(start, end);

  return (
    <div className="clinic-mgmt">
      {/* Header */}
      <div className="clinic-mgmt-header">
        <div className="clinic-mgmt-header-title">
          <h1>Clinic Management</h1>
          <p>Review and approve clinic registrations</p>
        </div>
        <div className="clinic-mgmt-header-actions">
          <button className="clinic-mgmt-pill">
            Pending approvals: <strong>{stats.pending}</strong>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="clinic-mgmt-stats">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="clinic-mgmt-stat-card">
          <div className="clinic-mgmt-stat-info">
            <h3>Total Clinics</h3>
            <p className="clinic-mgmt-stat-value">{stats.total}</p>
          </div>
          <div className="clinic-mgmt-stat-icon" style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)' }}>
            <FlaskConical size={18} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="clinic-mgmt-stat-card">
          <div className="clinic-mgmt-stat-info">
            <h3>Approved</h3>
            <p className="clinic-mgmt-stat-value">{stats.approved}</p>
          </div>
          <div className="clinic-mgmt-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
            <CheckCircle size={18} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="clinic-mgmt-stat-card">
          <div className="clinic-mgmt-stat-info">
            <h3>Pending</h3>
            <p className="clinic-mgmt-stat-value">{stats.pending}</p>
          </div>
          <div className="clinic-mgmt-stat-icon" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <Filter size={18} />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="clinic-mgmt-filters">
        <div className="clinic-mgmt-filters-row">
          <div className="clinic-mgmt-filter-group">
            <label>Search Clinics</label>
            <div className="clinic-mgmt-search-input">
              <Search />
              <input
                type="text"
                placeholder="Search by name, email, phone or licence..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="clinic-mgmt-filter-group" style={{ maxWidth: 190 }}>
            <label>Status</label>
            <select
              className="clinic-mgmt-filter-select"
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="clinic-mgmt-table-container">
        <div className="clinic-mgmt-table-header">
          <h2>All Clinics</h2>
          <span className="clinic-mgmt-table-count">{clinics.length} clinics</span>
        </div>

        <div className="clinic-mgmt-table-wrapper">
          <table className="clinic-mgmt-table">
            <thead>
              <tr>
                <th>Clinic</th>
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
                    <Loader className="animate-spin" style={{ margin: '0 auto', color: '#0891b2' }} size={28} />
                    <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading clinics...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    <p>Error: {error}</p>
                    <button onClick={fetchClinics} style={{ marginTop: '12px', padding: '8px 16px', background: '#0891b2', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer' }}>Retry</button>
                  </td>
                </tr>
              ) : currentClinics.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>No clinics found</p>
                  </td>
                </tr>
              ) : (
                currentClinics.map((cl) => (
                  <tr key={cl.id}>
                    <td>
                      <div className="clinic-mgmt-info">
                        <div className="clinic-mgmt-avatar">{getInitials(cl.clinic_name)}</div>
                        <div className="clinic-mgmt-details">
                          <div className="clinic-mgmt-name">{cl.clinic_name}</div>
                          <div className="clinic-mgmt-sub">{cl.city}{cl.state ? `, ${cl.state}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>{cl.owner_name}</td>
                    <td><span className="clinic-mgmt-licence">{cl.licence_number}</span></td>
                    <td>
                      <div className="clinic-mgmt-contact">
                        <span>{cl.email}</span>
                        <span>{cl.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className={`clinic-mgmt-status-pill ${cl.is_approved ? 'clinic-mgmt-status-pill--approved' : 'clinic-mgmt-status-pill--pending'}`}>
                        <span className="clinic-mgmt-status-dot" />
                        {cl.is_approved ? 'Approved' : 'Pending'}
                      </div>
                    </td>
                    <td>
                      <div className="clinic-mgmt-actions">
                        <button className="clinic-mgmt-action-btn view" title="View details" onClick={() => setSelectedClinic(cl)}>
                          <Eye size={14} />
                        </button>
                        {!cl.is_approved ? (
                          <>
                            <button className="clinic-mgmt-action-btn approve" title="Approve" onClick={() => handleApproval(cl.id, true)}>
                              <CheckCircle size={14} />
                            </button>
                            <button className="clinic-mgmt-action-btn reject" title="Reject" onClick={() => handleApproval(cl.id, false)}>
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button className="clinic-mgmt-action-btn reject" title={cl.is_active ? 'Deactivate' : 'Activate'} onClick={() => toggleActive(cl.id)}>
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
        <div className="clinic-mgmt-pagination">
          <div>
            Showing {start + 1} to {Math.min(end, clinics.length)} of {clinics.length} clinics
          </div>
          <div className="clinic-mgmt-pagination-controls">
            <button className="clinic-mgmt-pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} className={`clinic-mgmt-pagination-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
            ))}
            <button className="clinic-mgmt-pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>›</button>
          </div>
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedClinic && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="clinic-mgmt-modal-overlay" onClick={() => setSelectedClinic(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="clinic-mgmt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="clinic-mgmt-modal-header">
                <h3>Clinic Details</h3>
                <button className="clinic-mgmt-modal-close" onClick={() => setSelectedClinic(null)}>
                  <X size={16} />
                </button>
              </div>
              <div className="clinic-mgmt-modal-body">
                <div className="clinic-mgmt-detail-section">
                  <h4>Business Information</h4>
                  <div className="clinic-mgmt-detail-grid">
                    <div>
                      <div className="clinic-mgmt-detail-label"><FlaskConical size={13} /> Clinic Name</div>
                      <div className="clinic-mgmt-detail-value">{selectedClinic.clinic_name}</div>
                    </div>
                    <div>
                      <div className="clinic-mgmt-detail-label"><FileText size={13} /> Licence Number</div>
                      <div className="clinic-mgmt-detail-value">{selectedClinic.licence_number}</div>
                    </div>
                    <div className="clinic-mgmt-detail-full">
                      <div className="clinic-mgmt-detail-label"><MapPin size={13} /> Address</div>
                      <div className="clinic-mgmt-detail-value">
                        {selectedClinic.street_address}<br />
                        {selectedClinic.city}, {selectedClinic.state} {selectedClinic.postal_code}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="clinic-mgmt-detail-section">
                  <h4>Owner & Contact</h4>
                  <div className="clinic-mgmt-detail-grid">
                    <div>
                      <div className="clinic-mgmt-detail-label">Owner Name</div>
                      <div className="clinic-mgmt-detail-value">{selectedClinic.owner_name}</div>
                    </div>
                    <div>
                      <div className="clinic-mgmt-detail-label"><Mail size={13} /> Email</div>
                      <div className="clinic-mgmt-detail-value">{selectedClinic.email}</div>
                    </div>
                    <div>
                      <div className="clinic-mgmt-detail-label"><Phone size={13} /> Phone</div>
                      <div className="clinic-mgmt-detail-value">{selectedClinic.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="clinic-mgmt-detail-section">
                  <h4>Status</h4>
                  <div className="clinic-mgmt-detail-grid">
                    <div>
                      <div className="clinic-mgmt-detail-label">Approved</div>
                      <div className="clinic-mgmt-detail-value">{selectedClinic.is_approved ? 'Yes' : 'Pending'}</div>
                    </div>
                    <div>
                      <div className="clinic-mgmt-detail-label">Active</div>
                      <div className="clinic-mgmt-detail-value">{selectedClinic.is_active ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <div className="clinic-mgmt-detail-label">Registered</div>
                      <div className="clinic-mgmt-detail-value">
                        {selectedClinic.created_at ? new Date(selectedClinic.created_at).toLocaleDateString() : '-'}
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

export default ClinicManagement;
