import React, { useState } from "react";
import "./login.css";

type Role = "member" | "leader" | null;

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedRole) {
      alert("Please select your role");
      return;
    }

    // Mock authentication - store role & username
    localStorage.setItem("userRole", selectedRole);
    localStorage.setItem("username", username);

    // Redirect to SHG selection (disabled for demo)
    alert('Login successful!');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">◆</div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Select your role to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="role-select">
            <div
              className={`role-option ${
                selectedRole === "member" ? "selected" : ""
              }`}
              onClick={() => handleRoleClick("member")}
            >
              <div className="role-icon">👤</div>
              <div className="role-name">Member</div>
            </div>
            <div
              className={`role-option ${
                selectedRole === "leader" ? "selected" : ""
              }`}
              onClick={() => handleRoleClick("leader")}
            >
              <div className="role-icon">⭐</div>
              <div className="role-name">SHG Leader</div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Login
          </button>

          <div className="text-center">
            <a href="/" className="back-link">
              ← Back to Home
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
