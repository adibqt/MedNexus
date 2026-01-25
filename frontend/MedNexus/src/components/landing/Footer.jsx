import { motion } from 'framer-motion';
import {
  ArrowUp,
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const footerLinks = {
  Services: [
    { name: 'Video Consultation', path: '/services' },
    { name: 'Chat with Doctor', path: '/services' },
    { name: 'AI Symptom Checker', path: '/services' },
    { name: 'Medicine Delivery', path: '/services' },
    { name: 'Health Records', path: '/services' },
    { name: 'Lab Tests', path: '/services' },
  ],
  Company: [
    { name: 'About Us', path: '/about' },
    { name: 'Careers', path: '/careers' },
    { name: 'Press', path: '/press' },
    { name: 'Blog', path: '/blog' },
    { name: 'Partners', path: '/partners' },
    { name: 'Contact', path: '/contact' },
  ],
  Support: [
    { name: 'Help Center', path: '/help' },
    { name: 'Safety Center', path: '/safety' },
    { name: 'Community Guidelines', path: '/guidelines' },
    { name: 'Accessibility', path: '/accessibility' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Feedback', path: '/feedback' },
  ],
  Legal: [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'HIPAA Compliance', path: '/hipaa' },
    { name: 'Disclaimer', path: '/disclaimer' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com' },
  { icon: Twitter, href: 'https://twitter.com' },
  { icon: Instagram, href: 'https://instagram.com' },
  { icon: Linkedin, href: 'https://linkedin.com' },
  { icon: Youtube, href: 'https://youtube.com' },
];

const Footer = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" style={{ backgroundColor: '#1a1a1a', color: '#999' }}>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div>
                <div className="flex items-center gap-2 mb-6">
                  <div style={{ width: '45px', height: '45px', backgroundColor: '#10b981', borderRadius: '8px' }} className="flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>MedNexus</span>
                </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' }}>
              Your trusted healthcare partner providing world-class medical services.
            </p>

            <div className="space-y-3">
              <a href="mailto:support@mednexus.com" className="flex items-center gap-3 hover:text-emerald-400 transition-colors">
                <Mail className="w-5 h-5" />
                <span>support@mednexus.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 hover:text-emerald-400 transition-colors">
                <Phone className="w-5 h-5" />
                <span>+1 (234) 567-890</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-400 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link.path);
                      }}
                      style={{ cursor: 'pointer', color: '#9ca3af' }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#10b981';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = '#9ca3af';
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-gray-900 font-bold text-lg mb-1">Subscribe to our newsletter</h4>
              <p className="text-gray-800 text-sm">Get health tips and updates delivered to your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-5 py-3 bg-white border border-white rounded-full text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-lg"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2025 MedNexus. All rights reserved.</p>

            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            zIndex: 50,
            width: '50px',
            height: '50px',
            backgroundColor: '#10b981',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            animation: 'fadeIn 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0d9488';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
          }}
          title="Back to top"
        >
          <ArrowUp className="w-6 h-6 text-white" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
