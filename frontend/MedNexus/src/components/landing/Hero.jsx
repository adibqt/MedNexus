import { useNavigate } from "react-router-dom";
import { Building2, Clock, Phone, Users, Award, Globe, Stethoscope } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Banner Section with Background (Novena style) */}
      <section
        style={{
          backgroundImage: "url(/novena/images/bg/slider-bg-1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          paddingTop: "70px",
          paddingBottom: "50px",
          position: "relative",
          minHeight: "420px",
          backgroundColor: "#f8fafc",
          overflow: "hidden",
        }}
      >
        {/* Dark overlay for better text contrast */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        ></div>

        <div
          className="container mx-auto px-4"
          style={{ position: "relative", zIndex: 2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div style={{ maxWidth: "560px" }}>
              <div
                style={{
                  borderBottom: "4px solid #10b981",
                  width: "70px",
                  marginBottom: "20px",
                }}
              ></div>
              <span
                style={{
                  color: "#ffffff",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  fontSize: "13px",
                }}
                className="uppercase"
              >
                Total Health Care Solution
              </span>
              <h1
                style={{
                  fontSize: "52px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  color: "#ffffff",
                  marginTop: "15px",
                  marginBottom: "22px",
                }}
              >
                Your Most Trusted
                <br />
                Health Partner
              </h1>
              <p
                style={{
                  color: "#ffffff",
                  lineHeight: "1.7",
                  fontSize: "16px",
                  marginBottom: "32px",
                  maxWidth: "520px",
                  fontWeight: "700",
                }}
              >
                Book secure video visits, in-clinic appointments, and follow-ups
                with trusted doctors all in one place. Manage your health
                records and get care without the hassle.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/sign-in")}
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    padding: "14px 38px",
                    fontSize: "15px",
                    fontWeight: "700",
                    borderRadius: "50px",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.5px",
                  }}
                  className="hover:opacity-90"
                >
                  Make Appointment →
                </button>
              </div>
            </div>

            {/* Right Content left empty so hero image shows fully */}
            <div></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          backgroundColor: "#fff",
          paddingTop: "60px",
          paddingBottom: "60px",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              style={{
                padding: "40px",
                backgroundColor: "#fff",
                border: "2px solid #10b981",
                borderRadius: "8px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ 
                width: "72px", 
                height: "72px", 
                margin: "0 auto 20px",
                backgroundColor: "#10b981",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
              }}>
                <Building2 size={40} color="#fff" strokeWidth={2} />
              </div>
              <span
                style={{
                  color: "#10b981",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                24 HOURS SERVICE
              </span>
              <h4
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#222",
                  marginTop: "10px",
                  marginBottom: "15px",
                }}
              >
                Online Appointment
              </h4>
              <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
                Get all time support for emergency. We have introduced the
                principle of family medicine.
              </p>
              <button
                style={{
                  backgroundColor: "#10b981",
                  color: "#fff",
                  padding: "8px 20px",
                  marginTop: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/sign-in")}
                className="hover:opacity-90"
              >
                Make Appointment
              </button>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                padding: "40px",
                backgroundColor: "#fff",
                border: "2px solid #10b981",
                borderRadius: "8px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ 
                width: "72px", 
                height: "72px", 
                margin: "0 auto 20px",
                backgroundColor: "#10b981",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
              }}>
                <Clock size={40} color="#fff" strokeWidth={2} />
              </div>
              <span
                style={{
                  color: "#10b981",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                TIMING SCHEDULE
              </span>
              <h4
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#222",
                  marginTop: "10px",
                  marginBottom: "15px",
                }}
              >
                Working Hours
              </h4>
              <div
                style={{
                  color: "#666",
                  fontSize: "14px",
                  lineHeight: "1.8",
                  textAlign: "left",
                }}
              >
                <div className="flex justify-between">
                  <span>Sun - Wed:</span>
                  <span>8:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Thu - Fri:</span>
                  <span>9:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sat - Sun:</span>
                  <span>10:00 - 17:00</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                padding: "40px",
                backgroundColor: "#fff",
                border: "2px solid #10b981",
                borderRadius: "8px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ 
                width: "72px", 
                height: "72px", 
                margin: "0 auto 20px",
                backgroundColor: "#10b981",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
              }}>
                <Phone size={40} color="#fff" strokeWidth={2} />
              </div>
              <span
                style={{
                  color: "#10b981",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                EMERGENCY CASES
              </span>
              <h4
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#222",
                  marginTop: "10px",
                  marginBottom: "15px",
                }}
              >
                1-800-700-6200
              </h4>
              <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
                Get all time support for emergency. We have introduced the
                principle of family medicine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Personal Care */}
      <section
        style={{
          backgroundColor: "#fff",
          paddingTop: "80px",
          paddingBottom: "80px",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Images */}
            <div className="lg:col-span-3">
              <img
                src="/novena/images/about/img-1.jpg"
                alt="About 1"
                style={{
                  width: "85%",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <img
                src="/novena/images/about/img-2.jpg"
                alt="About 2"
                style={{
                  width: "85%",
                  borderRadius: "8px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>

            {/* Center Image */}
            <div className="lg:col-span-3">
              <img
                src="/novena/images/about/img-3.jpg"
                alt="About 3"
                style={{
                  width: "85%",
                  borderRadius: "8px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6">
              <h2
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#222",
                  lineHeight: "1.3",
                  marginBottom: "20px",
                }}
              >
                Personal care &<br />
                healthy living
              </h2>
              <p
                style={{
                  color: "#666",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  marginBottom: "30px",
                }}
              >
                We provide best leading medical service. Comprehensive
                healthcare solutions with experienced doctors and modern
                facilities for your well-being.
              </p>
              <button
                onClick={() => {
                  navigate("/services");
                  window.scrollTo(0, 0);
                }}
                style={{
                  backgroundColor: "#10b981",
                  color: "#fff",
                  padding: "12px 32px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                }}
                className="hover:opacity-90"
              >
                Services →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          backgroundColor: "#10b981",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                margin: "0 auto 10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Users size={36} color="#fff" strokeWidth={2} />
              </div>
              <div
                style={{ fontSize: "36px", fontWeight: "700", color: "#fff" }}
              >
                58<span style={{ fontSize: "24px" }}>k</span>
              </div>
              <p style={{ color: "#fff", fontSize: "14px", marginTop: "8px" }}>
                Happy People
              </p>
            </div>
            <div>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                margin: "0 auto 10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Stethoscope size={36} color="#fff" strokeWidth={2} />
              </div>
              <div
                style={{ fontSize: "36px", fontWeight: "700", color: "#fff" }}
              >
                700<span style={{ fontSize: "24px" }}>+</span>
              </div>
              <p style={{ color: "#fff", fontSize: "14px", marginTop: "8px" }}>
                Surgery Completed
              </p>
            </div>
            <div>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                margin: "0 auto 10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Award size={36} color="#fff" strokeWidth={2} />
              </div>
              <div
                style={{ fontSize: "36px", fontWeight: "700", color: "#fff" }}
              >
                40<span style={{ fontSize: "24px" }}>+</span>
              </div>
              <p style={{ color: "#fff", fontSize: "14px", marginTop: "8px" }}>
                Expert Doctors
              </p>
            </div>
            <div>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                margin: "0 auto 10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Globe size={36} color="#fff" strokeWidth={2} />
              </div>
              <div
                style={{ fontSize: "36px", fontWeight: "700", color: "#fff" }}
              >
                20
              </div>
              <p style={{ color: "#fff", fontSize: "14px", marginTop: "8px" }}>
                Worldwide Branch
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
