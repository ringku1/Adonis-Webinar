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
  const handleParticipantClick = () => {
    navigate("/participants");
  };
  const handleJoinHostClick = () => {
    navigate("/join/host");
  };
  const handleWebinarsClick = () => {
    navigate("/meetings");
  };

  return (
    <div className={styles.container}>
      <h2>Welcome to the Webinar Platform</h2>
      <h2>Dashboard</h2>
      <div className={styles.buttons}>
        <button onClick={handleCreateWebinar}>Create Webinar</button>
        <button onClick={handleRegisterClick}>Register For Webinar</button>
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
        <button onClick={handleJoinHostClick}>Join Webinar As Host</button>
        <button onClick={handleParticipantClick}>
          Participants Registered For The Webinar
        </button>
        <button onClick={handleWebinarsClick}>
          Webinars list created for conferencing
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
