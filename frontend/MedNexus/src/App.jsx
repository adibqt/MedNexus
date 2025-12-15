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

import { Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn.jsx';

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sign-in" element={<SignIn />} />
    </Routes>
  );
}

export default App;
