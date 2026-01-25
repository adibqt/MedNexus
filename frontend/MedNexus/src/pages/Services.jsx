import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { useAuth } from "../context/AuthContext";
import "./Services.css";

const serviceCards = [
  {
    title: "Video Consultation",
    description:
      "See a doctor online within minutes—HD video, secure notes, and e-prescriptions.",
    image: "/novena/images/service/service-1.jpg",
  },
  {
    title: "Chat with Doctor",
    description:
      "Ask follow-up questions and get care plan checks without another visit.",
    image: "/novena/images/service/service-2.jpg",
  },
  {
    title: "AI Symptom Checker",
    description:
      "Structured triage that guides you to the right clinician faster.",
    image: "/novena/images/service/service-3.jpg",
  },
  {
    title: "Medicine Delivery",
    description:
      "Order prescriptions and refills with doorstep delivery and status updates.",
    image: "/novena/images/service/service-4.jpg",
  },
  {
    title: "Health Records",
    description:
      "All consult notes, prescriptions, and labs in one secure place you control.",
    image: "/novena/images/service/service-6.jpg",
  },
  {
    title: "Lab Tests",
    description:
      "Schedule home collection or nearby labs with results synced to your doctor.",
    image: "/novena/images/service/service-8.jpg",
  },
];

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetAppointment = () => {
    if (user) {
      // Logged in: navigate to home page then scroll to appointment form
      navigate("/");
      // Small delay to allow page to load before scrolling
      setTimeout(() => {
        const appointmentSection = document.getElementById("appointment");
        if (appointmentSection) {
          appointmentSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    } else {
      // Not logged in: go to sign-in
      navigate("/sign-in");
    }
  };
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
                    <img
                      src={service.image}
                      alt={service.title}
                      className="service-card__image"
                    />
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
                Get care in one place—book visits, labs, and medications through{" "}
                <span className="services-cta__highlight">MedNexus</span>
              </h2>
              <button
                onClick={handleGetAppointment}
                className="services-cta__btn"
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "14px 32px",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#0d9488";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 12px 32px rgba(16, 185, 129, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#10b981";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 8px 24px rgba(16, 185, 129, 0.3)";
                }}
              >
                Get appointment →
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
