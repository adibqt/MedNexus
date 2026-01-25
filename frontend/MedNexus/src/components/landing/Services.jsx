const Services = () => {
  const services = [
    {
      icon: '🎥',
      title: 'Video Consultation',
      description: 'See a doctor securely from home with HD video and instant notes.',
    },
    {
      icon: '💬',
      title: 'Chat with Doctor',
      description: 'Ask questions, share reports, and get follow-up advice in chat.',
    },
    {
      icon: '🤖',
      title: 'AI Symptom Checker',
      description: 'Get quick guidance on next steps before booking a visit.',
    },
    {
      icon: '🚚',
      title: 'Medicine Delivery',
      description: 'Order prescriptions and have them delivered to your door.',
    },
    {
      icon: '📂',
      title: 'Health Records',
      description: 'Store labs, prescriptions, and visit summaries in one secure place.',
    },
    {
      icon: '🧪',
      title: 'Lab Tests',
      description: 'Book home sample collection or in-clinic tests with trusted labs.',
    },
  ];

  return (
    <section id="services" style={{ backgroundColor: '#f9f9f9', paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#222', marginBottom: '20px' }}>
            Award winning patient care
          </h2>
          <div style={{ width: '80px', height: '3px', backgroundColor: '#10b981', margin: '20px auto' }}></div>
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
            We provide comprehensive healthcare services with experienced doctors and modern medical facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '8px',
                border: '2px solid #10b981',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.15)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(16, 185, 129, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>{service.icon}</div>
              <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#222', marginBottom: '15px' }}>
                {service.title}
              </h4>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
