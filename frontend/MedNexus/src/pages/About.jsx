import React, { useState } from "react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import "./About.css";

const featureCards = [
  {
    title: "Healthcare for Kids",
    copy: "Voluptate aperiam esse possimus maxime repellendus, nihil quod accusantium.",
    image: "/novena/images/about/about-1.jpg",
  },
  {
    title: "Medical Counseling",
    copy: "Voluptate aperiam esse possimus maxime repellendus, nihil quod accusantium.",
    image: "/novena/images/about/about-2.jpg",
  },
  {
    title: "Modern Equipments",
    copy: "Voluptate aperiam esse possimus maxime repellendus, nihil quod accusantium.",
    image: "/novena/images/about/about-3.jpg",
  },
  {
    title: "Qualified Doctors",
    copy: "Voluptate aperiam esse possimus maxime repellendus, nihil quod accusantium.",
    image: "/novena/images/about/about-4.jpg",
  },
];

const awardLogos = [
  "/novena/images/about/3.png",
  "/novena/images/about/4.png",
  "/novena/images/about/1.png",
  "/novena/images/about/2.png",
  "/novena/images/about/5.png",
  "/novena/images/about/6.png",
];

const specialists = [
  {
    name: "John Marshal",
    role: "Internist, Emergency Physician",
    image: "/novena/images/team/1.jpg",
  },
  {
    name: "Marshal Root",
    role: "Surgeon, Cardiologist",
    image: "/novena/images/team/2.jpg",
  },
  {
    name: "Siamon John",
    role: "Internist, General Practitioner",
    image: "/novena/images/team/3.jpg",
  },
  {
    name: "Rishat Ahmed",
    role: "Orthopedic Surgeon",
    image: "/novena/images/team/4.jpg",
  },
];

const testimonials = [
  { title: "Amazing service!", name: "John Partho" },
  { title: "Expert doctors!", name: "Mullar Sarth" },
  { title: "Good Support!", name: "Kolis Mullar" },
  { title: "Nice Environment!", name: "Partho Sarothi" },
  { title: "Modern Service!", name: "Kolis Mullar" },
];

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = testimonials.length;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
    <div className="about-page">
      <Navbar />
      <main>
        <section className="about-hero">
          <div className="about-hero__overlay" />
          <div className="about-container about-hero__content">
            <div className="about-hero__text">
              <span className="about-hero__eyebrow">About Us</span>
              <h1>About Us</h1>
            </div>
          </div>
        </section>

        <section className="about-section about-intro">
          <div className="about-container about-intro__grid">
            <div>
              <h2 className="about-title">
                Personal care for your healthy living
              </h2>
            </div>
            <div className="about-intro__body">
              <p>
                MedNexus connects patients with trusted clinicians through
                secure video visits, in-clinic care, and coordinated follow-ups.
                Our team blends medical expertise with modern technology so you
                can book, consult, and manage your health from anywhere.
              </p>
              <img
                src="/novena/images/about/sign.png"
                alt="Signature"
                className="about-intro__signature"
              />
            </div>
          </div>
        </section>

        <section className="about-section about-features">
          <div className="about-container about-features__grid">
            {featureCards.map((card) => (
              <div className="about-card" key={card.title}>
                <div className="about-card__image-wrap">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="about-card__image"
                  />
                </div>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section about-awards">
          <div className="about-container about-awards__grid">
            <div className="about-awards__title">
              <h2 className="about-title">Our Doctors achievements</h2>
              <div className="about-divider" />
            </div>
            <div className="about-awards__logos">
              {awardLogos.map((logo, index) => (
                <img key={index} src={logo} alt={`Award ${index + 1}`} />
              ))}
            </div>
          </div>
        </section>

        <section className="about-section about-team">
          <div className="about-container">
            <div className="about-section__header">
              <h2 className="about-title">Meet Our Specialist</h2>
              <div className="about-divider" />
              <p className="about-muted">
                Today’s users expect effortless experiences. Don’t let essential
                people and processes stay stuck in the past. Speed it up, skip
                the hassles.
              </p>
            </div>
            <div className="about-team__grid">
              {specialists.map((person) => (
                <div className="about-team__card" key={person.name}>
                  <img src={person.image} alt={person.name} />
                  <div className="about-team__content">
                    <h4>{person.name}</h4>
                    <p>{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section about-testimonials">
          <div className="about-container about-testimonials__grid">
            <div className="about-testimonials__heading">
              <h2 className="about-title">What they say about us</h2>
              <div className="about-divider" />
            </div>

            <div className="about-slider">
              <div
                className="about-slider__track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((item) => (
                  <div className="about-slider__slide" key={item.title}>
                    <div className="about-testimonial">
                      <div className="about-testimonial__icon">“</div>
                      <div className="about-testimonial__body">
                        <h4>{item.title}</h4>
                        <p>
                          They provide great service facilty consectetur
                          adipisicing elit. Itaque rem, praesentium, iure, ipsum
                          magnam deleniti a vel eos adipisci suscipit fugit
                          placeat. Quibusdam laboriosam eveniet nostrum nemo
                          commodi numquam quod.
                        </p>
                        <span className="about-muted">{item.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="about-slider__controls">
                <button
                  className="about-slider__btn"
                  onClick={prevSlide}
                  aria-label="Previous testimonial"
                >
                  ‹
                </button>
                <div className="about-slider__dots">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.title}
                      className={`about-slider__dot ${index === currentSlide ? "is-active" : ""}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  className="about-slider__btn"
                  onClick={nextSlide}
                  aria-label="Next testimonial"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
