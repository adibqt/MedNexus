const HowItWorks = () => {
  const steps = [
    { number: '01', title: 'Create Account', description: 'Sign up with your email or phone number' },
    { number: '02', title: 'Find Your Doctor', description: 'Browse verified doctors and specialists' },
    { number: '03', title: 'Book Appointment', description: 'Schedule consultation at your convenience' },
    { number: '04', title: 'Get Treatment', description: 'Receive expert medical care and treatment' },
  ];

  return (
    <section style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#fff' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#222', marginBottom: '20px' }}>
            How It Works
          </h2>
          <div style={{ width: '80px', height: '3px', backgroundColor: '#10b981', margin: '20px auto' }}></div>
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
            Get started with MedNexus in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: '0 auto 20px',
                }}
              >
                {step.number}
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#222', marginBottom: '10px' }}>
                {step.title}
              </h4>
              <p style={{ color: '#666', fontSize: '14px' }}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
