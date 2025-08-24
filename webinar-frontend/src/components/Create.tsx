import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./Register.module.css";

const Create: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [agenda, setAgenda] = useState("");
  const [startTime, setStartTime] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  const [message, setMessage] = useState("");
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:3333/webinar/create`, {
        topic: topic,
        agenda: agenda,
        start_time: startTime,
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
            onChange={(e) => {
              const selectedTime = new Date(e.target.value).getTime();
              const minAllowedTime = Date.now() + 60 * 1000; // 1 minute ahead
              setStartTime(e.target.value);
              console.log(startTime);
            }}
            required
            min={local}
          />
        </div>

        <button type="submit">Create</button>
      </form>

      {message && <p className={styles.message}>{message}</p>}

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
