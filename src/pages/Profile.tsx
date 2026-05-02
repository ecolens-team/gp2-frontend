import { useState, useEffect , useRef} from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext/AuthContext";
import { getObservationsByUser } from "../services/observationsService";
import { api } from "../lib/axiosConfig";
import type { IObservation } from "../interfaces/observations";
import "./UserProfile.css";
import { usePageLayout } from "../contexts/UIContext";
import { Loader2 } from "lucide-react";
const colors = [
  "#2d5016", "#1a3a0d", "#4a2575", "#1D9E75",
  "#3b2060", "#0F6E56", "#2d1b4e", "#085041", "#5c2e8a",
];

export default function Profile() {
  const { authUser, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [sortByConfidence, setSortByConfidence] = useState(false);

  usePageLayout({ mobileTitleBar: { title: authUser?.username || 'user profile', fallbackPath: '/' }, hideBottomNav: true });

  useEffect(() => {
    if (authUser) {
      setName(`${authUser.first_name} ${authUser.last_name}`.trim());
      setBio(authUser.bio || "");
      setPhone(authUser.phone_number || "");
    }
  }, [authUser]);

  const { data: posts = [] } = useQuery<IObservation[]>({
    queryKey: ["userObservations", authUser?.username, speciesFilter, sortByConfidence],
    queryFn: () =>
      getObservationsByUser(authUser!.username, {
        species: speciesFilter || undefined,
        ordering: sortByConfidence ? "-confidence_level" : undefined,
      }),
    enabled: !!authUser?.username,
  });

  async function saveField(field: string, value: string) {
    try {
      await api.patch("/auth/user/", { [field]: value });
    } catch (err) {
      console.error(err);
    }
  }
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploadingPhoto(true);
  try {
    const formData = new FormData();
    formData.append("profile_picture", file);
    await api.patch("/auth/user/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    window.location.reload();
  } catch (err) {
    console.error(err);
  } finally {
    setUploadingPhoto(false);
  }
}

  if (loading) return (
    <div className="profile-app flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-teal-500" />
    </div>
  );
  if (!authUser) return null;

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="profile-app">
      <div className="profile-phone">

        <div className="profile-info">
         <div className="profile-avatar" style={{ cursor: "pointer", position: "relative" }}
               onClick={() => fileInputRef.current?.click()}>
                {authUser.profile_picture ? (
                     <img src={authUser.profile_picture} alt="avatar"
                 style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (initials)}
                    <div style={{
                  position: "absolute", bottom: 0, right: 0,
                   background: "#00B4A6", borderRadius: "50%",
                  width: 24, height: 24, display: "flex",
                   alignItems: "center", justifyContent: "center"
                  }}>
                            <span style={{ color: "white", fontSize: 14 }}>+</span>
                  </div>
                  <input
                  title="Minimum confidence"
                    ref={fileInputRef}
                  type="file"
                     accept="image/*"
                        style={{ display: "none" }}
                           onChange={handlePhotoUpload}
                         />
                       </div>
                    {uploadingPhoto && <p style={{ fontSize: 11, color: "#00B4A6", textAlign: "center" }}>Uploading...</p>}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{posts.length}</div>
              <div className="stat-label">Observations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Following</div>
            </div>
          </div>
        </div>

        <div className="profile-bio-section">
          {editingName ? (
            <div className="flex gap-2 mb-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="filter-input flex-1"
              />
              <button className="filter-sort-btn active" onClick={async () => {
                const [first, ...rest] = name.split(" ");
                await saveField("first_name", first);
                await saveField("last_name", rest.join(" "));
                setEditingName(false);
              }}>Save</button>
              <button className="filter-sort-btn" onClick={() => setEditingName(false)}>✕</button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-1">
              <div className="profile-name">{name || authUser.username}</div>
              <button onClick={() => setEditingName(true)} className="text-xs text-teal-600 font-semibold hover:underline">Edit</button>
            </div>
          )}

       
          {editingBio ? (
            <div className="flex gap-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write your bio..."
                className="filter-input flex-1 resize-none"
                rows={2}
              />
              <div className="flex flex-col gap-1">
                <button className="filter-sort-btn active" onClick={async () => {
                  await saveField("bio", bio);
                  setEditingBio(false);
                }}>Save</button>
                <button className="filter-sort-btn" onClick={() => setEditingBio(false)}>✕</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="profile-bio">{bio || "No bio yet."}</div>
              <button onClick={() => setEditingBio(true)} className="text-xs text-teal-600 font-semibold hover:underline ml-2">Edit</button>
            </div>
          )}

          
          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 mb-1 font-medium">Phone Number</p>
            {editingPhone ? (
              <div className="flex gap-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="filter-input flex-1"
                />
                <button className="filter-sort-btn active" onClick={async () => {
                  await saveField("phone_number", phone);
                  setEditingPhone(false);
                }}>Save</button>
                <button className="filter-sort-btn" onClick={() => setEditingPhone(false)}>✕</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">{phone || "N/A"}</p>
                <button onClick={() => setEditingPhone(true)} className="text-xs text-teal-600 font-semibold hover:underline">Edit</button>
              </div>
            )}
          </div>
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
              onClick={() => navigate(`/observations/${post.id}`)}
              style={{ background: !post.image?.image ? colors[i % colors.length] : 'transparent' }}
            >
              {post.image?.image && (
                <img src={post.image.thumbnail ?? post.image.image} alt={post.speciesName} className="post-img-full"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <div className="post-badge">
                {post.confidenceLevel != null
                  ? `${(post.confidenceLevel * 100).toFixed(0)}%`
                  : "N/A"}
              </div>
              <div className="post-info">
                <div className="post-species">{post.speciesName}</div>
                <div className="post-location">📍 {post.location}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}