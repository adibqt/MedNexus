import { motion } from "framer-motion";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const footerLinks = {
  Services: [
    { name: "Video Consultation", path: "/services" },
    { name: "Chat with Doctor", path: "/services" },
    { name: "AI Symptom Checker", path: "/services" },
    { name: "Medicine Delivery", path: "/services" },
    { name: "Health Records", path: "/services" },
    { name: "Lab Tests", path: "/services" },
  ],
  Company: [
    { name: "About Us", path: "/about" },
    { name: "Careers", path: "/careers" },
    { name: "Press", path: "/press" },
    { name: "Partners", path: "/partners" },
    { name: "Contact", path: "/contact" },
  ],
  Support: [
    { name: "Help Center", path: "/help" },
    { name: "Safety Center", path: "/safety" },
    { name: "Community Guidelines", path: "/guidelines" },
    { name: "Accessibility", path: "/accessibility" },
    { name: "FAQs", path: "/faqs" },
    { name: "Feedback", path: "/feedback" },
  ],
  Legal: [
    { name: "Terms of Service", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Cookie Policy", path: "/cookies" },
    { name: "HIPAA Compliance", path: "/hipaa" },
    { name: "Disclaimer", path: "/disclaimer" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com" },
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Instagram, href: "https://instagram.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
  { icon: Youtube, href: "https://youtube.com" },
];

const Footer = () => {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="contact"
      style={{ backgroundColor: "#1a1a1a", color: "#999", marginTop: "-40px" }}
    >
      <div className="container mx-auto px-4 py-32">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-16 mb-12 items-start">
          <div style={{ paddingTop: "20px" }}>
            <div className="flex items-center gap-2 mb-6">
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  backgroundColor: "#10b981",
                  borderRadius: "8px",
                }}
                className="flex items-center justify-center"
              >
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span
                style={{ color: "#fff", fontSize: "16px", fontWeight: "700" }}
              >
                MedNexus
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                lineHeight: "1.6",
                marginBottom: "15px",
              }}
            >
              Your trusted healthcare partner providing world-class medical
              services.
            </p>

            <div className="space-y-3">
              <a
                href="mailto:support@mednexus.com"
                className="flex items-center gap-3 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>support@mednexus.com</span>
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-3 hover:text-emerald-400 transition-colors"
              >
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
            <div key={title} style={{ paddingTop: "30px" }}>
              <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", marginBottom: "15px" }}>{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.path}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link.path);
                      }}
                      style={{ cursor: "pointer", color: "#9ca3af" }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "#10b981";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "#9ca3af";
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

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 50,
            width: "50px",
            height: "50px",
            backgroundColor: "#10b981",
            border: "none",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            animation: "fadeIn 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0d9488";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(16, 185, 129, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#10b981";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(16, 185, 129, 0.3)";
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
