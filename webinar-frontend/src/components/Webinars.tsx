import React, { useEffect, useState } from "react";
import styles from "./Participants.module.css";
import axios from "axios";

const Webinars: React.FC = () => {
  const [webinars, setWebinars] = useState<
    Array<{
      id: number;
      topic: string;
      agenda: string;
      startTime: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  useEffect(() => {
    const getAllWebinars = async () => {
      try {
        const res = await axios.get(`http://localhost:3333/webinars/meetings`);

        if (res.data.message.includes("Webinars fetched successfully")) {
          setWebinars(res.data.webinars);
        }
      } catch (err: any) {
        console.error("Error fetching participants:", err);
      } finally {
        setLoading(false);
      }
    };

    getAllWebinars();
  }, []);

  const handleLinkClick = (id: number) => {
    const fullLink = `http://localhost:3000/webinars/?webinarId=${id}/register_participant`;
    setSelectedLink(fullLink);
  };

  const closeLinkPopup = () => {
    setSelectedLink(null);
  };

  const copyLinkToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    alert("Join Link copied to clipboard!");
  };
  const handleStartTime = (time: string) => {
    const datePart = time.slice(0, 10); // "2025-10-30"
    const timePart = time.slice(11, 19); // "10:50:23"
    return `${datePart} ${timePart} UTC`;
  };

  return (
    <>
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.title}>Created Webinars</h2>
          <div className={styles.controls}>
            <span className={styles.countBadge}>
              {webinars.length} webinar
              {webinars.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Topic</th>
                <th className={styles.th}>Agenda</th>
                <th className={styles.th}>Start Time</th>
                <th className={styles.th}>Registration Link</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingState}>
                    <div className={styles.loading}>
                      <div className={styles.spinner}></div>
                      <p>Loading webinars...</p>
                    </div>
                  </td>
                </tr>
              ) : webinars.length > 0 ? (
                webinars.map((webinar, index) => (
                  <tr
                    key={webinar.id}
                    className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                  >
                    <td className={styles.td}>
                      <span className={styles.idCell}>#{webinar.id}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.name}>{webinar.topic}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.name}>{webinar.agenda}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.name}>
                        {handleStartTime(webinar.startTime)}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={styles.linkPreview}
                        onClick={() => handleLinkClick(webinar.id)}
                      >
                        {webinar.id
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
                      <p>No webinars created yet</p>
                      <small>
                        Webinars list will appear here once they are created
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
              <h3>Full Regestration Link</h3>
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

export default Webinars;
