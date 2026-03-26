import { useState } from "react";
import "./explore.css";

const data = [
  {
    id: 1,
    user: "user_name_01",
    time: "2h ago",
    speciesName: "Rosa Canina",
    location: "Amman, Jordan",
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d",
  },
  {
    id: 2,
    user: "user_name_02",
    time: "5h ago",
    speciesName: "Peace Lily",
    location: "Irbid, Jordan",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
  },
  {
    id: 3,
    user: "user_name_03",
    time: "1d ago",
    speciesName: "Solanum Lycopersicum",
    location: "Zarqa, Jordan",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b",
  },
  {
    id: 4,
    user: "user_name_04",
    time: "2d ago",
    speciesName: "Sunflower",
    location: "Aqaba, Jordan",
    image: "https://images.unsplash.com/photo-1524593119773-38b3b8c8d2c3",
  },
];

function Card({ item }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="card">
      <div className="card-header">
        <div className="avatar">
          {item.user[0].toUpperCase()}
        </div>
        <div>
          <p className="username">{item.user}</p>
          <p className="time">{item.time}</p>
        </div>
      </div>

      <img src={item.image} className="image" alt={item.speciesName} />

      <div className="card-body">
        <h4 className="species-name">{item.speciesName}</h4>
        <p className="location">📍 {item.location}</p>

        <div className="actions">
          <button className={`action-btn ${liked ? "liked" : ""}`} onClick={() => setLiked(!liked)}>
            {liked ? "❤️" : "🤍"} Like
          </button>
          <button className="action-btn">💬 Comment</button>
          <button className="action-btn">🔗 Share</button>
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const [query, setQuery] = useState("");

  const filtered = data.filter((item) =>
    item.speciesName.toLowerCase().includes(query.toLowerCase()) ||
    item.user.toLowerCase().includes(query.toLowerCase()) ||
    item.location.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          className="search"
          placeholder="Search for species..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        filtered.map((item) => <Card key={item.id} item={item} />)
      ) : (
        <div className="no-results">
          <span>🌿</span>
          No species found for "{query}"
        </div>
      )}

      <div className="bottom-nav">
        <span className="nav-item">🏠</span>
        <span className="nav-item">🗺️</span>
        <button className="camera-btn">📷</button>
        <span className="nav-item">👤</span>
        <span className="nav-item">🏆</span>
      </div>
    </div>
  );
}