import React, { useEffect, useState } from "react";
import styles from "./Participants.module.css";
import axios from "axios";

const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<
    Array<{
      id: number;
      webinarId: number;
      name: string;
      email: string;
      token: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  useEffect(() => {
    const getAllParticipants = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3333/webinars/participants`
        );

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

  const handleLinkClick = (id: number, token: string) => {
    const fullLink = `http://localhost:3000/webinars/verify-token?webinarId=${id}&jwt=${token}`;
    setSelectedLink(fullLink);
  };

  const closeLinkPopup = () => {
    setSelectedLink(null);
  };

  const copyLinkToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    alert("Join Link copied to clipboard!");
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
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Join Link</th>
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
                      <div className={styles.nameCell}>
                        <span className={styles.name}>{participant.name}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.email}>{participant.email}</span>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={styles.linkPreview}
                        onClick={() =>
                          participant.token &&
                          handleLinkClick(
                            participant.webinarId,
                            participant.token
                          )
                        }
                        style={{
                          cursor: participant.token ? "pointer" : "default",
                        }}
                      >
                        {participant.token
                          ? `🔗 Click to view join link`
                          : "No Join Link"}
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

      {/* Link Popup Modal */}
      {selectedLink && (
        <div className={styles.modalOverlay} onClick={closeLinkPopup}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Full Join Link</h3>
              <button className={styles.closeButton} onClick={closeLinkPopup}>
                ×
              </button>
            </div>
            <div className={styles.linkContainer}>
              <pre className={styles.fullLink}>{selectedLink}</pre>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.copyButton}
                onClick={() => copyLinkToClipboard(selectedLink)}
              >
                📋 Copy Link
              </button>
              <button
                className={styles.closeActionButton}
                onClick={closeLinkPopup}
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
