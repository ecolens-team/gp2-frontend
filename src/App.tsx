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