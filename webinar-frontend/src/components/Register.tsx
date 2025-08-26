import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./Register.module.css";

const Register: React.FC = () => {
  const { webinarId } = useParams<{ webinarId?: string }>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [joinUrl, setJoinUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webinarId) {
      setMessage("Webinar ID not found in URL");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3333/webinar/${webinarId}/register_participant`,
        { name: name, email: email }
      );
      setMessage(res.data.message);
      if (res.data.joinUrl) {
        setJoinUrl(res.data.joinUrl);
      }
      setName("");
      setEmail("");
    } catch (err: any) {
      setMessage(err.response?.data?.message[0]?.message || "Error occurred");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinUrl);
    alert("Join link copied to clipboard!");
  };

  return (
    <div className={styles.container}>
      <h2>Register for Webinar</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {message && (
        <p
          className={`${styles.message} ${
            message.includes("success") ? styles.success : styles.error
          }`}
        >
          {message}
        </p>
      )}

      {joinUrl && (
        <div className={styles.joinBox}>
          <p>
            Join the webinar:{" "}
            <a href={joinUrl} target="_blank" rel="noopener noreferrer">
              {joinUrl}
            </a>
          </p>
          <button onClick={copyToClipboard} className={styles.copyButton}>
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
