import { useEffect, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Stethoscope,
  Cpu,
  LogOut,
  TrendingUp,
  X,
  Pill,
  Building2,
  Microscope,
  FileText,
  User,
  Heart,
  Video,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import apiService from '../../services/api';
import PatientManagement from './PatientManagement';
import DoctorManagement from './DoctorManagement';
import SpecializationManagement from './SpecializationManagement';
import SymptomManagement from './SymptomManagement';
import PharmacyManagement from './PharmacyManagement';
import ClinicManagement from './ClinicManagement';
import './AdminDashboard.css';

const AdminOverview = lazy(() => import('./AdminOverview'));

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState(0);
  const [pendingPharmacies, setPendingPharmacies] = useState(0);
  const [pendingClinics, setPendingClinics] = useState(0);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);

  // Load initial pending doctor count for sidebar badge
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await apiService.getAdminStats();
        if (typeof stats.pending_doctors === 'number') {
          setPendingDoctors(stats.pending_doctors);
        }
        if (typeof stats.pending_pharmacies === 'number') {
          setPendingPharmacies(stats.pending_pharmacies);
        }
        if (typeof stats.pending_clinics === 'number') {
          setPendingClinics(stats.pending_clinics);
        }
      } catch (e) {
        console.error('Failed to load admin stats', e);
      }
    };

    loadStats();
  }, []);

  const handleRoomCleanup = async () => {
    if (!window.confirm('This will delete all LiveKit rooms for completed appointments. Continue?')) {
      return;
    }

    try {
      setCleanupLoading(true);
      setCleanupResult(null);
      const result = await apiService.cleanupAllRooms();
      setCleanupResult(result);
    } catch (error) {
      setCleanupResult({
        success: false,
        message: error.message || 'Failed to cleanup rooms',
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, badge: pendingDoctors || null },
    { id: 'pharmacies', label: 'Pharmacies', icon: Pill, badge: pendingPharmacies || null },
    { id: 'clinics', label: 'Clinics', icon: Building2, badge: pendingClinics || null },
    { id: 'specializations', label: 'Specializations', icon: Microscope },
    { id: 'symptoms', label: 'Symptoms', icon: FileText },
    { id: 'system', label: 'System', icon: Cpu },
  ];

  return (
    <div className="admin-dashboard">
      {/* Overlay */}
      <div
        className={`admin-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'mobile-visible' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div className="admin-sidebar-logo">
              <Heart size={24} />
            </div>
            <div className="admin-sidebar-title">
              <h1>MedNexus</h1>
              <p>Admin Panel</p>
            </div>
          </div>
          <button className="admin-sidebar-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
                {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              <User size={20} />
            </div>
            <div className="admin-sidebar-user-info">
              <p>System Administrator</p>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Content */}
        <main className="admin-content">
          {/* Conditionally render based on active nav */}
          {activeNav === 'patients' ? (
            <PatientManagement />
          ) : activeNav === 'doctors' ? (
            <DoctorManagement onPendingChange={setPendingDoctors} />
          ) : activeNav === 'specializations' ? (
            <SpecializationManagement />
          ) : activeNav === 'symptoms' ? (
            <SymptomManagement />
          ) : activeNav === 'pharmacies' ? (
            <PharmacyManagement onPendingChange={setPendingPharmacies} />
          ) : activeNav === 'clinics' ? (
            <ClinicManagement onPendingChange={setPendingClinics} />
          ) : activeNav === 'system' ? (
            <div className="admin-system-management">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="admin-chart-card"
              >
                <div className="admin-chart-header">
                  <div className="admin-chart-title">
                    <h3>LiveKit Room Cleanup</h3>
                    <p>Delete all video call rooms for completed appointments</p>
                  </div>
                </div>
                
                <div style={{ padding: '20px' }}>
                  <button
                    onClick={handleRoomCleanup}
                    disabled={cleanupLoading}
                    className="admin-cleanup-btn"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: cleanupLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: cleanupLoading ? 0.6 : 1,
                    }}
                  >
                    <Video size={18} />
                    {cleanupLoading ? 'Cleaning up...' : 'Cleanup All Rooms'}
                  </button>

                  {cleanupResult && (
                    <div
                      style={{
                        marginTop: '20px',
                        padding: '16px',
                        borderRadius: '8px',
                        background: cleanupResult.success ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${cleanupResult.success ? '#86efac' : '#fca5a5'}`,
                      }}
                    >
                      <h4
                        style={{
                          margin: '0 0 12px 0',
                          color: cleanupResult.success ? '#16a34a' : '#dc2626',
                          fontSize: '16px',
                          fontWeight: '600',
                        }}
                      >
                        {cleanupResult.message}
                      </h4>
                      {cleanupResult.success && (
                        <div>
                          <p style={{ margin: '8px 0', fontSize: '14px', color: '#6b7280' }}>
                            Total processed: {cleanupResult.total_processed} appointments
                          </p>
                          {cleanupResult.deleted_rooms && cleanupResult.deleted_rooms.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
                                Deleted Rooms ({cleanupResult.deleted_rooms.length}):
                              </p>
                              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280' }}>
                                {cleanupResult.deleted_rooms.slice(0, 10).map((room, idx) => (
                                  <li key={idx}>{room}</li>
                                ))}
                                {cleanupResult.deleted_rooms.length > 10 && (
                                  <li>... and {cleanupResult.deleted_rooms.length - 10} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                          {cleanupResult.failed_rooms && cleanupResult.failed_rooms.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px', color: '#dc2626' }}>
                                Failed Rooms ({cleanupResult.failed_rooms.length}):
                              </p>
                              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#dc2626' }}>
                                {cleanupResult.failed_rooms.map((item, idx) => (
                                  <li key={idx}>
                                    {item.room}: {item.error}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', animation: 'ov-spin 0.7s linear infinite' }} />
              </div>
            }>
              <AdminOverview />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
