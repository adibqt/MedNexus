import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Footer } from '../components/landing';
import { useAuth } from '../context/AuthContext';
import '../pages/Landing.css';

const Appointments = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    message: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Fetch doctors and departments
    const fetchData = async () => {
      try {
        const [doctorsRes, departmentsRes] = await Promise.all([
          fetch('http://localhost:8000/api/doctors'),
          fetch('http://localhost:8000/api/specializations')
        ]);
        
        const doctorsData = await doctorsRes.json();
        const departmentsData = await departmentsRes.json();
        
        setDoctors(doctorsData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isAuthenticated) {
      // If user is logged in, navigate to book appointment
      navigate('/patient/dashboard');
    } else {
      // If not logged in, redirect to sign in
      alert('Please sign in to book an appointment');
      navigate('/sign-in/patient');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      <section className="appoinment section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="mt-3">
                <div className="feature-icon mb-3">
                  <i className="icofont-support text-lg text-color"></i>
                </div>
                <span className="h3">Call for an Emergency Service!</span>
                <h2 className="text-color mt-3">+1-823-456-5134</h2>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="appoinment-wrap mt-5 mt-lg-0 pl-lg-5">
                <h2 className="mb-2 title-color">Book an appointment</h2>
                <p className="mb-4">We will confirm your appointment within 2 hours</p>
                
                <form id="appoinment-form" className="appoinment-form" onSubmit={handleSubmit}>
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
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group">
                        <input 
                          name="time" 
                          type="time" 
                          className="form-control"
                          value={formData.time}
                          onChange={handleChange}
                          required
                        />
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
                    Make Appointment <i className="icofont-simple-right ml-2"></i>
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
