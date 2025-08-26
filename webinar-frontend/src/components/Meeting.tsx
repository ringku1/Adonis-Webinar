import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Register.module.css";
import axios from "axios";

const Meeting: React.FC = () => {
  const [searchParams] = useSearchParams();
  const webinarId = searchParams.get("webinarId") as string;
  const token = searchParams.get("jwt") as string;
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<"verifying" | "verified" | "failed">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  // Token verification with timeout
  useEffect(() => {
    const verifyToken = async () => {
      // Initial delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!webinarId || !token) {
        setMessage("Missing webinarId or token.");
        setStatus("failed");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3333/verify-token?webinarId=${webinarId}&jwt=${token}`
        );

        // Small delay before showing success message
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setMessage(res.data.message);

        if (res.data.message.includes("Token is valid")) {
          // Delay before marking as verified
          setTimeout(() => {
            setStatus("verified");
          }, 2000);
        }
      } catch (err: any) {
        // Delay before showing error
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setMessage(err.response?.data?.message || "Error occurred");
        setStatus("failed");
      }
    };
    verifyToken();
  }, [webinarId, token]);

  // Fetch meeting details only after verification with timeout
  useEffect(() => {
    if (status !== "verified") return;

    const fetchMeetingDetails = async () => {
      try {
        // Delay before fetching meeting details
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const res = await axios.get(
          `http://localhost:3333/meeting/${webinarId}`
        );
        const meetingStartTime = new Date(res.data.webinar.startTime);
        setStartTime(meetingStartTime);

        // Check if meeting has already started
        const now = new Date();
        if (meetingStartTime <= now) {
          // Delay before setting started state
          setTimeout(() => {
            setStarted(true);
          }, 1000);
        }
      } catch (err: any) {
        setMessage(
          err.response?.data?.message || "Error fetching meeting details"
        );
      }
    };

    fetchMeetingDetails();
  }, [status, webinarId]);

  return (
    <div className={styles.container}>
      <h2>
        {status === "verifying" && "Verifying..."}
        {status === "verified" && "Verified ✅"}
        {status === "failed" && "Verification Failed ❌"}
      </h2>

      {status === "verifying" && <div className={styles.loader}></div>}

      {message && (
        <p
          className={`${styles.message} ${
            status === "verified" ? styles.success : styles.error
          }`}
        >
          {message}
        </p>
      )}

      {status === "verified" && startTime && !started && (
        <div className={styles.countdownTimer}>
          <h3>Webinar starts at:</h3>
          <div className={styles.timerDisplay}>
            {startTime.toLocaleString()}
          </div>
        </div>
      )}

      {status === "verified" && started && (
        <div className={styles.meetingStarted}>
          <div className={styles.joinLoader}></div>
          <h3>Webinar has started!</h3>
          <h4>Redirecting to the Webinar...</h4>
        </div>
      )}
    </div>
  );
};

export default Meeting;
