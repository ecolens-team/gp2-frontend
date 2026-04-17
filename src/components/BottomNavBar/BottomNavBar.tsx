import { Home, Map as MapIcon, Camera, User, Trophy } from "lucide-react";
import { NavLink } from "react-router-dom";
export default function BottomNavBar() {
    return(
        <nav className="fixed bottom-0 w-full bg-teal-50 border-t-2 border-teal-500/20 flex justify-around py-3 pb-safe md:hidden text-lg shadow-[0_-4px_10px_rgba(0,0,0,0.0.2)] z-50">
            <NavLink to="/" className={({isActive}) => isActive ? "text-teal-600 font-bold flex flex-col items-center" : "text-gray-500 flex flex-col items-center"}>
                <Home />
                <span className="text-sm font-bold">Explore</span>
            </NavLink>
            <NavLink to="/map" className={({isActive}) => isActive ? "text-teal-600 font-bold flex flex-col items-center" : "text-gray-500 flex flex-col items-center"}>
                <MapIcon />
                <span className="text-sm font-bold">Map</span>
            </NavLink>
            <div className="w-16"></div>
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center justify-center w-16">
                <NavLink 
                    to="/camera" 
                    className="flex items-center justify-center w-17 h-17 bg-linear-to-tr from-teal-500 to-blue-200 text-white rounded-full shadow-lg border-4 border-white hover:bg-teal-600 transition-transform active:scale-95"
                >
                    <Camera size={32} strokeWidth={2.5} />
                </NavLink>
                <span className="text-sm text-gray-500 font-bold">New</span>
            </div>
            <NavLink to="/quests" className={({isActive}) => isActive ? "text-teal-600 font-bold flex flex-col items-center" : "text-gray-500 flex flex-col items-center font-bold"}>
                <Trophy />
                <span className="text-sm ">Quests</span>
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => isActive ? "text-teal-600 font-bold flex flex-col items-center" : "text-gray-500 flex flex-col items-center font-bold"}>
                <User />
                <span className="text-sm">Profile</span>
            </NavLink>
        </nav>
    );
}