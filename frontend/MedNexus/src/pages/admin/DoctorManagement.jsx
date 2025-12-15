import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Stethoscope,
  CheckCircle,
  X,
  Eye,
  Loader,
} from 'lucide-react';
import apiService from '../../services/api';
import './DoctorManagement.css';

const DoctorManagement = ({ onPendingChange }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | approved | pending
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { limit: 1000 };
      if (statusFilter !== 'all') params.status_filter = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await apiService.getAllDoctors(params);
      setDoctors(data.doctors);
      const nextStats = {
        total: data.total,
        approved: data.approved,
        pending: data.pending,
      };
      setStats(nextStats);
      if (onPendingChange) {
        onPendingChange(nextStats.pending);
      }
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching doctors', err);
      setError(err.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, approve) => {
    try {
      await apiService.updateDoctorApproval(id, approve);
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, is_approved: approve, is_active: approve && d.is_active } : d,
        ),
      );
      setStats((prev) => {
        const updated = {
          ...prev,
          approved: prev.approved + (approve ? 1 : -1),
          pending: prev.pending + (approve ? -1 : 1),
        };
        if (onPendingChange) {
          onPendingChange(updated.pending);
        }
        return updated;
      });
    } catch (err) {
      console.error('Error updating doctor approval', err);
      alert('Failed to update doctor approval.');
    }
  };

  const toggleActive = async (id) => {
    try {
      const doctor = doctors.find((d) => d.id === id);
      if (!doctor) return;

      const nextActive = !doctor.is_active;
      await apiService.updateDoctorStatus(id, nextActive);

      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_active: nextActive } : d)),
      );
    } catch (err) {
      console.error('Error updating doctor status', err);
      alert('Failed to update doctor status.');
    }
  };

  const getInitials = (name) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const filtered = doctors;
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const currentDoctors = filtered.slice(start, end);

  return (
    <div className="doctor-management">
      <div className="doctor-header">
        <div className="doctor-header-title">
          <h1>Doctor Management</h1>
          <p>Review and approve doctor sign-ups</p>
        </div>
        <div className="doctor-header-actions">
          <button className="doctor-pill">
            Pending approvals: <strong>{stats.pending}</strong>
          </button>
        </div>
      </div>

      <div className="doctor-stats">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="doctor-stat-card"
        >
          <div className="doctor-stat-info">
            <h3>Total Doctors</h3>
            <p className="doctor-stat-value">{stats.total}</p>
          </div>
          <div
            className="doctor-stat-icon"
            style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
          >
            <Stethoscope size={18} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="doctor-stat-card"
        >
          <div className="doctor-stat-info">
            <h3>Approved</h3>
            <p className="doctor-stat-value">{stats.approved}</p>
          </div>
          <div
            className="doctor-stat-icon"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            <CheckCircle size={18} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="doctor-stat-card"
        >
          <div className="doctor-stat-info">
            <h3>Pending</h3>
            <p className="doctor-stat-value">{stats.pending}</p>
          </div>
          <div
            className="doctor-stat-icon"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            <Filter size={18} />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="doctor-filters"
      >
        <div className="doctor-filters-row">
          <div className="doctor-filter-group">
            <label>Search Doctors</label>
            <div className="doctor-search-input">
              <Search />
              <input
                type="text"
                placeholder="Search by name, phone, specialization or BMDC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="doctor-filter-group" style={{ maxWidth: 190 }}>
            <label>Status</label>
            <select
              className="doctor-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="doctor-filter-group" style={{ maxWidth: 64 }}>
            <label>&nbsp;</label>
            <button className="doctor-filter-btn">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="doctor-table-container"
      >
        <div className="doctor-table-header">
          <h2>All Doctors</h2>
          <span className="doctor-table-count">{filtered.length} doctors</span>
        </div>

        <div className="doctor-table-wrapper">
          <table className="doctor-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>BMDC No.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader
                      className="animate-spin"
                      style={{ margin: '0 auto', color: '#4f46e5' }}
                      size={28}
                    />
                    <p style={{ marginTop: '12px', color: '#6b7280' }}>
                      Loading doctors...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    <p>Error: {error}</p>
                    <button
                      onClick={fetchDoctors}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        background: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '999px',
                        cursor: 'pointer',
                      }}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : currentDoctors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>No doctors found</p>
                  </td>
                </tr>
              ) : (
                currentDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>
                      <div className="doctor-info">
                        <div className="doctor-avatar">{getInitials(doctor.name)}</div>
                        <div className="doctor-details">
                          <div className="doctor-name">{doctor.name}</div>
                          <div className="doctor-phone">{doctor.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.bmdc_number}</td>
                    <td>
                      <div
                        className={`doctor-status-pill ${
                          doctor.is_approved
                            ? 'doctor-status-pill--approved'
                            : 'doctor-status-pill--pending'
                        }`}
                      >
                        <span className="doctor-status-dot" />
                        {doctor.is_approved ? 'Approved' : 'Pending'}
                      </div>
                    </td>
                    <td>
                      <div className="doctor-actions">
                        <button
                          className="doctor-action-btn view"
                          title="View details"
                          onClick={() => setSelectedDoctor(doctor)}
                        >
                          <Eye size={14} />
                        </button>
                        {!doctor.is_approved ? (
                          <>
                            <button
                              className="doctor-action-btn approve"
                              title="Approve"
                              onClick={() => handleApproval(doctor.id, true)}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              className="doctor-action-btn reject"
                              title="Reject"
                              onClick={() => handleApproval(doctor.id, false)}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="doctor-action-btn reject"
                            title={doctor.is_active ? 'Deactivate' : 'Activate'}
                            onClick={() => toggleActive(doctor.id)}
                          >
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

        <div className="doctor-pagination">
          <div>
            Showing {start + 1} to {Math.min(end, filtered.length)} of {filtered.length}{' '}
            doctors
          </div>
          <div className="doctor-pagination-controls">
            <button
              className="doctor-pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`doctor-pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="doctor-pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </motion.div>

      {/* Doctor details modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="doctor-modal-overlay"
            onClick={() => setSelectedDoctor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="doctor-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="doctor-modal-header">
                <h3>Doctor Details</h3>
                <button
                  className="doctor-modal-close"
                  onClick={() => setSelectedDoctor(null)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="doctor-modal-body">
                <div className="doctor-detail-section">
                  <h4>Profile</h4>
                  <div className="doctor-detail-grid">
                    <div>
                      <div className="doctor-detail-label">Full Name</div>
                      <div className="doctor-detail-value">{selectedDoctor.name}</div>
                    </div>
                    <div>
                      <div className="doctor-detail-label">Phone</div>
                      <div className="doctor-detail-value">{selectedDoctor.phone}</div>
                    </div>
                    <div>
                      <div className="doctor-detail-label">Specialization</div>
                      <div className="doctor-detail-value">
                        {selectedDoctor.specialization}
                      </div>
                    </div>
                    <div>
                      <div className="doctor-detail-label">BMDC Number</div>
                      <div className="doctor-detail-value">
                        {selectedDoctor.bmdc_number}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="doctor-detail-section">
                  <h4>Status</h4>
                  <div className="doctor-detail-grid">
                    <div>
                      <div className="doctor-detail-label">Approved</div>
                      <div className="doctor-detail-value">
                        {selectedDoctor.is_approved ? 'Yes' : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="doctor-detail-label">Active</div>
                      <div className="doctor-detail-value">
                        {selectedDoctor.is_active ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <div className="doctor-detail-label">Created At</div>
                      <div className="doctor-detail-value">
                        {selectedDoctor.created_at
                          ? new Date(selectedDoctor.created_at).toLocaleDateString()
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="doctor-detail-section">
                  <h4>Documents</h4>
                  <div className="doctor-detail-grid">
                    <div className="doctor-doc-item">
                      <div className="doctor-detail-label">Profile Picture</div>
                      {selectedDoctor.profile_picture ? (
                        <img
                          src={apiService.getProfilePictureUrl(selectedDoctor.profile_picture)}
                          alt={`${selectedDoctor.name} profile`}
                          className="doctor-profile-image"
                        />
                      ) : (
                        <div className="doctor-detail-value">Not uploaded</div>
                      )}
                    </div>
                    <div className="doctor-doc-item">
                      <div className="doctor-detail-label">MBBS Certificate</div>
                      {selectedDoctor.mbbs_certificate ? (
                        <a
                          href={apiService.getProfilePictureUrl(selectedDoctor.mbbs_certificate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="doctor-doc-link"
                        >
                          View MBBS Certificate
                        </a>
                      ) : (
                        <div className="doctor-detail-value">Not uploaded</div>
                      )}
                    </div>
                    <div className="doctor-doc-item">
                      <div className="doctor-detail-label">FCPS Certificate</div>
                      {selectedDoctor.fcps_certificate ? (
                        <a
                          href={apiService.getProfilePictureUrl(selectedDoctor.fcps_certificate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="doctor-doc-link"
                        >
                          View FCPS Certificate
                        </a>
                      ) : (
                        <div className="doctor-detail-value">Not uploaded</div>
                      )}
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

export default DoctorManagement;


