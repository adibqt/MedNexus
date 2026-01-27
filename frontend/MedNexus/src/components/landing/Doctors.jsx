import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";

const API_URL = "http://localhost:8000";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${API_URL}${url}`;
};

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDoctors();
      // Only show first 4 doctors on landing page
      setDoctors(response.slice(0, 4));
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  const handleViewAll = () => {
    navigate("/doctors");
  };

  return (
    <section id="doctors" className="section-doctors">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="doctors-title">Meet Our Expert Doctors</h2>
          <div className="divider" />
          <p className="doctors-subtitle">
            Our network includes board-certified specialists ready to provide
            you with world-class medical care.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doctor, index) => (
              <div
                key={doctor.id || index}
                className="doctor-card"
                onClick={() => handleDoctorClick(doctor.id)}
              >
                <div className="doctor-card-inner">
                  <div className="doctor-profile">
                    <div className="doctor-img">
                      <img
                        src={
                          getImageUrl(doctor.profile_picture) ||
                          "/novena/images/team/1.jpg"
                        }
                        alt={`Dr. ${doctor.full_name}`}
                        className="img-fluid"
                      />
                    </div>
                  </div>
                  <div className="doctor-content">
                    <h4 className="doctor-name">
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          handleDoctorClick(doctor.id);
                        }}
                      >
                        Dr. {doctor.full_name}
                      </a>
                    </h4>
                    <p className="doctor-specialty">{doctor.specialization}</p>
                    {doctor.qualifications && (
                      <p className="doctor-qualification">
                        {doctor.qualifications}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button className="btn-view-all" onClick={handleViewAll}>
            View All Doctors
          </button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;
