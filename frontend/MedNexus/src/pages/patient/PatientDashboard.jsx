import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Calendar,
  Clock,
  User,
  FileText,
  Pill,
  Activity,
  Scale,
  Ruler,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Video,
  MessageSquare,
  Plus,
  TrendingUp,
  Stethoscope,
  MapPin,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await ApiService.getPatientDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (user?.weight && user?.height) {
      const heightInMeters = user.height / 100;
      const bmi = user.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '--';
  };

  const getBMIStatus = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return { text: 'Unknown', color: 'gray' };
    if (bmi < 18.5) return { text: 'Underweight', color: 'yellow' };
    if (bmi < 25) return { text: 'Normal', color: 'green' };
    if (bmi < 30) return { text: 'Overweight', color: 'orange' };
    return { text: 'Obese', color: 'red' };
  };

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: 'Today',
      time: '10:30 AM',
      type: 'Video Call',
      avatar: 'SJ',
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'General Physician',
      date: 'Tomorrow',
      time: '2:00 PM',
      type: 'In-Person',
      avatar: 'MC',
    },
  ];

  const recentPrescriptions = [
    {
      id: 1,
      name: 'Amoxicillin 500mg',
      dosage: '1 tablet 3x daily',
      duration: '7 days',
      doctor: 'Dr. Sarah Johnson',
      date: '2 days ago',
    },
    {
      id: 2,
      name: 'Vitamin D3 1000IU',
      dosage: '1 tablet daily',
      duration: '30 days',
      doctor: 'Dr. Michael Chen',
      date: '1 week ago',
    },
  ];

  const quickActions = [
    { icon: Video, label: 'Video Consult', color: '#10b981' },
    { icon: Calendar, label: 'Book Appointment', color: '#3b82f6' },
    { icon: MessageSquare, label: 'Chat with Doctor', color: '#8b5cf6' },
    { icon: FileText, label: 'Medical Records', color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col z-20">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Med<span style={{ color: '#10b981' }}>Nexus</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {[
              { icon: Activity, label: 'Overview', id: 'overview' },
              { icon: Calendar, label: 'Appointments', id: 'appointments' },
              { icon: Pill, label: 'Prescriptions', id: 'prescriptions' },
              { icon: FileText, label: 'Medical Records', id: 'records' },
              { icon: MessageSquare, label: 'Messages', id: 'messages' },
              { icon: Stethoscope, label: 'Find Doctors', id: 'doctors' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setActiveTab('settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Logo */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Med<span style={{ color: '#10b981' }}>Nexus</span>
              </span>
            </div>

            {/* Greeting */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0] || 'Patient'}! 👋
              </h1>
              <p className="text-sm text-gray-500">Here's your health summary</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#10b981' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Patient'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}15`, color: action.color }}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* BMI Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  getBMIStatus().color === 'green' ? 'bg-green-100 text-green-600' :
                  getBMIStatus().color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  getBMIStatus().color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  getBMIStatus().color === 'red' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getBMIStatus().text}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">BMI</p>
              <p className="text-2xl font-bold text-gray-900">{calculateBMI()}</p>
            </motion.div>

            {/* Weight Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <Scale className="w-5 h-5" style={{ color: '#3b82f6' }} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Weight</p>
              <p className="text-2xl font-bold text-gray-900">{user?.weight || '--'} <span className="text-sm font-normal text-gray-400">kg</span></p>
            </motion.div>

            {/* Height Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                  <Ruler className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Height</p>
              <p className="text-2xl font-bold text-gray-900">{user?.height || '--'} <span className="text-sm font-normal text-gray-400">cm</span></p>
            </motion.div>

            {/* Age Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <User className="w-5 h-5" style={{ color: '#f59e0b' }} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Age</p>
              <p className="text-2xl font-bold text-gray-900">{user?.age || '--'} <span className="text-sm font-normal text-gray-400">years</span></p>
            </motion.div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <button className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#10b981' }}>
                  <Plus className="w-4 h-4" />
                  Book New
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#10b981' }}>
                      {apt.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{apt.doctor}</h3>
                      <p className="text-sm text-gray-500">{apt.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{apt.date}</p>
                      <p className="text-sm text-gray-500">{apt.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.type === 'Video Call'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {apt.type}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming appointments</p>
                    <button
                      className="mt-4 px-6 py-2 rounded-xl text-white font-medium"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      Book an Appointment
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Medical Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Medical Conditions</h2>
              </div>
              <div className="p-6">
                {user?.medical_conditions ? (
                  <div className="flex flex-wrap gap-2">
                    {user.medical_conditions.split(',').map((condition, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
                      >
                        {condition.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No conditions recorded</p>
                    <button
                      className="text-sm font-medium"
                      style={{ color: '#10b981' }}
                    >
                      + Add Condition
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Prescriptions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h2>
                <button className="text-sm font-medium" style={{ color: '#10b981' }}>
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {recentPrescriptions.map((rx) => (
                  <div key={rx.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                      <Pill className="w-5 h-5" style={{ color: '#10b981' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{rx.name}</h3>
                      <p className="text-sm text-gray-500">{rx.dosage} • {rx.duration}</p>
                      <p className="text-xs text-gray-400 mt-1">Prescribed by {rx.doctor}</p>
                    </div>
                    <span className="text-xs text-gray-400">{rx.date}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Find a Doctor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"
            >
              <Stethoscope className="w-10 h-10 mb-4 opacity-90" />
              <h3 className="text-lg font-semibold mb-2">Find a Doctor</h3>
              <p className="text-emerald-100 text-sm mb-6">
                Search from 1000+ verified doctors and book an appointment instantly.
              </p>
              <button className="w-full py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors">
                Search Doctors
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Activity, label: 'Home', id: 'overview' },
            { icon: Calendar, label: 'Appointments', id: 'appointments' },
            { icon: Pill, label: 'Meds', id: 'prescriptions' },
            { icon: User, label: 'Profile', id: 'settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 ${
                activeTab === item.id ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default PatientDashboard;
