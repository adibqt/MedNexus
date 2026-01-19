const Hero = () => {
  const handleBookAppointment = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Not logged in, redirect to auth page
      window.location.href = '/auth?mode=signup';
    } else {
      // User is logged in, redirect to appointments
      window.location.href = '/patient/appointments';
    }
  };

  return (
    <>
      {/* Banner Section */}
      <section className="banner">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-12 col-xl-7">
              <div className="block" style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '25px', borderRadius: '8px' }}>
                <div className="divider mb-3"></div>
                <span className="text-uppercase text-sm letter-spacing" style={{ color: '#000', fontWeight: 700 }}>
                  Total health care solution
                </span>
                <h1 className="mb-3 mt-3">Your Most Trusted Health Partner</h1>
                <p className="mb-4 pr-5" style={{ color: '#333', fontWeight: 600 }}>
                  Connect with world-class doctors instantly. Get diagnosed, treated, and feel better—all from the comfort of your home.
                </p>
                <div className="btn-container">
                  <a href="#book-appointment" className="btn btn-main btn-icon btn-round-full" style={{ background: '#10b981', color: '#fff', padding: '15px 30px', fontSize: '16px' }}>
                    Make Appointment <i className="icofont-simple-right ml-2"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="feature-block d-lg-flex">
                <div className="feature-item mb-5 mb-lg-0">
                  <div className="feature-icon mb-4">
                    <i className="icofont-surgeon-alt"></i>
                  </div>
                  <span>24 Hours Service</span>
                  <h4 className="mb-3">Online Appointment</h4>
                  <p className="mb-4">Get all time support for emergency. We have introduced the principle of family medicine.</p>
                  <a href="#book-appointment" className="btn btn-main btn-round-full">Make an appointment</a>
                </div>

                <div className="feature-item mb-5 mb-lg-0">
                  <div className="feature-icon mb-4">
                    <i className="icofont-ui-clock"></i>
                  </div>
                  <span>Timing Schedule</span>
                  <h4 className="mb-3">Working Hours</h4>
                  <ul className="w-hours list-unstyled">
                    <li className="d-flex justify-content-between">Sun - Wed : <span>8:00 - 17:00</span></li>
                    <li className="d-flex justify-content-between">Thu - Fri : <span>9:00 - 17:00</span></li>
                    <li className="d-flex justify-content-between">Sat - Sun : <span>10:00 - 17:00</span></li>
                  </ul>
                </div>

                <div className="feature-item mb-5 mb-lg-0">
                  <div className="feature-icon mb-4">
                    <i className="icofont-phone"></i>
                  </div>
                  <span>Emergency Cases</span>
                  <h4 className="mb-3" style={{ fontSize: '20px' }}>+1-800-123-4567</h4>
                  <p className="mb-4">Get all time support for emergency. Contact us for any urgent medical needs.</p>
                  <a href="/contact" className="btn btn-main btn-round-full">Contact Us</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      <section id="book-appointment" className="section appoinment">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="appoinment-content">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=600&fit=crop" 
                  alt="Doctor" 
                  className="img-fluid"
                />
                <div className="emergency">
                  <h2 className="text-lg">
                    <i className="icofont-phone-circle text-lg"></i> +1-800-123-4567
                  </h2>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-10">
              <div className="appoinment-wrap mt-5 mt-lg-0">
                <h2 className="mb-2 title-color">Book Appointment</h2>
                <p className="mb-4">Connect with our expert doctors and schedule your consultation today. Quality healthcare is just a click away.</p>
                <form className="appoinment-form">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="form-group">
                        <select className="form-control">
                          <option>Choose Department</option>
                          <option>Cardiology</option>
                          <option>Neurology</option>
                          <option>Dermatology</option>
                          <option>General Physician</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <select className="form-control">
                          <option>Select Doctors</option>
                          <option>Dr. Sarah Johnson</option>
                          <option>Dr. Michael Chen</option>
                          <option>Dr. Emily Parker</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="dd/mm/yyyy" />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Time" />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <input type="text" className="form-control" placeholder="Full Name" />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <input type="tel" className="form-control" placeholder="Phone Number" />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-group">
                        <textarea className="form-control" placeholder="Your Message" rows="5"></textarea>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={handleBookAppointment} className="btn btn-main btn-round-full mt-3">
                    Make Appointment <i className="icofont-simple-right ml-2"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
