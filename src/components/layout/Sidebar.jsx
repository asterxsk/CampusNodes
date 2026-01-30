import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Wrench, Users, User, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import Magnetic from '../ui/Magnetic';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Marketplace', path: '/market', icon: <ShoppingBag size={24} /> },
        { name: 'Services', path: '/services', icon: <Wrench size={24} /> },
        { name: 'Connections', path: '/connections', icon: <Users size={24} /> },
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-screen bg-black border-r border-white/10 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-80'}`}
        >
            {/* Header / Logo */}
            <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center' : 'px-8 justify-between'}`}>
                <Link to="/" className="hover:scale-110 transition-transform">
                    <Logo className="w-10 h-10" />
                </Link>
                {!isCollapsed && (
                    <button onClick={() => setIsCollapsed(true)} className="text-gray-500 hover:text-white">
                        <ArrowLeftCircle size={24} />
                    </button>
                )}
            </div>

            {/* Toggle (Visible only when collapsed) */}
            {isCollapsed && (
                <div className="flex justify-center mb-8">
                    <button onClick={() => setIsCollapsed(false)} className="text-gray-500 hover:text-white">
                        <ArrowRightCircle size={24} />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-2 px-3">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Magnetic key={item.name}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-4 p-3 rounded-lg transition-all group ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className="shrink-0 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <span
                                    className={`font-display font-medium tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        </Magnetic>
                    );
                })}
            </nav>

            {/* User Section */}
            {user ? (
                <div className={`border-t border-white/10 p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <Link to="/profile" className="flex items-center gap-4 group relative">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold shrink-0 border border-white/20 group-hover:border-white transition-colors overflow-hidden">
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                user.user_metadata?.first_name ? user.user_metadata.first_name[0] : user.email[0].toUpperCase()
                            )}
                        </div>

                        {/* Name Pill (Visible on Hover when Collapsed) */}
                        {isCollapsed && (
                            <div className="absolute left-14 bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl z-50">
                                {user.user_metadata?.first_name || 'My Profile'}
                            </div>
                        )}

                        <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            <p className="text-sm font-bold text-white truncate max-w-[180px]">
                                {user.user_metadata?.first_name || 'My Profile'}
                            </p>
                            <p className="text-xs text-gray-500">View Profile</p>
                        </div>
                    </Link>
                </div>
            ) : (
                <div className={`p-4 border-t border-white/10 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <Link to="/login" className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors">
                        <User size={24} />
                        <span className={`font-display whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            Sign In
                        </span>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
