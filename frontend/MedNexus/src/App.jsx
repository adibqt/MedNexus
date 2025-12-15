import {
  Navbar,
  Hero,
  Services,
  HowItWorks,
  Doctors,
  Testimonials,
  CTA,
  Footer,
} from './components/landing';

import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn.jsx';
import PatientSignUp from './pages/patient/PatientSignUp.jsx';
import PatientSignIn from './pages/patient/PatientSignIn.jsx';
import ProfileCompletion from './pages/patient/ProfileCompletion.jsx';
import PatientDashboard from './pages/patient/PatientDashboard.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';

const Landing = () => (
  <div className="min-h-screen bg-white w-full overflow-x-hidden">
    <Navbar />
    <main className="w-full pt-0">
      <Hero />
      <Services />
      <HowItWorks />
      <Doctors />
      <Testimonials />
      <CTA />
    </main>
    <Footer />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requireProfileComplete = false }) => {
  const { user, loading, isAuthenticated, isProfileComplete } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in/patient" replace />;
  }

  if (requireProfileComplete && !isProfileComplete) {
    return <Navigate to="/patient/complete-profile" replace />;
  }

  return children;
};

// Profile Completion Route (accessible only if profile is incomplete)
const ProfileRoute = ({ children }) => {
  const { loading, isAuthenticated, isProfileComplete } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in/patient" replace />;
  }

  if (isProfileComplete) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sign-in" element={<SignIn />} />
      
      {/* Patient Auth Routes */}
      <Route path="/sign-up/patient" element={<PatientSignUp />} />
      <Route path="/sign-in/patient" element={<PatientSignIn />} />
      
      {/* Protected Patient Routes */}
      <Route
        path="/patient/complete-profile"
        element={
          <ProfileRoute>
            <ProfileCompletion />
          </ProfileRoute>
        }
      />
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute requireProfileComplete>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
