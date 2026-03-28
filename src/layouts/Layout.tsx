import { Outlet } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar/BottomNavBar';
import Header from '../components/Header';

export default function Layout() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow overflow-y-auto pb-10 md:pb-0">
        <Outlet /> 
      </main>
      <BottomNavBar />
    </div>
  );
}