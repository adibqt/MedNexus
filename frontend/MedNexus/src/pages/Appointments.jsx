import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer } from "../components/landing";
import { useAuth } from "../context/AuthContext";
import "../pages/Landing.css";

const Appointments = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    department: "",
    doctor: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    message: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Fetch doctors and departments
    const fetchData = async () => {
      try {
        const [doctorsRes, departmentsRes] = await Promise.all([
          fetch("http://localhost:8000/api/doctors"),
          // Specializations endpoint is under admin router
          fetch("http://localhost:8000/api/admin/specializations"),
        ]);

        if (!doctorsRes.ok) {
          throw new Error(`Doctors fetch failed: ${doctorsRes.status}`);
        }
        if (!departmentsRes.ok) {
          throw new Error(`Departments fetch failed: ${departmentsRes.status}`);
        }

        const doctorsData = await doctorsRes.json();
        const departmentsData = await departmentsRes.json();

        setDoctors(doctorsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isAuthenticated) {
      // If user is logged in, navigate to book appointment
      navigate("/patient/dashboard");
    } else {
      // If not logged in, redirect to sign in
      alert("Please sign in to book an appointment");
      navigate("/sign-in/patient");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
                <span className="text-white">Book your Seat</span>
                <h1 className="text-capitalize mb-5 text-lg">Appointment</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      {/* Custom calendar styles for green theme */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(41%) sepia(98%) saturate(469%) hue-rotate(110deg) brightness(92%) contrast(92%);
        }
        input[type="date"]:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 2px #10b98133;
        }
        input[type="date"]::-webkit-input-placeholder { color: #10b981; }
        input[type="date"]::-moz-placeholder { color: #10b981; }
        input[type="date"]:-ms-input-placeholder { color: #10b981; }
        input[type="date"]::placeholder { color: #10b981; }
        /* Chrome/Edge/Opera calendar popup */
        ::-webkit-calendar-picker-indicator { color: #10b981; }
        /* Date picker highlight for Chrome */
        ::-webkit-datetime-edit-text { color: #222; }
        ::-webkit-datetime-edit-month-field:focus,
        ::-webkit-datetime-edit-day-field:focus,
        ::-webkit-datetime-edit-year-field:focus {
          background: #10b98122;
          color: #10b981;
        }
        /* Firefox calendar popup */
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #10b981 !important;
          color: #fff !important;
        }
        /* General calendar improvements */
        input[type="date"] {
          border-radius: 8px;
          border: 1.5px solid #e9ecef;
          padding: 12px 16px;
          font-size: 1.1rem;
          transition: border 0.2s, box-shadow 0.2s;
        }
      `}</style>
      <section className="appoinment section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="mt-3">
                <div className="feature-icon mb-3">
                  <i className="icofont-support text-lg text-color"></i>
                </div>
                <span className="h3">Call for an Emergency Service!</span>
                <h2 className="text-color mt-3">+880-02-4821-39572</h2>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="appoinment-wrap mt-5 mt-lg-0 pl-lg-5">
                <h2 className="mb-2 title-color">Book an appointment</h2>
                <p className="mb-4">
                  We will confirm your appointment within 2 hours
                </p>

                <form
                  id="appoinment-form"
                  className="appoinment-form"
                  onSubmit={handleSubmit}
                >
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="form-group">
                        <select
                          className="form-control"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group">
                        <select
                          className="form-control"
                          name="doctor"
                          value={formData.doctor}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Doctor</option>
                          {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.name} - {doctor.specialization}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group">
                        <input
                          name="date"
                          type="date"
                          className="form-control"
                          placeholder="dd/mm/yyyy"
                          value={formData.date}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group" style={{ position: 'relative' }}>
                        <input
                          name="time"
                          type="time"
                          className="form-control"
                          value={formData.time}
                          onChange={handleChange}
                          required
                          disabled={!formData.date}
                          style={{
                            position: 'relative',
                            zIndex: 2,
                            background: 'transparent',
                            color: !formData.time ? 'rgba(0,0,0,0.15)' : undefined,
                            caretColor: '#222',
                            opacity: !formData.date ? 0 : 1,
                          }}
                        />
                        { (!formData.date) ? (
                          <span
                            style={{
                              position: 'absolute',
                              left: '16px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#888',
                              pointerEvents: 'none',
                              zIndex: 1,
                            }}
                          >
                            Select Date First
                          </span>
                        ) : (!formData.time && formData.date) ? (
                          <span
                            style={{
                              position: 'absolute',
                              left: '16px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#888',
                              pointerEvents: 'none',
                              zIndex: 1,
                            }}
                          >
                            Select Time
                          </span>
                        ) : null }
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group">
                        <input
                          name="name"
                          type="text"
                          className="form-control"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group">
                        <input
                          name="phone"
                          type="tel"
                          className="form-control"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group-2 mb-4">
                    <textarea
                      name="message"
                      className="form-control"
                      rows="6"
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-main btn-round-full">
                    Make Appointment{" "}
                    <i className="icofont-simple-right ml-2"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Appointments;
