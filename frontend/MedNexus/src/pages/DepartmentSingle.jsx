import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import './DepartmentSingle.css';

const departmentsData = {
  1: {
    title: 'Ophthalmology',
    description: 'Our ophthalmology department provides comprehensive eye care services with state-of-the-art technology and experienced specialists.',
    image: '/novena/images/service/service-1.jpg',
    services: [
      'Vision Testing and Eye Exams',
      'Cataract Surgery',
      'Glaucoma Treatment',
      'Diabetic Eye Care',
      'LASIK and Vision Correction',
      'Retinal Disorders Treatment',
      'Pediatric Eye Care',
      'Contact Lens Fitting',
    ],
  },
  2: {
    title: 'Cardiology',
    description: 'Our cardiology department offers expert care for all heart-related conditions with cutting-edge diagnostic and treatment facilities.',
    image: '/novena/images/service/service-2.jpg',
    services: [
      'Cardiac Risk Assessment',
      'Echocardiography',
      'Stress Testing',
      'Cardiac Catheterization',
      'Heart Failure Management',
      'Arrhythmia Treatment',
      'Preventive Cardiology',
      'Cardiac Rehabilitation',
    ],
  },
  3: {
    title: 'Dental Care',
    description: 'Our dental department provides complete oral health services from preventive care to advanced cosmetic and restorative procedures.',
    image: '/novena/images/service/service-3.jpg',
    services: [
      'Routine Dental Checkups',
      'Teeth Cleaning and Whitening',
      'Cavity Fillings',
      'Root Canal Treatment',
      'Dental Implants',
      'Orthodontics and Braces',
      'Cosmetic Dentistry',
      'Oral Surgery',
    ],
  },
  4: {
    title: 'Child Care',
    description: 'Our pediatric department specializes in providing compassionate healthcare for children from infancy through adolescence.',
    image: '/novena/images/service/service-4.jpg',
    services: [
      'Well-Child Checkups',
      'Immunizations',
      'Growth and Development Monitoring',
      'Acute Illness Treatment',
      'Chronic Condition Management',
      'Nutritional Counseling',
      'Behavioral Health Services',
      'Adolescent Medicine',
    ],
  },
  5: {
    title: 'Pulmonology',
    description: 'Our pulmonology department specializes in diagnosing and treating respiratory conditions with advanced technology.',
    image: '/novena/images/service/service-6.jpg',
    services: [
      'Asthma Management',
      'COPD Treatment',
      'Pulmonary Function Testing',
      'Sleep Apnea Diagnosis',
      'Lung Cancer Screening',
      'Bronchoscopy',
      'Pulmonary Rehabilitation',
      'Critical Care Services',
    ],
  },
  6: {
    title: 'Gynecology',
    description: 'Our gynecology department provides comprehensive women\'s health services with a focus on personalized care.',
    image: '/novena/images/service/service-8.jpg',
    services: [
      'Annual Gynecological Exams',
      'Prenatal Care',
      'Family Planning Services',
      'Menopause Management',
      'Fertility Services',
      'Gynecological Surgery',
      'High-Risk Pregnancy Care',
      'Women\'s Wellness Programs',
    ],
  },
};

const DepartmentSingle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const department = departmentsData[id];

  if (!department) {
    return (
      <div className="department-single-page">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Department Not Found</h2>
          <button
            onClick={() => navigate('/departments')}
            className="text-emerald-500 hover:text-emerald-600 font-semibold"
          >
            ← Back to All Departments
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleBookAppointment = () => {
    navigate('/');
    setTimeout(() => {
      const appointmentSection = document.getElementById('appointment');
      if (appointmentSection) {
        appointmentSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="department-single-page">
      <Navbar />

      {/* Hero Section */}
      <section className="department-single-hero">
        <div className="department-single-hero-overlay" />
        <div className="container mx-auto px-4">
          <div className="department-single-hero-content">
            <span className="department-single-hero-subtitle">Department Details</span>
            <h1 className="department-single-hero-title">{department.title}</h1>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="department-single-content">
        <div className="container mx-auto px-4">
          <div className="department-single-layout">
            {/* Main Content */}
            <div className="department-main-content">
              {/* Banner Image */}
              <div className="department-banner">
                <img src={department.image} alt={department.title} />
              </div>

              {/* Description */}
              <div className="department-description">
                <h2 className="department-description-title">About {department.title}</h2>
                <p className="department-description-text">{department.description}</p>
              </div>

              {/* Services List */}
              <div className="department-services">
                <h3 className="department-services-title">Our Services</h3>
                <div className="department-services-grid">
                  {department.services.map((service, index) => (
                    <div key={index} className="department-service-item">
                      <CheckCircle className="department-service-icon" size={24} />
                      <span className="department-service-text">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="department-cta">
                <h3 className="department-cta-title">Need Medical Assistance?</h3>
                <p className="department-cta-text">
                  Book an appointment with our experienced specialists today
                </p>
                <button onClick={handleBookAppointment} className="department-cta-button">
                  Make an Appointment
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="department-sidebar">
              {/* Schedule Widget */}
              <div className="sidebar-widget">
                <h4 className="sidebar-widget-title">
                  <Clock size={20} />
                  Working Hours
                </h4>
                <div className="sidebar-schedule">
                  <div className="schedule-item">
                    <span className="schedule-day">Monday - Friday</span>
                    <span className="schedule-time">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="schedule-item">
                    <span className="schedule-day">Saturday</span>
                    <span className="schedule-time">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="schedule-item">
                    <span className="schedule-day">Sunday</span>
                    <span className="schedule-time">Closed</span>
                  </div>
                  <div className="schedule-item schedule-item-emergency">
                    <span className="schedule-day">Emergency</span>
                    <span className="schedule-time">24/7 Available</span>
                  </div>
                </div>
              </div>

              {/* Quick Links Widget */}
              <div className="sidebar-widget">
                <h4 className="sidebar-widget-title">All Departments</h4>
                <ul className="sidebar-links">
                  {Object.entries(departmentsData).map(([deptId, dept]) => (
                    <li key={deptId} className="sidebar-link-item">
                      <button
                        onClick={() => navigate(`/departments/${deptId}`)}
                        className={`sidebar-link ${deptId === id ? 'active' : ''}`}
                      >
                        {dept.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DepartmentSingle;
