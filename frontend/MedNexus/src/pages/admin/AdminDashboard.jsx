import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  Stethoscope,
  CalendarClock,
  Cpu,
  Shield,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  AlertTriangle,
  X,
  Pill,
  Building2,
  Microscope,
  FileText,
  User,
  Menu,
  Heart,
  Trash2,
  Video,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import apiService from '../../services/api';
import PatientManagement from './PatientManagement';
import DoctorManagement from './DoctorManagement';
import SpecializationManagement from './SpecializationManagement';
import SymptomManagement from './SymptomManagement';
import './AdminDashboard.css';

const statCards = [
  {
    label: 'Total Patients',
    value: '18,245',
    change: '+12.4%',
    trend: 'up',
    icon: Users,
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
  {
    label: 'Active Doctors',
    value: '248',
    change: '+6.8%',
    trend: 'up',
    icon: Stethoscope,
    gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  },
  {
    label: "Today's Appointments",
    value: '732',
    change: '+3.1%',
    trend: 'up',
    icon: CalendarClock,
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
  {
    label: 'System Alerts',
    value: '3',
    change: '2 critical',
    trend: 'down',
    icon: AlertTriangle,
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
  },
];

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState(0);
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
    { id: 'pharmacies', label: 'Pharmacies', icon: Pill },
    { id: 'clinics', label: 'Clinics', icon: Building2 },
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
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="admin-header-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Heart size={20} />
            </button>
            <div className="admin-header-title">
              <h2>Dashboard</h2>
              <p>Admin Control Center</p>
            </div>
          </div>

          <div className="admin-header-right">
            <div className="admin-search-box">
              <Search />
              <input type="text" placeholder="Search patients, doctors, alerts..." />
            </div>
            <button className="admin-notification-btn">
              <Bell size={20} />
              <span className="admin-notification-badge" />
            </button>
          </div>
        </header>

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
            <div className="admin-dashboard-content">
              {/* Stats Grid */}
              <div className="admin-stats-grid">
            {statCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="admin-stat-card"
              >
                <div className="admin-stat-header">
                  <div className="admin-stat-info">
                    <h3>{card.label}</h3>
                    <p className="admin-stat-value">{card.value}</p>
                  </div>
                  <div className="admin-stat-icon" style={{ background: card.gradient }}>
                    <card.icon />
                  </div>
                </div>
                <div className="admin-stat-footer">
                  <div className={`admin-stat-change ${card.trend === 'down' ? 'negative' : ''}`}>
                    <TrendingUp size={14} />
                    <span>{card.change}</span>
                  </div>
                  <div className="admin-stat-sparkline">
                    {[4, 7, 5, 8, 6, 9, 11].map((h, i) => (
                      <div
                        key={i}
                        className="admin-stat-sparkline-bar"
                        style={{ height: `${h * 3}px` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="admin-charts-grid">
            {/* Appointments Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="admin-chart-card"
            >
              <div className="admin-chart-header">
                <div className="admin-chart-title">
                  <h3>Appointment Volume</h3>
                  <p>
                    Last 7 days · <span style={{ color: '#10b981', fontWeight: 600 }}>+8.9%</span>
                  </p>
                </div>
                <div className="admin-chart-legend">
                  <div className="admin-legend-item">
                    <span className="admin-legend-dot" style={{ background: '#10b981' }} />
                    Booked
                  </div>
                  <div className="admin-legend-item">
                    <span className="admin-legend-dot" style={{ background: '#d1d5db' }} />
                    Cancelled
                  </div>
                </div>
              </div>

              <div className="admin-bar-chart">
                {[60, 48, 72, 64, 80, 70, 92].map((val, idx) => (
                  <div key={idx} className="admin-bar">
                    <div className="admin-bar-column" style={{ height: `${val}%` }} />
                    <span className="admin-bar-label">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="admin-chart-card"
            >
              <div className="admin-chart-header">
                <div className="admin-chart-title">
                  <h3>System Health</h3>
                  <p>Realtime infrastructure status</p>
                </div>
              </div>

              <div>
                {[
                  { label: 'Core API', status: 'Operational · 32 ms', progress: 85, color: '#10b981', pulse: true },
                  { label: 'Video Services', status: 'Degraded · 120 ms', progress: 60, color: '#f59e0b', pulse: false },
                  { label: 'Notifications', status: 'Partial · 320 ms', progress: 40, color: '#ef4444', pulse: false },
                ].map((service, idx) => (
                  <div key={idx} className="admin-health-item">
                    <div className="admin-health-header">
                      <div className="admin-health-label">
                        <span
                          className={`admin-health-dot ${service.pulse ? 'pulse' : ''}`}
                          style={{ background: service.color }}
                        />
                        <span>{service.label}</span>
                      </div>
                      <span className="admin-health-status">{service.status}</span>
                    </div>
                    <div className="admin-health-bar">
                      <div
                        className="admin-health-progress"
                        style={{ width: `${service.progress}%`, background: service.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Activity Grid */}
          <div className="admin-activity-grid">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="admin-activity-card"
            >
              <div className="admin-activity-header">
                <h3>Recent Activity</h3>
                <span>Last 5 minutes</span>
              </div>
              <div className="admin-activity-list">
                {[
                  { text: 'New patient registered · Alex Johnson', time: 'Just now', color: '#10b981' },
                  { text: 'Appointment booked · Cardiology with Dr. Lee', time: '3 min ago', color: '#3b82f6' },
                  { text: 'Doctor account approved · Dr. Novak', time: '6 min ago', color: '#10b981' },
                  { text: 'Prescription updated · Metformin dosage', time: '9 min ago', color: '#f59e0b' },
                ].map((activity, idx) => (
                  <div key={idx} className="admin-activity-item">
                    <span className="admin-activity-dot" style={{ background: activity.color }} />
                    <div className="admin-activity-content">
                      <p className="admin-activity-text">{activity.text}</p>
                      <p className="admin-activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Security Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="admin-activity-card"
            >
              <div className="admin-activity-header">
                <h3>Security Events</h3>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>2 critical</span>
              </div>
              <div className="admin-activity-list">
                <div className="admin-activity-item critical">
                  <span className="admin-activity-dot" style={{ background: '#ef4444' }} />
                  <div className="admin-activity-content">
                    <p className="admin-activity-text">Multiple failed login attempts</p>
                    <p className="admin-activity-time">8 attempts · Blocked · IP: 185.23.91.10</p>
                  </div>
                </div>
                <div className="admin-activity-item warning">
                  <span className="admin-activity-dot" style={{ background: '#f59e0b' }} />
                  <div className="admin-activity-content">
                    <p className="admin-activity-text">Elevated access granted</p>
                    <p className="admin-activity-time">Dr. Williams · Cardiology records</p>
                  </div>
                </div>
                <div className="admin-activity-item success">
                  <span className="admin-activity-dot" style={{ background: '#10b981' }} />
                  <div className="admin-activity-content">
                    <p className="admin-activity-text">Audit log export completed</p>
                    <p className="admin-activity-time">Encrypted S3 · 14.2 MB</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
