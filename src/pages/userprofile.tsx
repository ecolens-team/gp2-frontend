import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import "./UserProfile.css";

import { getObservationsByUser } from "../services/observationsService";
import type { IObservation } from "../interfaces/observations";
import { usePageLayout } from "../contexts/UIContext";
import { Loader2 } from "lucide-react";
import { api } from "../lib/axiosConfig";


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

const colors = [
  "#2d5016", "#1a3a0d", "#4a2575", "#1D9E75",
  "#3b2060", "#0F6E56", "#2d1b4e", "#085041", "#5c2e8a",
];

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageLayout({ mobileTitleBar: { title: username || 'user profile', fallbackPath: '/' }, hideBottomNav: true });

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const { data } = await api.get(`/users/${username}/`);
        setUser(data);
        setFollowing(data.is_following);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  async function handleFollow() {
    try {
      const { data } = await api.post(`/users/${username}/follow/`);
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
  const [sortByConfidence, setSortByConfidence] = useState(false);

  const { data: posts = [] } = useQuery<IObservation[]>({
    queryKey: ["userObservations", username, speciesFilter, sortByConfidence],
    queryFn: () =>
      getObservationsByUser(username!, {
        species: speciesFilter || undefined,

        ordering: sortByConfidence ? "-confidence_level" : undefined,
      }),
    enabled: !!username,
  });

  if (loading) return (
    <div className="profile-app flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-teal-500" />
    </div>
  );
  if (error) return (
    <div className="profile-app flex items-center justify-center min-h-screen text-gray-400 font-medium">
      Could not load profile
    </div>
  );
  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="profile-app">
      <div className="profile-phone">

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
          <button
            className={`filter-sort-btn ${sortByConfidence ? "active" : ""}`}
            onClick={() => setSortByConfidence(!sortByConfidence)}
          >
            {sortByConfidence ? "↓ Confidence" : "Sort by Confidence"}
          </button>
        </div>

        <div className="grid-label">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="#1D9E75" />
            <rect x="9" y="1" width="6" height="6" rx="1" fill="#1D9E75" />
            <rect x="1" y="9" width="6" height="6" rx="1" fill="#1D9E75" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="#1D9E75" />
          </svg>
          <span>Observations</span>
        </div>

        <div className="posts-grid">
          {(posts as IObservation[]).map((post, i) => (

            <div
              key={post.id}
              className="post-card"
              onClick={() => navigate(`/observations/${post.id}`)}
              style={{ background: !post.image?.image ? colors[i % colors.length] : 'transparent' }}

            >
              {post.image?.image && (
                <img src={post.image.thumbnail ?? post.image.image} alt={post.speciesName} className="post-img-full" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
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
