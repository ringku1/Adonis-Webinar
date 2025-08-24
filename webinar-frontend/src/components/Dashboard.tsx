// src/components/Dashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showRegisterInput, setShowRegisterInput] = useState(false);
  const [webinarId, setWebinarId] = useState("");

  const handleCreateWebinar = () => {
    navigate("/create");
  };

  const handleRegisterClick = () => {
    setShowRegisterInput(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (webinarId.trim() === "") {
      alert("Please enter a webinar ID");
      return;
    }
    navigate(`/register/${webinarId}`);
  };

  return (
    <div className={styles.container}>
      <h2>Dashboard</h2>
      <div className={styles.buttons}>
        <button onClick={handleCreateWebinar}>Create Webinar</button>
        <button onClick={handleRegisterClick}>Register for Webinar</button>
      </div>

      {showRegisterInput && (
        <form className={styles.registerForm} onSubmit={handleRegisterSubmit}>
          <label>Enter Webinar ID</label>
          <input
            type="text"
            value={webinarId}
            onChange={(e) => setWebinarId(e.target.value)}
            placeholder="Webinar ID"
            required
          />
          <button type="submit">Go to Register</button>
        </form>
      )}
    </div>
  );
};

export default Dashboard;
