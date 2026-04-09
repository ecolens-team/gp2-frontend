import { useState } from "react";
import "./UserProfile.css";

const user = {
  name: "solaf",
  username: "solaf_ahmad",
  bio: " Plant enthusiast | Field researcher | Documenting wild flora",
  followers: 1240,
  following: 5,
  observations: 94,
  initials: "SA",
};

const posts = [
  { id: 1, species: "Black Iris", confidence: 88, location: "Ajloun Forest" },
  { id: 2, species: "Wild Tulip", confidence: 92, location: "Dana Reserve" },
  { id: 3, species: "Dead Sea Iris", confidence: 79, location: "Dead Sea" },
  { id: 4, species: "Mountain Sage", confidence: 85, location: "Wadi Rum" },
  { id: 5, species: "Jordan Oak", confidence: 91, location: "Dibeen Forest" },
  { id: 6, species: "Pink Cistus", confidence: 76, location: "Azraq Wetland" },
  { id: 7, species: "Prickly Pear", confidence: 95, location: "Petra" },
  { id: 8, species: "Wild Cyclamen", confidence: 83, location: "Jerash" },
  { id: 9, species: "Desert Rose", confidence: 88, location: "Wadi Musa" },
];

const colors = [
  "#2d5016", "#1a3a0d", "#4a2575", "#1D9E75",
  "#3b2060", "#0F6E56", "#2d1b4e", "#085041", "#5c2e8a",
];

export default function UserProfile() {
  const [following, setFollowing] = useState(false);

  return (
    <div className="profile-app">
      <div className="profile-phone">

       
        <div className="profile-header">
          <button className="profile-back-btn">&#8592;</button>
          <span className="profile-header-title">{user.username}</span>
        </div>

       
        <div className="profile-info">
          <div className="profile-avatar">{user.initials}</div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{user.observations}</div>
              <div className="stat-label">Observations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.followers.toLocaleString()}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.following}</div>
              <div className="stat-label">Following</div>
            </div>
          </div>
        </div>

        <div className="profile-bio-section">
          <div className="profile-name">{user.name}</div>
          <div className="profile-bio">{user.bio}</div>
        </div>

        <div className="profile-actions">
          <button
            className={`btn-follow ${following ? "btn-following" : ""}`}
            onClick={() => setFollowing(!following)}
          >
            {following ? "Following" : "Follow"}
          </button>
          <button className="btn-message">Message</button>
        </div>

        <div className="profile-divider" />

        <div className="grid-label">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="#1D9E75"/>
            <rect x="9" y="1" width="6" height="6" rx="1" fill="#1D9E75"/>
            <rect x="1" y="9" width="6" height="6" rx="1" fill="#1D9E75"/>
            <rect x="9" y="9" width="6" height="6" rx="1" fill="#1D9E75"/>
          </svg>
          <span>Observations</span>
        </div>

        <div className="posts-grid">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="post-card"
              style={{ background: colors[i % colors.length] }}
            >
              <div className="post-badge">{post.confidence}%</div>
              <div className="post-info">
                <div className="post-species">{post.species}</div>
                <div className="post-location">📍 {post.location}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}