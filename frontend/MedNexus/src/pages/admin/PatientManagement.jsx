import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Eye,
  Ban,
  CheckCircle,
  X,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Loader,
} from 'lucide-react';
import apiService from '../../services/api';
import './PatientManagement.css';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  // Stats from API
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
  });

  // Fetch patients from backend
  useEffect(() => {
    fetchPatients();
  }, [statusFilter, searchQuery]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: 1000, // Get all patients
      };
      
      if (statusFilter !== 'all') {
        params.status_filter = statusFilter;
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await apiService.getAllPatients(params);
      
      setPatients(response.patients);
      setStats({
        total: response.total,
        active: response.active,
        inactive: response.inactive,
        newThisMonth: response.new_this_month,
      });
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for display
  const totalPatients = stats.total;
  const activePatients = stats.active;
  const inactivePatients = stats.inactive;
  const newThisMonth = stats.newThisMonth;

  // Filter patients (client-side gender filter only, since backend handles status and search)
  const filteredPatients = patients.filter((patient) => {
    const matchesGender = genderFilter === 'all' || 
      (patient.age && patient.age > 0); // Mock gender filtering - you'll need to add gender field to Patient model
    return matchesGender;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Toggle patient status
  const togglePatientStatus = async (patientId) => {
    try {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) return;

      const newStatus = !patient.is_active;
      
      // Update backend
      await apiService.updatePatientStatus(patientId, newStatus);
      
      // Update local state
      setPatients(
        patients.map((p) =>
          p.id === patientId ? { ...p, is_active: newStatus } : p
        )
      );
      
      // Update stats
      if (newStatus) {
        setStats((prev) => ({
          ...prev,
          active: prev.active + 1,
          inactive: prev.inactive - 1,
        }));
      } else {
        setStats((prev) => ({
          ...prev,
          active: prev.active - 1,
          inactive: prev.inactive + 1,
        }));
      }
    } catch (err) {
      console.error('Error updating patient status:', err);
      alert('Failed to update patient status. Please try again.');
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="patient-management">
      {/* Header */}
      <div className="patient-header">
        <div className="patient-header-title">
          <h1>Patient Management</h1>
          <p>Manage and monitor all registered patients</p>
        </div>
        <div className="patient-header-actions">
          <button className="patient-export-btn">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button className="patient-add-btn">
            <UserPlus size={18} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="patient-stats">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="patient-stat-card"
        >
          <div className="patient-stat-content">
            <div className="patient-stat-info">
              <h3>Total Patients</h3>
              <p className="patient-stat-value">{totalPatients}</p>
            </div>
            <div
              className="patient-stat-icon"
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
            >
              <Users />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="patient-stat-card"
        >
          <div className="patient-stat-content">
            <div className="patient-stat-info">
              <h3>Active</h3>
              <p className="patient-stat-value">{activePatients}</p>
            </div>
            <div
              className="patient-stat-icon"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              <UserCheck />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="patient-stat-card"
        >
          <div className="patient-stat-content">
            <div className="patient-stat-info">
              <h3>Inactive</h3>
              <p className="patient-stat-value">{inactivePatients}</p>
            </div>
            <div
              className="patient-stat-icon"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <UserX />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="patient-stat-card"
        >
          <div className="patient-stat-content">
            <div className="patient-stat-info">
              <h3>New This Month</h3>
              <p className="patient-stat-value">{newThisMonth}</p>
            </div>
            <div
              className="patient-stat-icon"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Activity />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="patient-filters"
      >
        <div className="patient-filters-row">
          <div className="patient-filter-group">
            <label>Search Patients</label>
            <div className="patient-search-input">
              <Search />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="patient-filter-group">
            <label>Status</label>
            <select
              className="patient-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="patient-filter-group">
            <label>Gender</label>
            <select
              className="patient-filter-select"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="patient-filter-group">
            <label>&nbsp;</label>
            <button className="patient-filter-btn">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="patient-table-container"
      >
        <div className="patient-table-header">
          <h2>All Patients</h2>
          <span className="patient-table-count">{filteredPatients.length} patients</span>
        </div>

        <div className="patient-table-wrapper">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Last Visit</th>
                <th>Appointments</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader className="animate-spin" style={{ margin: '0 auto', color: '#10b981' }} size={32} />
                    <p style={{ marginTop: '16px', color: '#64748b' }}>Loading patients...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    <p>Error: {error}</p>
                    <button 
                      onClick={fetchPatients}
                      style={{ 
                        marginTop: '12px', 
                        padding: '8px 16px', 
                        background: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : currentPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <p>No patients found</p>
                  </td>
                </tr>
              ) : (
                currentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-info">
                        <div className="patient-avatar">{getInitials(patient.name)}</div>
                        <div className="patient-details">
                          <div className="patient-name">{patient.name}</div>
                          <div className="patient-email">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{patient.phone}</td>
                    <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                    <td>{patient.last_login ? new Date(patient.last_login).toLocaleDateString() : 'Never'}</td>
                    <td>-</td>
                    <td>
                      <span className={`patient-status ${patient.is_active ? 'active' : 'inactive'}`}>
                        <span className="patient-status-dot" />
                        {patient.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="patient-actions">
                        <button
                          className="patient-action-btn view"
                          title="View Details"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <Eye size={16} />
                        </button>
                        {patient.is_active ? (
                          <button
                            className="patient-action-btn deactivate"
                            title="Deactivate"
                            onClick={() => togglePatientStatus(patient.id)}
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button
                            className="patient-action-btn activate"
                            title="Activate"
                            onClick={() => togglePatientStatus(patient.id)}
                          >
                            <CheckCircle size={16} />
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
        <div className="patient-pagination">
          <div className="patient-pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredPatients.length)} of{' '}
            {filteredPatients.length} patients
          </div>
          <div className="patient-pagination-controls">
            <button
              className="patient-pagination-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`patient-pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="patient-pagination-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </motion.div>

      {/* Patient Details Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="patient-modal-overlay"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="patient-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="patient-modal-header">
                <h3>Patient Details</h3>
                <button className="patient-modal-close" onClick={() => setSelectedPatient(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="patient-modal-body">
                <div className="patient-detail-section">
                  <h4>Personal Information</h4>
                  <div className="patient-detail-grid">
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Full Name</span>
                      <span className="patient-detail-value">{selectedPatient.name}</span>
                    </div>
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Age</span>
                      <span className="patient-detail-value">
                        {selectedPatient.age || 'Not provided'}
                      </span>
                    </div>
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Blood Group</span>
                      <span className="patient-detail-value">{selectedPatient.blood_group || 'Not provided'}</span>
                    </div>
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Status</span>
                      <span className={`patient-status ${selectedPatient.is_active ? 'active' : 'inactive'}`}>
                        <span className="patient-status-dot" />
                        {selectedPatient.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="patient-detail-section">
                  <h4>Contact Information</h4>
                  <div className="patient-detail-grid">
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Email</span>
                      <span className="patient-detail-value">{selectedPatient.email}</span>
                    </div>
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Phone</span>
                      <span className="patient-detail-value">{selectedPatient.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="patient-detail-section">
                  <h4>Health Information</h4>
                  <div className="patient-detail-grid">
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Height</span>
                      <span className="patient-detail-value">
                        {selectedPatient.height ? `${selectedPatient.height} cm` : 'Not provided'}
                      </span>
                    </div>
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Weight</span>
                      <span className="patient-detail-value">
                        {selectedPatient.weight ? `${selectedPatient.weight} kg` : 'Not provided'}
                      </span>
                    </div>
                    <div className="patient-detail-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="patient-detail-label">Medical Conditions</span>
                      <span className="patient-detail-value">
                        {selectedPatient.medical_conditions || 'None reported'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="patient-detail-section">
                  <h4>Account Information</h4>
                  <div className="patient-detail-grid">
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Join Date</span>
                      <span className="patient-detail-value">
                        {new Date(selectedPatient.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Last Login</span>
                      <span className="patient-detail-value">
                        {selectedPatient.last_login 
                          ? new Date(selectedPatient.last_login).toLocaleDateString() 
                          : 'Never'}
                      </span>
                    </div>
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Profile Complete</span>
                      <span className="patient-detail-value">
                        {selectedPatient.is_profile_complete ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="patient-detail-item">
                      <span className="patient-detail-label">Verified</span>
                      <span className="patient-detail-value">
                        {selectedPatient.is_verified ? 'Yes' : 'No'}
                      </span>
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

export default PatientManagement;

