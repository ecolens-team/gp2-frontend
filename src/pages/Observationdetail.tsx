import { useState } from "react";
import "./ObservationDetail.css";

const comments = [
  {
    id: 1,
    user: "researcher_02",
    time: "2 days ago",
    text: "woow",
    initials: "r",
  },
  {
    id: 2,
    user: "user2",
    time: "1 days ago",
    text: "beautiful",
    initials: "u",
  },
 
];

export default function ObservationDetail() {
  const [newComment, setNewComment] = useState("");
  const [verified, setVerified] = useState(false);

  return (
    <div className="app">
      <div className="phone">

        
        <div className="header">
          <button className="back-btn">&#8592;</button>
          <span className="header-title">Observation Detail</span>
        </div>

        <div className="hero">
          <span className="hero-icon">🌸</span>
        </div>

        <div className="card info-card">
          <div className="species-label">Species Name</div>
          <div className="species-row">
            <div className="species-name">Species Name (Scientific name)</div>
            <div className="confidence-badge">rate</div>
          </div>

          
    
      
           <div className="map-container">
            <div className="map-label">31.9522°N, 35.9239°E</div>
            <div id="map" className="map-box"></div>
         </div>

          <div className="description-box">
            description... Add optional notes about the observation (habitat, appearance, behavior)
          </div>
        </div>

        
        <div className="section researcher-section">
          <div className="section-title">ℹ RESEARCHER TOOLS</div>

          <div className="validation-box">
            <div className="validation-header">[ VALIDATION BOX ]</div>
            <div className="status-row">
              <span className="status-label">Current Status:</span>
              <span className="status-badge">PENDING REVIEW</span>
            </div>
            <div className="meta-grid">
              <div>
                <div className="meta-label">Submitted By:</div>
                <div className="meta-value">user_name_01</div>
              </div>
              <div>
                <div className="meta-label">Date Submitted:</div>
                <div className="meta-value">Dec 19, 2025</div>
              </div>
              <div>
                <div className="meta-label">Verifications:</div>
                <div className="meta-value">3 / 5 required</div>
              </div>
              <div>
                <div className="meta-label">Location Type:</div>
                <div className="meta-value">Wild</div>
              </div>
            </div>
          </div>

          <div className="action-row">
            <button
              className={`btn btn-verify ${verified ? "btn-verified" : ""}`}
              onClick={() => setVerified(true)}
            >
              ✓ {verified ? "Verified!" : "Verify as Correct"}
            </button>
            <button className="btn btn-suggest">
               Suggest Change
            </button>
          </div>
        </div>

        <div className="card comments-section">
          <div className="comments-title">
            Comments
            <span className="comment-count">3</span>
          </div>

          {comments.map((c) => (
            <div key={c.id} 
            className={`comment ${c.isLast ? "comment-last" : ""}`}>
              
              <div className="avatar">{c.initials}</div>
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-user">{c.user}</span>
                  <span className="comment-time">{c.time}</span>
                </div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          ))}

          <input
            className="comment-input"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>

      </div>
    </div>
  );
} 