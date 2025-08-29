import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Register.module.css";
import axios from "axios";
import {
  RealtimeKitProvider,
  useRealtimeKitClient,
} from "@cloudflare/realtimekit-react";
import { defaultConfig, RtkMeeting } from "@cloudflare/realtimekit-react-ui";

const Meeting: React.FC = () => {
  const [meeting, initMeeting] = useRealtimeKitClient();

  const [searchParams] = useSearchParams();
  const webinarId = searchParams.get("webinarId") as string;
  const token = searchParams.get("jwt") as string;
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [started, setStarted] = useState(false);

  // Debug: Log started state changes
  useEffect(() => {
    console.log("🚀 Started state changed to:", started);
  }, [started]);
  const [status, setStatus] = useState<"verifying" | "verified" | "failed">(
    "verifying"
  );
  const [message, setMessage] = useState("");
  const [meetingInitialized, setMeetingInitialized] = useState(false);
  const [participant, setParticipant] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string>("");
  const [joined, setJoined] = useState(false);

  function stopScreenShare() {
    if (!meeting) return;
    meeting.self.disableScreenShare();
  }

  // Get auth token from backend API
  const getAuthTokenFromBackend = async (webinarData: any) => {
    try {
      if (!participant || authToken) return; // Don't call again if we already have token

      setMessage("Joining meeting...");

      // Call backend API to get Cloudflare meeting credentials
      const joinResponse = await axios.post(
        `http://localhost:3333/webinars/${webinarId}/join`,
        {
          name: participant.name,
          email: participant.email,
        }
      );

      if (joinResponse.data.status === "joined") {
        const { meeting_data } = joinResponse.data;

        console.log("Meeting data received:", meeting_data);

        // Extract and store auth token (following the working pattern)
        const token =
          meeting_data.token ||
          meeting_data.authToken ||
          meeting_data.sessionToken;

        if (token) {
          setAuthToken(token);
          console.log("Auth token received and stored");
          setMessage("Connecting to meeting...");
        } else {
          throw new Error("No auth token received from backend");
        }
      } else {
        throw new Error(joinResponse.data.message || "Failed to join meeting");
      }
    } catch (error: any) {
      console.error("Failed to get auth token:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to join meeting. Please try again.";
      setMessage(errorMessage);
    }
  };

  // Initialize RTK Meeting when auth token is available (following working pattern)
  useEffect(() => {
    async function initializeMeeting() {
      console.log("🔄 Attempting RTK initialization:", {
        authToken: !!authToken,
        joined,
        participant: !!participant,
      });

      if (!authToken || joined || !participant) {
        console.log(
          "⛔ Skipping init. Missing prerequisites or already joined."
        );
        return;
      }

      setMessage("Initializing meeting...");

      try {
        await initMeeting({
          authToken,
          defaults: {
            audio: false,
            video: false,
          },
        });

        console.log("✅ Meeting initialized successfully");
        setJoined(true);
        setMeetingInitialized(true);
        setMessage("Successfully joined the meeting!");
      } catch (err) {
        console.error("❌ Error initializing meeting:", err);
        setMessage("Failed to initialize meeting. Please try again.");
      }
    }

    initializeMeeting();
  }, [authToken, joined, initMeeting, participant]);

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
          `http://localhost:3333/webinars/verify-token?webinarId=${webinarId}&jwt=${token}`
        );

        // Small delay before showing success message
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setMessage(res.data.message);

        if (res.data.message.includes("Token is valid")) {
          // Store participant data
          setParticipant(res.data.participant);
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
          `http://localhost:3333/webinars/meeting/${webinarId}`
        );

        console.log("Meeting details response:", res.data.webinar);

        // Handle different start_time formats from backend
        let meetingStartTime: Date;
        const startTimeData = res.data.webinar.startTime;

        if (typeof startTimeData === "string") {
          meetingStartTime = new Date(startTimeData);
        } else if (startTimeData && typeof startTimeData === "object") {
          // Handle Luxon DateTime object
          if (startTimeData.toISO) {
            meetingStartTime = new Date(startTimeData.toISO());
          } else if (startTimeData.toJSDate) {
            meetingStartTime = startTimeData.toJSDate();
          } else {
            // Try to convert object to string first
            meetingStartTime = new Date(String(startTimeData));
          }
        } else {
          meetingStartTime = new Date(startTimeData);
        }

        console.log("Parsed meeting start time:", meetingStartTime);

        // Validate the parsed date
        if (isNaN(meetingStartTime.getTime())) {
          console.error("Invalid date parsed from start_time:", startTimeData);
          console.error("Raw start_time type:", typeof startTimeData);
          console.error("Raw start_time value:", startTimeData);

          // Instead of assuming meeting started, show an error
          setMessage(
            "Error: Unable to determine meeting start time. Please contact support."
          );
          setStatus("failed");
          return;
        }

        setStartTime(meetingStartTime);

        // Initial check if meeting has already started
        const now = new Date();
        console.log("🕐 Initial time comparison:", {
          meetingStartTime: meetingStartTime.toISOString(),
          currentTime: now.toISOString(),
          hasStarted: meetingStartTime <= now,
        });

        // Set initial started state based on current time
        setStarted(meetingStartTime <= now);
      } catch (err: any) {
        setMessage(
          err.response?.data?.message || "Error fetching meeting details"
        );
      }
    };

    fetchMeetingDetails();
  }, [status, webinarId]);

  // Real-time timer to check if meeting has started (runs every 10 seconds)
  useEffect(() => {
    if (!startTime || started) return;

    const checkMeetingStart = () => {
      const now = new Date();
      console.log("🔄 Timer check - Meeting start status:", {
        meetingStartTime: startTime.toISOString(),
        currentTime: now.toISOString(),
        hasStarted: startTime <= now,
        currentStartedState: started,
      });

      if (startTime <= now && !started) {
        console.log("✅ Timer detected meeting has started!");
        setStarted(true);
      }
    };

    // Check immediately
    checkMeetingStart();

    // Then check every 10 seconds
    const intervalId = setInterval(checkMeetingStart, 10000);

    return () => clearInterval(intervalId);
  }, [startTime, started]);

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
          {!meetingInitialized && !meeting ? (
            <>
              <h3>🎉 Webinar has started!</h3>
              <p>You can now join the meeting.</p>
              <button
                className={styles.joinButton}
                onClick={() =>
                  getAuthTokenFromBackend({ cf_meeting_id: webinarId })
                }
                disabled={message.includes("Joining meeting...") || !!authToken}
              >
                {message.includes("Joining meeting...") ? (
                  <>
                    <div className={styles.buttonLoader}></div>
                    Joining...
                  </>
                ) : (
                  "Join Meeting"
                )}
              </button>
            </>
          ) : meetingInitialized && meeting ? (
            <div className={styles.meetingContainer}>
              <h3>Welcome to the Webinar!</h3>
              <RealtimeKitProvider value={meeting}>
                <RtkMeeting
                  meeting={meeting}
                  config={defaultConfig}
                  showSetupScreen={false}
                />
              </RealtimeKitProvider>
            </div>
          ) : (
            <div>
              <div className={styles.joinLoader}></div>
              <p>Connecting to meeting...</p>
              {message.includes("Failed") && (
                <button
                  className={styles.retryButton}
                  onClick={() =>
                    getAuthTokenFromBackend({ cf_meeting_id: webinarId })
                  }
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {status === "failed" && (
        <div>
          <button
            onClick={() => (window.location.href = `/register/${webinarId}`)}
          >
            Go Back to Registration Page
          </button>
        </div>
      )}
    </div>
  );
};

export default Meeting;
