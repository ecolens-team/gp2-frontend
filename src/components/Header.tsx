import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext/AuthContext";
import { logoutUser } from "../services/authService";
import { Search, LogOut, Plus } from "lucide-react";

export default function Header() {
    const { authUser } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="bg-white border-b border-teal-100 p-3 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <h1 
                    className="text-teal-700 font-black text-2xl tracking-tight cursor-pointer" 
                    onClick={() => navigate('/')}
                >
                    EcoLens
                </h1>

                <div className="hidden md:flex items-center gap-6 flex-1 ml-8">
                    <nav className="flex gap-6 text-base font-semibold">
                        <NavLink to="/" className={({isActive}) => isActive ? "text-teal-600" : "text-gray-500 hover:text-teal-500 transition-colors"}>Explore</NavLink>
                        <NavLink to="/map" className={({isActive}) => isActive ? "text-teal-600" : "text-gray-500 hover:text-teal-500 transition-colors"}>Map</NavLink>
                        <NavLink to="/quests" className={({isActive}) => isActive ? "text-teal-600" : "text-gray-500 hover:text-teal-500 transition-colors"}>Quests</NavLink>
                    </nav>
                    
                </div>
                <div className="relative flex-1 max-w-md ml-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-all"
                        placeholder="Search species or locations..."
                    />
                </div>

                <div className="flex items-center gap-4">
                    {authUser ? (
                        <>
                            <button
                                onClick={() => navigate('/camera')}
                                className="hidden md:flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-full font-bold transition-all shadow-sm active:scale-95"
                            >
                                <Plus size={18} strokeWidth={3} />
                                <span>New Observation</span>
                            </button>

                            <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
                                
                                <button 
                                    onClick={() => navigate('/profile')} 
                                    className="flex items-center justify-center w-9 h-9 bg-teal-100 text-teal-700 rounded-full font-bold text-sm hover:ring-2 hover:ring-teal-500 transition-all"
                                    title="Go to Profile"
                                >
                                    {authUser.profile_picture?  <img src={authUser.profile_picture} className='w-15 h-15 rounded-full'/>
                                        :
                                    authUser?.first_name ? authUser.first_name[0].toUpperCase() : 'U'}
                                </button>
                                
                                <button
                                    onClick={async () => {
                                        await logoutUser();
                                        navigate('/login');
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>

                            </div>
                        </>
                    ) : (
                        <button
                            className="rounded-full bg-teal-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </button>
                    )}
                </div>
                
            </div>
        </div>
    );
}