import { NavLink } from "react-router-dom";

export default function BottomNavBar() {
    return(
        <nav className="fixed bottom-0 w-full bg-teal-50 border-t border-2 border-gray-100 flex justify-around py-3 pb-safe md:hidden">
            <NavLink to="/" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Explore</NavLink>
            <NavLink to="/map" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Map</NavLink>
            <NavLink to="/camera" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Camera</NavLink>
            <NavLink to="/quests" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Quests</NavLink>
            <NavLink to="/profile" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Profile</NavLink>
        </nav>
    );
}