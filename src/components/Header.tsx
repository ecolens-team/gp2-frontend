import { NavLink } from "react-router-dom";

export default function Header() {
    return(
        <div className=" font-bold text-l bg-teal-50 p-3 sticky top-0 ">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-teal-700 font-black text-2xl">EcoLens</h1>
                <nav className="  bg-teal-50 md:flex gap-6 hidden ">
                    <NavLink to="/" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Explore</NavLink>
                    <NavLink to="/map" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Map</NavLink>
                    <NavLink to="/quests" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Quests</NavLink>
                    <NavLink to="/profile" className={({isActive}) => isActive ? "text-teal-600 font-bold" : "text-gray-500"}>Profile</NavLink>
                </nav>
            </div>
        </div>
    );
}