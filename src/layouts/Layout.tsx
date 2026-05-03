import { Outlet } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar/BottomNavBar';
import Header from '../components/Header';
import MobileNavBar from '../components/MobileNavBar';
import { useUIContext } from '../contexts/UIContext';

export default function Layout() {
  const { mobileTitleBar, hideBottomNav } = useUIContext();

  return (
    <div className="flex flex-col h-screen">
      {/* On mobile,hide the global header when a page declares a title bar */}
      <div className={mobileTitleBar ? "hidden md:block" : ""}>
        <Header />
      </div>
      {mobileTitleBar && (
        <MobileNavBar title={mobileTitleBar.title} fallbackPath={mobileTitleBar.fallbackPath} />
      )}

      <main className="grow overflow-y-auto pb-10 md:pb-0 min-h-0">
        <Outlet />
      </main>

      {!hideBottomNav && <BottomNavBar />}
    </div>
  );
}
