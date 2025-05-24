import React, { useState } from "react";

export default function UsersList() {
  // Start with empty users array
  const [users, setUsers] = useState([]);

  // Example function to simulate adding a user
  const addUser = () => {
    const newUser = {
      id: users.length + 1,
      name: User ${users.length + 1},
      email: user${users.length + 1}@example.com,
    };
    setUsers([...users, newUser]);
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
          maxWidth: "600px",
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
          👥 All Users
        </h2>

        {users.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 1rem",
              color: "#666",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
                fontSize: "2rem",
                color: "#bbb",
              }}
            >
              ❌
            </div>
            <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              No users found.
            </p>
            <p style={{ fontSize: "0.9rem", maxWidth: "300px" }}>
              There are currently no users in the system. Users will appear here
              once they are added.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #9EBC63" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    color: "#618943",
                    fontWeight: "bold",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    color: "#618943",
                    fontWeight: "bold",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "0.75rem",
                    color: "#618943",
                    fontWeight: "bold",
                  }}
                >
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid #ddd",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <td style={{ padding: "0.75rem" }}>{user.id}</td>
                  <td style={{ padding: "0.75rem" }}>{user.name}</td>
                  <td style={{ padding: "0.75rem" }}>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={addUser}
          style={{
            marginTop: "1.5rem",
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
          Add User
        </button>
      </div>
    </div>
  );
}
