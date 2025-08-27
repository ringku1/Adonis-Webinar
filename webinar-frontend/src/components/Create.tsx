import React, { useState } from "react";
import axios from "axios";
import styles from "./Register.module.css";

const Create: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [agenda, setAgenda] = useState("");
  const [startTime, setStartTime] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  const [message, setMessage] = useState("");

  // User timezone information
  const userTimezone = {
    offsetMinutes: new Date().getTimezoneOffset(),
  };

  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert local datetime-local input to UTC string for MySQL DATETIME
      const localDate = new Date(startTime);
      const utcDateTime =
        localDate.getUTCFullYear() +
        "-" +
        String(localDate.getUTCMonth() + 1).padStart(2, "0") +
        "-" +
        String(localDate.getUTCDate()).padStart(2, "0") +
        " " +
        String(localDate.getUTCHours()).padStart(2, "0") +
        ":" +
        String(localDate.getUTCMinutes()).padStart(2, "0") +
        ":" +
        String(localDate.getUTCSeconds()).padStart(2, "0");

      const res = await axios.post("http://localhost:3333/webinar/create", {
        topic,
        agenda,
        start_time: utcDateTime,
        timezone_offset: userTimezone.offsetMinutes,
      });
      setMessage(res.data.message);
      if (res.data.joinUrl) {
        setJoinUrl(res.data.joinUrl);
      }
      setTopic("");
      setAgenda("");
      setStartTime("");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error occurred");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinUrl);
    alert("Join link copied to clipboard!");
  };

  return (
    <div className={styles.container}>
      <h2>Create Webinar</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Agenda</label>
          <input
            type="list"
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            min={local}
          />
        </div>

        <button type="submit">Create</button>
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

export default Create;
