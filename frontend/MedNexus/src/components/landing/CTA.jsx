import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section style={{ backgroundColor: '#10b981', paddingTop: '40px', paddingBottom: '40px', marginBottom: '40px', color: '#fff' }}>
      <div className="container mx-auto px-4 text-center">
        <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>
          Ready to Get Started?
        </h2>
        <p style={{ fontSize: '18px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
          Join thousands of patients who trust MedNexus for their healthcare needs.
        </p>
        <button
          onClick={() => navigate('/sign-in')}
          style={{ backgroundColor: '#fff', color: '#10b981', padding: '14px 40px', fontSize: '16px', fontWeight: '700', borderRadius: '50px', border: 'none', cursor: 'pointer' }}
          className="hover:opacity-90"
        >
          Get Started Today →
        </button>
      </div>
    </section>
  );
};

export default CTA;
