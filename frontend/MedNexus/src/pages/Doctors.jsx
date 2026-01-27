import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer } from "../components/landing";
import "../pages/Landing.css";

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch doctors from API
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/doctors");
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

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
                <span className="text-white">All Specialists</span>
                <h1 className="text-capitalize mb-5 text-lg">Our Doctors</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="section doctors">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <div className="section-title">
                <h2>Doctors</h2>
                <div className="divider mx-auto my-4"></div>
                <p>
                  Meet verified specialists across internal medicine,
                  pediatrics, cardiology, dermatology, and more. Filter by
                  department and pick a doctor whose expertise and schedule fit
                  your needs.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="col-lg-3 col-md-6 col-sm-6">
                    <div className="team-block mb-5 mb-lg-0">
                      <img
                        src={
                          doctor.profile_picture_url ||
                          "/novena/images/team/1.jpg"
                        }
                        alt={doctor.name}
                        className="img-fluid w-100"
                        style={{ height: "300px", objectFit: "cover" }}
                      />
                      <div className="content">
                        <h4 className="mt-4 mb-0">
                          <a
                            href={`/doctors/${doctor.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/doctors/${doctor.id}`);
                            }}
                          >
                            {doctor.name}
                          </a>
                        </h4>
                        <p>{doctor.specialization}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info text-center">
                    No doctors available at the moment.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="row justify-content-center mt-5">
            <div className="col-lg-8">
              <div className="text-center">
                <p>
                  We believe in providing exceptional healthcare services.
                  <a
                    href="/appointments"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/appointments");
                    }}
                    className="btn btn-main-2 btn-round-full ml-2"
                  >
                    Make an Appointment
                    <i className="icofont-simple-right ml-3"></i>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Doctors;
