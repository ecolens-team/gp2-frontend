import {
  Home,
  Map as MapIcon,
  Camera,
  Trophy,
  MessageCircle,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

export default function BottomNavBar() {
  const { unreadCount } = useNotifications();

  return (
    <nav className='fixed bottom-0 w-full bg-teal-50 border-t-2 border-teal-500/20 flex justify-around py-1.5 md:hidden text-lg shadow-[0_-4px_10px_rgba(0,0,0,0.0.2)] z-50'>
      <NavLink
        to='/'
        className={({ isActive }) =>
          isActive
            ? 'text-teal-600  flex flex-col items-center'
            : 'text-gray-500 flex flex-col items-center'
        }
      >
        <Home />
        <span className='text-xs '>Explore</span>
      </NavLink>
      <NavLink
        to='/map'
        className={({ isActive }) =>
          isActive
            ? 'text-teal-600  flex flex-col items-center'
            : 'text-gray-500 flex flex-col items-center'
        }
      >
        <MapIcon />
        <span className='text-xs ='>Map</span>
      </NavLink>
      <div className='w-16'></div>
      <div className='absolute left-1/2 -translate-x-1/2 -top-5 flex flex-col items-center justify-center w-16'>
        <NavLink
          to='/camera'
          className='flex items-center justify-center w-17 h-17 bg-linear-to-tr from-teal-500 to-blue-200 text-white rounded-full shadow-lg border-4 border-white hover:bg-teal-600 transition-transform active:scale-95'
        >
          <Camera size={32} strokeWidth={2.5} />
        </NavLink>
      </div>
      <NavLink
        to='/quests'
        className={({ isActive }) =>
          isActive
            ? 'text-teal-600  flex flex-col items-center'
            : 'text-gray-500 flex flex-col items-center '
        }
      >
        <Trophy />
        <span className='text-xs '>Quests</span>
      </NavLink>
      <NavLink
        to='/inbox'
        className={({ isActive }) =>
          isActive
            ? 'text-teal-600  flex flex-col items-center'
            : 'text-gray-500 flex flex-col items-center'
        }
      >
        <div className='relative'>
          <MessageCircle />
          {unreadCount > 0 && (
            <span className='absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 bg-teal-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span className='text-xs'>Inbox</span>
      </NavLink>
    </nav>
  );
}
