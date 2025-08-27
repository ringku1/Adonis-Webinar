import React, { useEffect, useState } from "react";
import styles from "./Participants.module.css";
import axios from "axios";

const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<
    Array<{
      id: number;
      webinarId: number;
      cloudflareParticipantId: string;
      name: string;
      email: string;
      token: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  useEffect(() => {
    const getAllParticipants = async () => {
      try {
        const res = await axios.get(`http://localhost:3333/participants`);

        if (res.data.message.includes("Participants fetched successfully")) {
          setParticipants(res.data.participants);
        }
      } catch (err: any) {
        console.error("Error fetching participants:", err);
      } finally {
        setLoading(false);
      }
    };

    getAllParticipants();
  }, []);

  const handleTokenClick = (token: string) => {
    setSelectedToken(token);
  };

  const closeTokenPopup = () => {
    setSelectedToken(null);
  };

  const copyTokenToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    alert("Token copied to clipboard!");
  };

  return (
    <>
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.title}>Registered Participants</h2>
          <div className={styles.controls}>
            <span className={styles.countBadge}>
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Webinar ID</th>
                <th className={styles.th}>CF Participant ID</th>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Token Preview</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingState}>
                    <div className={styles.loading}>
                      <div className={styles.spinner}></div>
                      <p>Loading participants...</p>
                    </div>
                  </td>
                </tr>
              ) : participants.length > 0 ? (
                participants.map((participant, index) => (
                  <tr
                    key={participant.id}
                    className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                  >
                    <td className={styles.td}>
                      <span className={styles.idCell}>#{participant.id}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.webinarId}>
                        Webinar {participant.webinarId}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.cfId}>
                        {participant.cloudflareParticipantId || "Not assigned"}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.nameCell}>
                        <span className={styles.name}>{participant.name}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.email}>{participant.email}</span>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={styles.tokenPreview}
                        onClick={() =>
                          participant.token &&
                          handleTokenClick(participant.token)
                        }
                        style={{
                          cursor: participant.token ? "pointer" : "default",
                        }}
                      >
                        {participant.token
                          ? `${participant.token.substring(0, 20)}...`
                          : "No token"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.noData}>
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>👥</span>
                      <p>No participants registered yet</p>
                      <small>
                        Participants will appear here once they register for
                        webinars
                      </small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Token Popup Modal */}
      {selectedToken && (
        <div className={styles.modalOverlay} onClick={closeTokenPopup}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Full Token</h3>
              <button className={styles.closeButton} onClick={closeTokenPopup}>
                ×
              </button>
            </div>
            <div className={styles.tokenContainer}>
              <pre className={styles.fullToken}>{selectedToken}</pre>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.copyButton}
                onClick={() => copyTokenToClipboard(selectedToken)}
              >
                📋 Copy Token
              </button>
              <button
                className={styles.closeActionButton}
                onClick={closeTokenPopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Participants;
