import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  Shield,
  Users,
  Activity,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const { login, loading } = useAdminAuth();
  const [email, setEmail] = useState('admin@mednexus.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);

    const result = await login({ email, password });
    if (!result.success) {
      setError(result.message || 'Invalid credentials. Please try again.');
      setSubmitting(false);
    }
  };

  const features = [
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage patients, doctors, and staff accounts',
    },
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Track platform activity and system health',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive reports and insights',
    },
  ];

  return (
    <div className="admin-login">
      {/* Animated Background */}
      <div className="admin-login-bg">
        <div className="admin-login-bg-circle" />
        <div className="admin-login-bg-circle" />
        <div className="admin-login-bg-circle" />
      </div>

      {/* Left Panel - Branding */}
      <div className="admin-login-left">
        <div className="admin-login-brand">
          <div className="admin-login-logo">
            <Heart />
          </div>
          <div className="admin-login-brand-text">
            <h1>Med<span className="text-emerald">Nexus</span></h1>
            <p>Healthcare Management System</p>
          </div>
        </div>

        <div className="admin-login-hero">
          <h2>
            Welcome to the <span>Admin Portal</span>
          </h2>
          <p>
            Access the administrative dashboard to manage your healthcare platform. 
            Monitor patients, doctors, appointments, and system performance all in one place.
          </p>
        </div>

        <div className="admin-login-features">
          {features.map((feature, index) => (
            <div key={index} className="admin-login-feature">
              <div className="admin-login-feature-icon">
                <feature.icon />
              </div>
              <div className="admin-login-feature-text">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="admin-login-right">
        <div className="admin-login-card">
          <div className="admin-login-card-header">
            <div className="admin-login-card-logo">
              <Shield />
            </div>
            <h2>Admin Sign In</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>

          <div className="admin-login-card-body">
            <form className="admin-login-form" onSubmit={handleSubmit}>
              <div className="admin-login-field">
                <label htmlFor="email">Email Address</label>
                <div className="admin-login-input-wrapper">
                  <Mail className="admin-login-input-icon" />
                  <input
                    id="email"
                    type="email"
                    className="admin-login-input"
                    placeholder="admin@mednexus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="admin-login-field">
                <label htmlFor="password">Password</label>
                <div className="admin-login-input-wrapper">
                  <Lock className="admin-login-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="admin-login-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="admin-login-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="admin-login-error">
                  <AlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="admin-login-submit"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <span className="admin-login-spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="admin-login-divider">
              <div className="admin-login-divider-line" />
              <span className="admin-login-divider-text">or</span>
              <div className="admin-login-divider-line" />
            </div>

            <div className="admin-login-footer">
              <Link to="/" className="admin-login-home-link">
                <Home />
                <span>Back to Website</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
