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

function App() {
  return (
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
}

export default App;
