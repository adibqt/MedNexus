const Partners = () => {
  const partners = [
    { name: "Medical Award", image: "/novena/images/about/1.png" },
    { name: "Health Award", image: "/novena/images/about/2.png" },
    { name: "Authentic Care", image: "/novena/images/about/3.png" },
    { name: "Retrodesign Labs", image: "/novena/images/about/4.png" },
    { name: "Health Partners Inc", image: "/novena/images/about/5.png" },
    { name: "Medical Solutions", image: "/novena/images/about/6.png" },
  ];

  return (
    <section
      id="partners"
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        backgroundColor: "#fff",
      }}
    >
      <div className="container mx-auto px-4">
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#003d82",
              marginBottom: "20px",
            }}
          >
            Partners who support us
          </h2>
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#10b981",
              margin: "20px auto",
            }}
          ></div>
          <p
            style={{
              color: "#666",
              fontSize: "16px",
              lineHeight: "1.6",
              maxWidth: "600px",
              margin: "20px auto",
            }}
          >
            Trusted by leading hospitals and health networks who rely on
            MedNexus for secure scheduling, telehealth, and patient engagement.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "40px",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {partners.map((partner, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100px",
                backgroundColor: "rgba(16, 185, 129, 0.05)",
                borderRadius: "8px",
                border: "2px solid #10b981",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(16, 185, 129, 0.15)";
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ textAlign: "center" }}>
                <img
                  src={partner.image}
                  alt={partner.name}
                  style={{
                    maxWidth: "80px",
                    maxHeight: "80px",
                    objectFit: "contain",
                    marginBottom: "10px",
                    display: "block",
                    margin: "0 auto 10px",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#003d82",
                    lineHeight: "1.4",
                  }}
                >
                  {partner.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
