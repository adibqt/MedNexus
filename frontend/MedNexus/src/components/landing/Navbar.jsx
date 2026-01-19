import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Header Top Bar */}
      <div className="header-top-bar">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <ul className="top-bar-info list-inline-item pl-0 mb-0">
                <li className="list-inline-item" style={{ color: '#000', fontSize: '16px' }}>
                  <a href="mailto:support@mednexus.com" style={{ color: '#000', fontSize: '16px' }}>
                    <i className="icofont-support-faq mr-2"></i>support@mednexus.com
                  </a>
                </li>
                <li className="list-inline-item" style={{ color: '#000', fontSize: '16px' }}>
                  <i className="icofont-location-pin mr-2"></i>Available Worldwide
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="text-lg-right top-right-bar mt-2 mt-lg-0">
                <a href="tel:+1-800-123-4567" style={{ color: '#000', fontSize: '16px' }}>
                  <span>Call Now : </span>
                  <span>+1-800-123-4567</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="navbar navbar-expand-lg navigation" id="navbar">
        <div className="container">
          <a className="navbar-brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <Heart style={{ color: '#10b981', marginRight: '10px', display: 'inline' }} size={40} />
            <span style={{ fontFamily: 'Exo, sans-serif', fontWeight: 700, fontSize: '28px' }}>
              Med<span style={{ color: '#10b981' }}>Nexus</span>
            </span>
          </a>

          <button 
            className="navbar-toggler collapsed" 
            type="button" 
            data-toggle="collapse" 
            data-target="#navbarmain"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className="icofont-navigation-menu"></i>
          </button>

          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarmain">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item active">
                <a className="nav-link" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/services" onClick={(e) => { e.preventDefault(); navigate('/services'); }}>Services</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/how-it-works" onClick={(e) => { e.preventDefault(); navigate('/how-it-works'); }}>How It Works</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/doctors" onClick={(e) => { e.preventDefault(); navigate('/doctors'); }}>Doctors</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/testimonials" onClick={(e) => { e.preventDefault(); navigate('/testimonials'); }}>Testimonials</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact</a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link btn btn-main btn-round-full ml-3"
                  href="/sign-in"
                  onClick={(e) => { e.preventDefault(); navigate('/sign-in'); }}
                  style={{ color: '#fff', padding: '8px 20px' }}
                >
                  Sign In
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
