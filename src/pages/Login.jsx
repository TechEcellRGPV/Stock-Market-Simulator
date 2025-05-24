import { useState } from "react";
import { FaUser, FaUserShield, FaSignInAlt } from "react-icons/fa";

// Add this to your index.html head:
// <link href="https://fonts.googleapis.com/css2?family=Lato&family=Noto+Sans&display=swap" rel="stylesheet">

const colors = {
  mediumGreen: "#82AA57",
  darkGreen: "#618943"
};

const notoSans = { fontFamily: "'Noto Sans', sans-serif" };
const lato = { fontFamily: "'Lato', sans-serif" };

export default function LoginPage() {
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    enrollmentNo: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData({
      name: "",
      email: "",
      mobileNo: "",
      enrollmentNo: "",
      password: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ backgroundColor: "#F9F7DC", ...lato }}
    >
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md">
        {/* Heading */}
        <h1
          className="text-2xl font-bold text-center mb-6"
          style={{ ...notoSans, color: colors.darkGreen }}
        >
          Login Page
        </h1>

        {/* Role Buttons */}
        <div className="flex mb-8 gap-4" style={lato}>
          <button
            onClick={() => handleRoleChange("user")}
            className="flex items-center justify-center gap-2 flex-1 py-2 rounded-full font-semibold transition-transform duration-300 hover:scale-105 text-sm sm:text-base"
            style={
              role === "user"
                ? {
                    background: linear-gradient(to right, ${colors.mediumGreen}, ${colors.darkGreen}),
                    color: "white",
                    boxShadow: 0 6px 20px -5px ${colors.darkGreen}bb,
                    ...lato
                  }
                : {
                    backgroundColor: "#e5e7eb",
                    color: "#374151",
                    ...lato
                  }
            }
          >
            <FaUser /> User
          </button>
          <button
            onClick={() => handleRoleChange("admin")}
            className="flex items-center justify-center gap-2 flex-1 py-2 rounded-full font-semibold transition-transform duration-300 hover:scale-105 text-sm sm:text-base"
            style={
              role === "admin"
                ? {
                    background: linear-gradient(to right, ${colors.mediumGreen}, ${colors.darkGreen}),
                    color: "white",
                    boxShadow: 0 6px 20px -5px ${colors.darkGreen}bb,
                    ...lato
                  }
                : {
                    backgroundColor: "#e5e7eb",
                    color: "#374151",
                    ...lato
                  }
            }
          >
            <FaUserShield /> Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-sm sm:text-base" style={lato}>
          {/* Name */}
          <div>
            <label className="block mb-2 font-semibold" style={{ color: colors.darkGreen, ...notoSans }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
              style={{ borderColor: colors.darkGreen, ...lato }}
              required
            />
          </div>

          {/* Additional Fields for User */}
          {role === "user" && (
            <>
              <div>
                <label className="block mb-2 font-semibold" style={{ color: colors.darkGreen, ...notoSans }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.darkGreen, ...lato }}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold" style={{ color: colors.darkGreen, ...notoSans }}>
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNo"
                  placeholder="Enter your mobile number"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.darkGreen, ...lato }}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold" style={{ color: colors.darkGreen, ...notoSans }}>
                  Enrollment Number
                </label>
                <input
                  type="text"
                  name="enrollmentNo"
                  placeholder="Enter your enrollment number"
                  value={formData.enrollmentNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.darkGreen, ...lato }}
                  required
                />
              </div>
            </>
          )}

          {/* Admin Password Field */}
          {role === "admin" && (
            <div>
              <label className="block mb-2 font-semibold" style={{ color: colors.darkGreen, ...notoSans }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2"
                style={{ borderColor: colors.darkGreen, ...lato }}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl text-white font-semibold transform hover:scale-105 transition duration-300"
            style={{
              background: linear-gradient(to right, ${colors.mediumGreen}, ${colors.darkGreen}),
              boxShadow: 0 6px 20px -5px ${colors.darkGreen}bb,
              ...lato
            }}
          >
            <FaSignInAlt /> Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>
      </div>
    </div>
  );
}
