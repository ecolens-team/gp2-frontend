import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";import "./UserProfile.css";
import { getObservationsByUser } from "../services/observationsService";
import type { IObservation } from "../interfaces/observations";

const API_BASE = "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("access");
}

interface User {
  name: string;
  username: string;
  bio: string;
  followers_count: number;
  following_count: number;
  observations_count: number;
  is_following: boolean;
  profile_picture: string | null;
}

interface Post {
  id: number;
  species: string | { name: string };
  confidence: number;
  location: string;
}

const colors = [
  "#2d5016", "#1a3a0d", "#4a2575", "#1D9E75",
  "#3b2060", "#0F6E56", "#2d1b4e", "#085041", "#5c2e8a",
];

export default function UserProfile({ username = "solaf_ahmad" }: { username?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE}/users/${username}/`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser(data);
        setFollowing(data.is_following);
      } catch (err: any) {
        setError(err.message);
      }finally {
    setLoading(false);
  }
    }


    fetchProfile();
  }, [username]);

  async function handleFollow() {
    try {
      const res = await fetch(`${API_BASE}/users/${username}/follow/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFollowing(data.following);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              followers_count: data.following
                ? prev.followers_count + 1
                : prev.followers_count - 1,
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  }
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [minConfidence, setMinConfidence] = useState(0);
  const [sortByConfidence, setSortByConfidence] = useState(false);

   const { data: posts = [], isLoading: postsLoading } = useQuery<IObservation[]>({
  queryKey: ["userObservations", username, speciesFilter, minConfidence, sortByConfidence],
  queryFn: () =>
    getObservationsByUser(username, {
      species: speciesFilter || undefined,
      min_confidence: minConfidence || undefined,
      ordering: sortByConfidence ? "-confidence_level" : undefined,
    }),
});

  if (loading) return <div className="profile-app">Loading...</div>;
  if (error) return <div className="profile-app">Error: {error}</div>;
  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="profile-app">
      <div className="profile-phone">

        <div className="profile-header">
          <button className="profile-back-btn">&#8592;</button>
          <span className="profile-header-title">{user.username}</span>
        </div>

        <div className="profile-info">
          <div className="profile-avatar">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="avatar"
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{user.observations_count}</div>
              <div className="stat-label">Observations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.followers_count?.toLocaleString()}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.following_count}</div>
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
            onClick={handleFollow}
          >
            {following ? "Following" : "Follow"}
          </button>
          <button className="btn-message">Message</button>
        </div>

        <div className="profile-divider" />
        <div className="filters-section">
  <input
    type="text"
    placeholder="Filter by species..."
    value={speciesFilter}
    onChange={(e) => setSpeciesFilter(e.target.value)}
    className="filter-input"
  />
  <div className="filter-confidence">
    <label>Min confidence: {minConfidence}%</label>
    <input
      type="range"
      min={0}
      max={100}
      value={minConfidence}
      onChange={(e) => setMinConfidence(Number(e.target.value))}
      className="filter-range"
      title="Minimum confidence"
    />
  </div>
  <button
    className={`filter-sort-btn ${sortByConfidence ? "active" : ""}`}
    onClick={() => setSortByConfidence(!sortByConfidence)}
  >
    {sortByConfidence ? "↓ Confidence" : "Sort by Confidence"}
  </button>
</div>

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
            {(posts as IObservation[]).map((post, i) => (

            <div
              key={post.id}
              className="post-card"
              style={{ background: colors[i % colors.length] }}
            >
           <div className="post-badge">
             {post.confidenceLevel != null
                   ? `${(post.confidenceLevel * 100).toFixed(0)}%`
                  : "N/A"}
                  </div>
              <div className="post-info">
                <div className="post-species">
                {post.speciesName}
                </div>
                <div className="post-location">📍 {post.location}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}