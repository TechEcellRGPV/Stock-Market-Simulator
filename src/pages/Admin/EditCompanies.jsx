import React, { useState } from "react";

export default function EditCompanyForm() {
  // Example initial data — ideally you'd get this from props or fetch
  const [formData, setFormData] = useState({
    companyName: "Tech Solutions Inc.",
    sector: "Technology",
    stockPrice: "125.50",
    esgScore: "75",
    description:
      "A leading technology company focused on sustainable innovation and digital transformation solutions.",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit updated company data logic here
    console.log("Company updated:", formData);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "linear-gradient(135deg, #ffffff 0%, #f5f5dc 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "white",
          border: "2px solid #9EBC63",
          boxShadow: "0 8px 25px rgba(158, 188, 99, 0.3)",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "linear-gradient(to right, #618943, #82AA57)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ✏ Edit Company
        </h2>

        <form onSubmit={handleSubmit}>
          {[
            { label: "Company Name", id: "companyName", type: "text" },
            { label: "Sector", id: "sector", type: "text" },
            { label: "Stock Price", id: "stockPrice", type: "text" },
            {
              label: "ESG Score (0 - 100)",
              id: "esgScore",
              type: "number",
              min: "0",
              max: "100",
            },
          ].map((field) => (
            <div key={field.id} style={{ marginBottom: "1rem" }}>
              <label
                htmlFor={field.id}
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  marginBottom: "0.3rem",
                  background: "linear-gradient(to right, #618943, #82AA57)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 500,
                }}
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type}
                value={formData[field.id]}
                min={field.min}
                max={field.max}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "white",
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="description"
              style={{
                display: "block",
                fontSize: "0.9rem",
                marginBottom: "0.3rem",
                background: "linear-gradient(to right, #618943, #82AA57)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 500,
              }}
            >
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                resize: "none",
                backgroundColor: "white",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "linear-gradient(135deg, #618943 0%, #82AA57 100%)",
              color: "white",
              fontWeight: "600",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
