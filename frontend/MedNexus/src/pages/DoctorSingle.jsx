import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar, Footer } from "../components/landing";
import "../pages/Landing.css";

const DoctorSingle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch doctor details from API
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/doctors/${id}`);

        if (!response.ok) {
          console.error("Doctor not found or not available");
          setDoctor(null);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="landing-page">
        <Navbar />
        <div
          className="text-center py-5"
          style={{
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="landing-page">
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-warning">Doctor not found.</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="landing-page">
      <Navbar />

      {/* Page Title */}
      <section className="page-title bg-1">
        <div className="overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="block text-center">
                <span className="text-white">Doctor Details</span>
                <h1 className="text-capitalize mb-5 text-lg">{doctor.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Details Section */}
      <section className="section doctor-single">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="doctor-img-block">
                <img
                  src={
                    doctor.profile_picture_url || "/novena/images/team/1.jpg"
                  }
                  alt={doctor.name}
                  className="img-fluid w-100"
                />
                <div className="info-block mt-4">
                  <h4 className="mb-0">{doctor.name}</h4>
                  <p>{doctor.specialization}</p>
                  <ul className="list-inline mt-4 doctor-social-links">
                    <li className="list-inline-item">
                      <a href="#">
                        <i className="icofont-facebook"></i>
                      </a>
                    </li>
                    <li className="list-inline-item">
                      <a href="#">
                        <i className="icofont-twitter"></i>
                      </a>
                    </li>
                    <li className="list-inline-item">
                      <a href="#">
                        <i className="icofont-skype"></i>
                      </a>
                    </li>
                    <li className="list-inline-item">
                      <a href="#">
                        <i className="icofont-linkedin"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-8 col-md-6">
              <div className="doctor-details mt-4 mt-lg-0">
                <h2 className="text-md">About {doctor.name}</h2>
                <div className="divider my-4"></div>
                <p>
                  {doctor.name} is board-certified in{" "}
                  {doctor.specialization.toLowerCase()}
                  and specializes in evidence-based treatment and personalized
                  care plans. With a patient-first approach, {doctor.name}{" "}
                  combines clinical expertise with modern tools to deliver
                  effective outcomes.
                </p>
                <p>
                  Available for video consultations, in-clinic visits, and
                  follow-up chat,
                  {doctor.name} is committed to accessible, compassionate
                  healthcare.
                </p>

                <h3 className="mt-4 mb-3">Expertise</h3>
                <div className="divider my-4"></div>
                <ul className="list-unstyled department-service">
                  <li>
                    <i className="icofont-check mr-2"></i>
                    {doctor.specialization}
                  </li>
                  <li>
                    <i className="icofont-check mr-2"></i>Video & In-Person
                    Consultations
                  </li>
                  <li>
                    <i className="icofont-check mr-2"></i>Diagnosis & Treatment
                    Planning
                  </li>
                  <li>
                    <i className="icofont-check mr-2"></i>Follow-Up Care & Chat
                    Support
                  </li>
                </ul>

                {doctor.experience && (
                  <>
                    <h3 className="mt-5 mb-3">Experience</h3>
                    <div className="divider my-4"></div>
                    <p>{doctor.experience} years of professional experience</p>
                  </>
                )}

                {doctor.email && (
                  <>
                    <h3 className="mt-5 mb-3">Contact Information</h3>
                    <div className="divider my-4"></div>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <strong>Email:</strong> {doctor.email}
                      </li>
                      {doctor.phone && (
                        <li className="mb-2">
                          <strong>Phone:</strong> {doctor.phone}
                        </li>
                      )}
                    </ul>
                  </>
                )}

                <div className="mt-5">
                  <button
                    onClick={() => navigate("/appointments")}
                    className="btn btn-main-2 btn-round-full"
                  >
                    Make an Appointment
                    <i className="icofont-simple-right ml-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DoctorSingle;
