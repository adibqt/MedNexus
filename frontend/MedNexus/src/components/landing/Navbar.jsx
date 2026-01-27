import { useState } from "react";
import { Heart, ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header>
      {/* Navigation Bar */}
      <nav
        style={{ borderBottom: "1px solid #e9ecef", backgroundColor: "#fff" }}
      >
        <div className="container mx-auto px-4">
          <div className="py-4 flex items-center justify-between">
            {/* Logo */}
            <button
              type="button"
              className="flex items-center gap-3 z-50 cursor-pointer"
              style={{ background: "none", border: "none", padding: 0 }}
              onClick={() => navigate("/")}
            >
              <div
                style={{
                  width: "55px",
                  height: "55px",
                  backgroundColor: "#10b981",
                  borderRadius: "8px",
                }}
                className="flex items-center justify-center shadow-lg"
              >
                <Heart className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                Med<span style={{ color: "#10b981" }}>Nexus</span>
              </span>
            </button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-emerald-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="/"
                style={{ color: "#222" }}
                className="font-medium hover:text-emerald-600"
              >
                Home
              </a>
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/about");
                }}
                style={{ color: "#222" }}
                className="font-medium hover:text-emerald-600"
              >
                About
              </a>
              <a
                href="/services"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/services");
                }}
                style={{ color: "#222" }}
                className="font-medium hover:text-emerald-600"
              >
                Services
              </a>

              {/* Department Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown("dept")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  style={{ color: "#222" }}
                  className="font-medium hover:text-emerald-600 flex items-center gap-1"
                >
                  Department <ChevronDown className="w-4 h-4" />
                </button>
                {openDropdown === "dept" && (
                  <div className="absolute left-0 top-full mt-0 w-52 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-100">
                    <div className="h-1 w-full bg-emerald-500" />
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/departments");
                        setOpenDropdown(null);
                      }}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    >
                      Departments
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/departments/1");
                        setOpenDropdown(null);
                      }}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    >
                      Department Single
                    </button>
                  </div>
                )}
              </div>

              {/* Doctors Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown("docs")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  style={{ color: "#222" }}
                  className="font-medium hover:text-emerald-600 flex items-center gap-1"
                >
                  Doctors <ChevronDown className="w-4 h-4" />
                </button>
                {openDropdown === "docs" && (
                  <div className="absolute left-0 top-full mt-0 w-52 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-100">
                    <div className="h-1 w-full bg-emerald-500" />
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/doctors");
                        setOpenDropdown(null);
                      }}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    >
                      Doctors
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/doctors/1");
                        setOpenDropdown(null);
                      }}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    >
                      Doctor Single
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/appointments");
                        setOpenDropdown(null);
                      }}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
                    >
                      Appointments
                    </button>
                  </div>
                )}
              </div>

              <a
                href="/#contact"
                style={{ color: "#222" }}
                className="font-medium hover:text-emerald-600"
              >
                Contact
              </a>

              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    style={{ 
                      backgroundColor: "#10b981", 
                      color: "#fff",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      border: "none",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)"
                    }}
                    className="hover:opacity-90 hover:shadow-lg"
                    onClick={() => navigate("/patient/dashboard")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.2)";
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    style={{ 
                      color: "#ef4444",
                      backgroundColor: "#fef2f2",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      border: "none",
                      transition: "all 0.2s ease"
                    }}
                    className="flex items-center gap-2"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fef2f2";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    borderRadius: "9999px",
                  }}
                  className="px-5 py-2 rounded-full font-medium hover:opacity-90"
                  onClick={() => navigate("/sign-in")}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              <a
                href="/"
                className="block py-2 text-gray-700 hover:text-emerald-600"
              >
                Home
              </a>
              <a
                href="/about"
                className="block py-2 text-gray-700 hover:text-emerald-600"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/about");
                  setIsOpen(false);
                }}
              >
                About
              </a>
              <a
                href="/services"
                className="block py-2 text-gray-700 hover:text-emerald-600"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/services");
                  setIsOpen(false);
                }}
              >
                Services
              </a>

              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "department" ? null : "department",
                  )
                }
                className="w-full text-left py-2 text-gray-700 hover:text-emerald-600 flex items-center justify-between"
              >
                Department{" "}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openDropdown === "department" ? "rotate-180" : ""}`}
                />
              </button>
              {openDropdown === "department" && (
                <div className="bg-gray-50 pl-4">
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/departments");
                      setIsOpen(false);
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left py-2 text-gray-600 hover:text-emerald-600"
                  >
                    Departments
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/departments/1");
                      setIsOpen(false);
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left py-2 text-gray-600 hover:text-emerald-600"
                  >
                    Department Single
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === "doctors" ? null : "doctors")
                }
                className="w-full text-left py-2 text-gray-700 hover:text-emerald-600 flex items-center justify-between"
              >
                Doctors{" "}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openDropdown === "doctors" ? "rotate-180" : ""}`}
                />
              </button>
              {openDropdown === "doctors" && (
                <div className="bg-gray-50 pl-4">
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/doctors");
                      setIsOpen(false);
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left py-2 text-gray-600 hover:text-emerald-600"
                  >
                    Doctors
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/doctors/1");
                      setIsOpen(false);
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left py-2 text-gray-600 hover:text-emerald-600"
                  >
                    Doctor Single
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/appointments");
                      setIsOpen(false);
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left py-2 text-gray-600 hover:text-emerald-600"
                  >
                    Appointments
                  </button>
                </div>
              )}

              <a
                href="/#contact"
                className="block py-2 text-gray-700 hover:text-emerald-600"
              >
                Contact
              </a>
              {user ? (
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    style={{ 
                      backgroundColor: "#10b981", 
                      color: "#fff",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      border: "none",
                      width: "100%"
                    }}
                    className="hover:opacity-90"
                    onClick={() => {
                      navigate("/patient/dashboard");
                      setIsOpen(false);
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    style={{ 
                      color: "#ef4444",
                      backgroundColor: "#fef2f2",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      border: "none",
                      width: "100%"
                    }}
                    className="flex items-center justify-center gap-2"
                    onClick={() => {
                      logout();
                      navigate("/");
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    borderRadius: "9999px",
                  }}
                  className="w-full mt-4 px-5 py-2 rounded-full font-medium hover:opacity-90"
                  onClick={() => {
                    navigate("/sign-in");
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
