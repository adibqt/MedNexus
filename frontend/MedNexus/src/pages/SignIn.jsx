import { useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User, Stethoscope, Pill, Building2, Heart, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './SignIn.css';

const SignIn = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedRole = searchParams.get('role') || '';

  const roles = useMemo(
    () => [
      {
        key: 'patient',
        label: 'Patient',
        icon: User,
        description: 'Access consultations & health records',
        color: '#3b82f6',
      },
      {
        key: 'doctor',
        label: 'Doctor',
        icon: Stethoscope,
        description: 'Manage appointments & patients',
        color: '#10b981',
      },
      {
        key: 'pharmacy',
        label: 'Pharmacy',
        icon: Pill,
        description: 'Handle prescriptions & inventory',
        color: '#8b5cf6',
      },
      {
        key: 'clinic',
        label: 'Clinic',
        icon: Building2,
        description: 'Oversee operations & staff',
        color: '#f59e0b',
      },
    ],
    [],
  );

  const handleRoleClick = (roleKey) => {
    setSearchParams({ role: roleKey });
    setTimeout(() => navigate(`/sign-in/${roleKey}`), 300);
  };

  return (
    <div className="signin-page">
      {/* Background */}
      <div className="signin-bg">
        <motion.div
          className="signin-orb signin-orb--emerald"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="signin-orb signin-orb--cyan"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="signin-orb signin-orb--indigo"
          animate={{ scale: [1, 1.25, 1], x: [0, 24, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="signin-grid" />
      </div>

      {/* Left brand/story panel */}
      <div className="signin-left">
        <div className="signin-left-inner">
          <Link to="/" className="signin-logo-link">
            <div className="signin-logo-icon">
              <Heart />
            </div>
            <div className="signin-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>

          <div className="signin-hero">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="signin-heading"
            >
              Healthcare at your
              <span>fingertips.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="signin-description"
            >
              Connect with doctors, manage prescriptions, and take control of your health
              journey — all from one intelligent, secure platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="signin-stats"
            >
              {[
                { value: '50K+', label: 'Patients cared for' },
                { value: '200+', label: 'Verified doctors' },
                { value: '99%', label: 'Satisfaction rate' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="signin-stat-value">{stat.value}</div>
                  <div className="signin-stat-label">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="signin-left-footer">© 2025 MedNexus. All rights reserved.</div>
        </div>
      </div>

      {/* Right panel - role selection */}
      <div className="signin-right">
        {/* Mobile header */}
        <div className="signin-mobile-header">
          <Link to="/" className="signin-mobile-logo">
            <div className="signin-mobile-logo-icon">
              <Heart />
            </div>
            <div className="signin-mobile-logo-text">
              Med<span>Nexus</span>
            </div>
          </Link>
          <Link to="/" className="signin-mobile-back">
            Back
          </Link>
        </div>

        {/* Main content */}
        <div className="signin-main">
          <div className="signin-card">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="signin-header-title">Welcome back</div>
              <p className="signin-header-subtitle">
                Choose your account type to continue.
              </p>

              {/* Role options */}
              <div className="signin-roles">
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.key;

                  return (
                    <motion.button
                      key={role.key}
                      type="button"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.08 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleClick(role.key)}
                      className="signin-role-button"
                    >
                      <div
                        className={`signin-role-card ${
                          isSelected ? 'signin-role-card--selected' : ''
                        }`}
                      >
                        <div
                          className="signin-role-icon"
                          style={{ backgroundColor: `${role.color}1A` }}
                        >
                          <Icon style={{ color: role.color }} />
                        </div>
                        <div className="signin-role-content">
                          <div className="signin-role-label">{role.label}</div>
                          <div className="signin-role-description">{role.description}</div>
                        </div>
                        <ChevronRight className="signin-role-arrow" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="signin-divider">
                <div className="signin-divider-line" />
                <span className="signin-divider-text">or</span>
                <div className="signin-divider-line" />
              </div>

              {/* Sign up link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="signin-footer"
              >
                <p>
                  New to MedNexus?{' '}
                  <Link to="/sign-up">
                    Create an account
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
