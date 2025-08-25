import React, { use, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styles from "./Register.module.css";
import axios from "axios";

const Meeting: React.FC = () => {
  const [searchParams] = useSearchParams();
  const webinarId = searchParams.get("webinarId") as string;
  const token = searchParams.get("jwt") as string;

  const [status, setStatus] = useState<"verifying" | "verified" | "failed">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      // Delay to simulate loading
      await new Promise((resolve) => setTimeout(resolve, 4000));
      //console.log("Verifying token:", token, "for webinarId:", webinarId);

      if (!webinarId || !token) {
        setMessage("Missing webinarId or token.");
        setStatus("failed");
        console.error("Missing webinarId or token.");
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:3333/verify-token?webinarId=${webinarId}&jwt=${token}`
        );
        setMessage(res.data.message);
      } catch (err: any) {
        setMessage(err.response?.data?.message || "Error occurred");
      }
    };

    verifyToken();
  }, [webinarId, token]);
  useEffect(() => {
    if (message.includes("Token is valid")) {
      setTimeout(() => {
        setStatus("verified");
      }, 2000);
    } else if (message) {
      setStatus("failed");
    }
  }, [message]);

  return (
    <div className={styles.container}>
      <h2>
        {status === "verifying" && "Verifying..."}
        {status === "verified" && "Verified ✅"}
        {status === "failed" && "Verification Failed ❌"}
      </h2>

      {status === "verifying" && (
        <div className={styles.loader}></div> // CSS animation
      )}

      {message && (
        <p
          className={`${styles.message} ${
            status === "verified" ? styles.success : styles.error
          }`}
        >
          {message}
        </p>
      )}
      {status === "verified" && (
        <>
          <div className={styles.joinLoader}></div>
          <div className={styles.text}>
            <p>Redirecting To The Webinar...</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Meeting;
