import {
  Navbar,
  Hero,
  Services,
  AppointmentForm,
  HowItWorks,
  Testimonials,
  Partners,
  CTA,
  Footer,
} from "./components/landing";

import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import Auth from "./pages/Auth.jsx";
import PatientSignUp from "./pages/patient/PatientSignUp.jsx";
import PatientSignIn from "./pages/patient/PatientSignIn.jsx";
import ProfileCompletion from "./pages/patient/ProfileCompletion.jsx";
import PatientDashboard from "./pages/patient/PatientDashboard.jsx";
import EditProfile from "./pages/patient/EditProfile.jsx";
import BookAppointment from "./pages/patient/BookAppointment.jsx";
import AIConsultationPage from "./pages/patient/AIConsultationPage.jsx";
import DoctorSignUp from "./pages/doctor/DoctorSignUp.jsx";
import DoctorSignIn from "./pages/doctor/DoctorSignIn.jsx";
import DoctorSchedule from "./pages/doctor/DoctorSchedule.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import DoctorEditProfile from "./pages/doctor/DoctorEditProfile.jsx";
import DoctorAppointments from "./pages/doctor/DoctorAppointments.jsx";
import About from "./pages/About.jsx";
import ServicesPage from "./pages/Services.jsx";
import Departments from "./pages/Departments.jsx";
import DepartmentSingle from "./pages/DepartmentSingle.jsx";
import Doctors from "./pages/Doctors.jsx";
import DoctorSingle from "./pages/DoctorSingle.jsx";
import Appointments from "./pages/Appointments.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "./context/AdminAuthContext.jsx";
import { VideoCallProvider } from "./context/VideoCallContext";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

import "./pages/Landing.css";

const Landing = () => (
  <div className="landing-page">
    <Navbar />
    <main className="landing-main">
      <Hero />
      <Services />
      <AppointmentForm />
      <div className="landing-section-spacer" />
      <HowItWorks />
      <div className="landing-section-spacer" />
      {/* Doctors component removed - will be created as separate page later */}
      <Testimonials />
      <Partners />
      <div className="landing-section-spacer" />
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

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-emerald-900 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/departments/:id" element={<DepartmentSingle />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctors/:id" element={<DoctorSingle />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up/doctor" element={<DoctorSignUp />} />
      <Route path="/sign-in/doctor" element={<DoctorSignIn />} />
      <Route path="/doctor/schedule" element={<DoctorSchedule />} />
      <Route
        path="/doctor/dashboard"
        element={
          <DoctorVideoCallWrapper>
            <DoctorDashboard />
          </DoctorVideoCallWrapper>
        }
      />
      <Route path="/doctor/profile" element={<DoctorEditProfile />} />
      <Route path="/doctor/appointments" element={<DoctorAppointments />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

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
            <PatientVideoCallWrapper>
              <PatientDashboard />
            </PatientVideoCallWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute requireProfileComplete>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book-appointment/:doctorId"
        element={
          <ProtectedRoute requireProfileComplete>
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/ai-consultation"
        element={
          <ProtectedRoute requireProfileComplete>
            <PatientVideoCallWrapper>
              <AIConsultationPage />
            </PatientVideoCallWrapper>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// VideoCall wrapper for patient routes
const PatientVideoCallWrapper = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;

  return (
    <VideoCallProvider userId={user.id} userType="patient" userName={user.name}>
      {children}
    </VideoCallProvider>
  );
};

// VideoCall wrapper for doctor routes
const DoctorVideoCallWrapper = ({ children }) => {
  const doctorId = localStorage.getItem("doctor_id");
  const doctorName = localStorage.getItem("doctor_name");

  if (!doctorId) return children;

  return (
    <VideoCallProvider
      userId={parseInt(doctorId)}
      userType="doctor"
      userName={doctorName || `Doctor_${doctorId}`}
    >
      {children}
    </VideoCallProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
