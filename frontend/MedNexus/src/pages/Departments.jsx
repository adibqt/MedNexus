import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import './Departments.css';

const departmentsData = [
  {
    id: 1,
    title: 'Ophthalmology',
    description: 'Comprehensive eye care services including vision correction, cataract surgery, and treatment of eye diseases.',
    image: '/novena/images/service/service-1.jpg',
  },
  {
    id: 2,
    title: 'Cardiology',
    description: 'Expert cardiac care for heart conditions, including diagnosis, treatment, and preventive care.',
    image: '/novena/images/service/service-2.jpg',
  },
  {
    id: 3,
    title: 'Dental Care',
    description: 'Complete dental services from routine check-ups to advanced dental procedures and cosmetic dentistry.',
    image: '/novena/images/service/service-3.jpg',
  },
  {
    id: 4,
    title: 'Child Care',
    description: 'Pediatric services focused on the health and wellbeing of infants, children, and adolescents.',
    image: '/novena/images/service/service-4.jpg',
  },
  {
    id: 5,
    title: 'Pulmonology',
    description: 'Specialized care for respiratory conditions including asthma, COPD, and lung diseases.',
    image: '/novena/images/service/service-6.jpg',
  },
  {
    id: 6,
    title: 'Gynecology',
    description: 'Women\'s health services including reproductive health, prenatal care, and gynecological procedures.',
    image: '/novena/images/service/service-8.jpg',
  },
];

const Departments = () => {
  const navigate = useNavigate();

  return (
    <div className="departments-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="departments-hero">
        <div className="departments-hero-overlay" />
        <div className="container mx-auto px-4">
          <div className="departments-hero-content">
            <span className="departments-hero-subtitle">All Departments</span>
            <h1 className="departments-hero-title">Care Departments</h1>
          </div>
        </div>
      </section>

      {/* Departments Grid Section */}
      <section className="departments-section">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="departments-header">
            <h2 className="departments-main-title">Award Winning Patient Care</h2>
            <div className="departments-divider" />
            <p className="departments-subtitle">
              Explore MedNexus specialties for fast bookings, video consults, and coordinated follow-ups across primary care, cardiology, pediatrics, mental health, and more.
            </p>
          </div>

          {/* Departments Grid */}
          <div className="departments-grid">
            {departmentsData.map((department) => (
              <div key={department.id} className="department-card">
                <div className="department-card-image">
                  <img src={department.image} alt={department.title} />
                </div>
                <div className="department-card-content">
                  <h4 className="department-card-title">{department.title}</h4>
                  <p className="department-card-description">{department.description}</p>
                  <button
                    onClick={() => navigate(`/departments/${department.id}`)}
                    className="department-card-link"
                  >
                    Learn More
                    <svg 
                      className="department-card-arrow" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Departments;
