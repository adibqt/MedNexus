import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import './Services.css';

const serviceCards = [
  {
    title: 'Child care',
    description: 'Saepe nulla praesentium eaque omnis perferendis a doloremque.',
    image: '/novena/images/service/service-1.jpg',
  },
  {
    title: 'Personal Care',
    description: 'Saepe nulla praesentium eaque omnis perferendis a doloremque.',
    image: '/novena/images/service/service-2.jpg',
  },
  {
    title: 'CT scan',
    description: 'Saepe nulla praesentium eaque omnis perferendis a doloremque.',
    image: '/novena/images/service/service-3.jpg',
  },
  {
    title: 'Joint replacement',
    description: 'Saepe nulla praesentium eaque omnis perferendis a doloremque.',
    image: '/novena/images/service/service-4.jpg',
  },
  {
    title: 'Examination & Diagnosis',
    description: 'Saepe nulla praesentium eaque omnis perferendis a doloremque.',
    image: '/novena/images/service/service-6.jpg',
  },
  {
    title: "Alzheimer's disease",
    description: 'Saepe nulla praesentium eaque omnis perferendis a doloremque.',
    image: '/novena/images/service/service-8.jpg',
  },
];

const Services = () => {
  return (
    <div className="services-page">
      <Navbar />
      <main>
        <section className="services-hero">
          <div className="services-hero__overlay" />
          <div className="services-container services-hero__content">
            <div className="services-hero__text">
              <span className="services-hero__eyebrow">Our services</span>
              <h1>What We Do</h1>
            </div>
          </div>
        </section>

        <section className="services-section services-grid-section">
          <div className="services-container">
            <div className="services-grid">
              {serviceCards.map((service) => (
                <div className="service-card" key={service.title}>
                  <div className="service-card__image-wrap">
                    <img src={service.image} alt={service.title} className="service-card__image" />
                  </div>
                  <div className="service-card__content">
                    <h4>{service.title}</h4>
                    <p>{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="services-cta">
          <div className="services-container">
            <div className="services-cta__content">
              <div className="services-cta__divider" />
              <h2>
                We are pleased to offer you the{' '}
                <span className="services-cta__highlight">chance to have the healthy</span>
              </h2>
              <a href="/sign-in" className="services-cta__btn">
                Get appointment →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
