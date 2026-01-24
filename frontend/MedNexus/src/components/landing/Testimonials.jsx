import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'John Partho',
      role: 'Patient',
      image: '/novena/images/team/1.jpg',
      text: 'They provide great service facility consectetur adipisicing elit. Itaque rem, praesentium, iure, ipsum magnam deleniti a vel eos adipisci suscipit fugit placeat.'
    },
    {
      name: 'Mullar Sarth',
      role: 'Patient',
      image: '/novena/images/team/2.jpg',
      text: 'They provide great service facility consectetur adipisicing elit. Itaque rem, praesentium, iure, ipsum magnam deleniti a vel eos adipisci suscipit fugit placeat.'
    },
    {
      name: 'Dr. Sarah Wilson',
      role: 'Patient',
      image: '/novena/images/team/3.jpg',
      text: 'Excellent care and professionalism. The doctors and staff are very attentive and compassionate. Highly recommended for anyone seeking quality healthcare.'
    },
    {
      name: 'Ahmed Hassan',
      role: 'Patient',
      image: '/novena/images/team/4.jpg',
      text: 'Outstanding service and treatment. The facilities are state-of-the-art and the team is very professional. I felt well cared for throughout my visit.'
    },
    {
      name: 'Maria Lopez',
      role: 'Patient',
      image: '/novena/images/team/test-thumb1.jpg',
      text: 'Best healthcare experience I have had. Very clean, organized, and the staff is incredibly helpful and knowledgeable. Definitely coming back.'
    },
    {
      name: 'James Thompson',
      role: 'Patient',
      image: '/novena/images/team/test-thumb2.jpg',
      text: 'Highly professional team with excellent bedside manner. They took time to explain everything and made me feel comfortable. Great experience overall.'
    }
  ];

  const itemsPerPage = 2;
  const maxIndex = Math.ceil(testimonials.length / itemsPerPage) - 1;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section id="testimonials" style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#f9f9f9' }}>
      <div className="container mx-auto px-4">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#003d82', marginBottom: '20px' }}>
            We served over 5000+<br />Patients
          </h2>
          <div style={{ width: '60px', height: '3px', backgroundColor: '#10b981', margin: '20px auto' }}></div>
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', maxWidth: '600px', margin: '20px auto' }}>
            Lets know moreel necessitatibus dolor asperiores illum possimus sint voluptates incidunt molestias nostrum laudantium. Maiores porro cumque quaerat.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {visibleTestimonials.map((testimonial, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: '#fff',
                  padding: '40px',
                  borderRadius: '8px',
                  border: '2px solid #10b981',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <img 
                    src={testimonial.image || 'https://via.placeholder.com/60'} 
                    alt={testimonial.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '20px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#222', margin: '0 0 5px 0' }}>
                      {testimonial.name}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' }}>
                  {testimonial.text}
                </p>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '40px', color: '#10b981' }}>❝</span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
            <button
              onClick={handlePrev}
              style={{
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0d9488'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: currentIndex === idx ? '#10b981' : '#ddd',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              style={{
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0d9488'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
