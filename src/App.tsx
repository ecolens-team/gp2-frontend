import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Explore from './pages/Explore';
import Camera from './pages/Camera';
import Quests from './pages/Quests';
import Map from './pages/Map';
import Layout from './layouts/Layout';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Explore />} />
          <Route path="map" element={<Map />} />
          <Route path="camera" element={<Camera />} />
          <Route path="quests" element={<Quests />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
import { useState } from "react";
import "./index.css";

export default function App() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if(email==="test@test.com" && password==="123456"){
      alert("Login Success");
    }else{
      alert("Wrong email or password");
    }
  };

  return (

    <div className="container">

      <div className="card">

        <h2>EcoLens Login</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button type="submit">
            Login
          </button>

        </form>

      </div>

    </div>

  );
}