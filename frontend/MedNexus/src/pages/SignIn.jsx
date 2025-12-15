import { useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User, Stethoscope, Pill, Building2, Heart, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    // Auto-navigate after selection
    setTimeout(() => navigate(`/sign-in/${roleKey}`), 300);
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.3)' }} />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">
              Med<span style={{ color: '#10b981' }}>Nexus</span>
            </span>
          </Link>

          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
            >
              Healthcare at your fingertips
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-400 leading-relaxed"
            >
              Connect with doctors, manage prescriptions, and take control of your health journey—all in one place.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-3 gap-8"
            >
              {[
                { value: '50K+', label: 'Patients' },
                { value: '200+', label: 'Doctors' },
                { value: '99%', label: 'Satisfaction' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold" style={{ color: '#10b981' }}>{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-sm">
            © 2025 MedNexus. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex items-center justify-between border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Med<span style={{ color: '#10b981' }}>Nexus</span>
            </span>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            Back
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Welcome back
              </h1>
              <p className="text-gray-500 text-lg">
                Choose your account type to continue
              </p>
            </motion.div>

            {/* Role Options */}
            <div className="space-y-4">
              {roles.map((role, index) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.key;

                return (
                  <motion.button
                    key={role.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleClick(role.key)}
                    className="w-full group"
                  >
                    <div
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${role.color}15` }}
                      >
                        <Icon className="w-7 h-7" style={{ color: role.color }} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 text-lg">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors ${
                          isSelected ? 'text-emerald-500' : ''
                        }`}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="text-gray-500">
                New to MedNexus?{' '}
                <Link
                  to="/sign-up"
                  className="font-semibold hover:underline"
                  style={{ color: '#10b981' }}
                >
                  Create an account
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
