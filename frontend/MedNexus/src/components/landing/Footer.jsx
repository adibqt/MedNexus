import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

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
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Youtube, href: '#' },
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 w-full">
      {/* Main Footer */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <motion.a
              href="#"
              className="flex items-center gap-2 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Med<span className="text-emerald-500">Nexus</span>
              </span>
            </motion.a>
            <p className="text-gray-400 mb-6 max-w-xs">
              Transforming healthcare through technology. Quality medical care, 
              accessible anytime, anywhere.
            </p>
            
            {/* Contact Info */}
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
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.path}
                      onClick={(e) => { e.preventDefault(); navigate(link.path); }}
                      style={{ cursor: 'pointer', color: '#9ca3af' }}
                      onMouseOver={(e) => e.target.style.color = '#10b981'}
                      onMouseOut={(e) => e.target.style.color = '#9ca3af'}
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

      {/* Newsletter Section */}
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

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 MedNexus. All rights reserved.
            </p>
            
            {/* Social Links */}
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
    </footer>
  );
};

export default Footer;
