import React, { useState } from "react";

export default function CompaniesList() {
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: "BMW",
      sector: "auto",
      description: "best sports car company",
      stockPrice: "₹2222",
      esgScore: 8,
    },
    {
      id: 2,
      name: "Tech Solutions Inc.",
      sector: "Technology",
      description: "A leading technology company focused on sustainable innovation",
      stockPrice: "₹1255",
      esgScore: 75,
    },
    {
      id: 3,
      name: "Green Energy Corp",
      sector: "Energy",
      description: "Renewable energy solutions provider",
      stockPrice: "₹890",
      esgScore: 92,
    },
    {
      id: 4,
      name: "Healthcare Plus",
      sector: "Healthcare",
      description: "Advanced medical technology and services",
      stockPrice: "₹1680",
      esgScore: 68,
    },
  ]);

  // Optional: You can add functions here to modify the companies list if needed

  // Function to get ESG badge styles
  const getEsgStyles = (score) => {
    if (score >= 70) {
      return { backgroundColor: "#d1fae5", color: "#065f46" }; // green
    } else if (score >= 40) {
      return { backgroundColor: "#fef3c7", color: "#92400e" }; // yellow
    } else {
      return { backgroundColor: "#fee2e2", color: "#7f1d1d" }; // red
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #ffffff 0%, #f5f5dc 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          backgroundColor: "white",
          border: "2px solid #9EBC63",
          borderRadius: "8px",
          boxShadow: "0 8px 25px rgba(158, 188, 99, 0.3)",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            background: "linear-gradient(to right, #618943, #82AA57)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            userSelect: "none",
          }}
        >
          🏢 All Companies
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd" }}>
                {["Name", "Sector", "Description", "Stock Price (₹)", "ESG Score"].map(
                  (header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 0.5rem",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        background: "linear-gradient(to right, #618943, #82AA57)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.id}
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    transition: "background 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <td style={{ padding: "0.75rem 0.5rem", fontWeight: "500", color: "#333" }}>
                    {company.name}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#555" }}>{company.sector}</td>
                  <td
                    style={{
                      padding: "0.75rem 0.5rem",
                      color: "#555",
                      maxWidth: "200px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={company.description}
                  >
                    {company.description}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", fontWeight: "500", color: "#333" }}>
                    {company.stockPrice}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        ...getEsgStyles(company.esgScore),
                      }}
                    >
                      {company.esgScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
