import React from 'react';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import { User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
    const { user } = useAuth();
    const { openAuthModal, unreadCount } = useUI();
    const navigate = useNavigate();

    const handleUserClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            openAuthModal();
        }
    };

    return (
        <>
            <DesktopNavbar />

            {/* Desktop Profile (Fixed Top Right) - Kept separate from the centralized Nav Pill */}
            <div className="hidden md:block fixed top-6 right-6 z-50">
                <div className="flex items-center gap-3">
                    {/* Chat Button */}
                    <button
                        onClick={() => navigate('/messages')}
                        className="relative w-10 h-10 flex items-center justify-center bg-black/50 border border-white/10 rounded-full hover:bg-black/70 transition-all hover:border-white/30 group"
                    >
                        <div className="relative">
                            <MessageSquare size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                            {unreadCount > 0 && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-black shadow-sm">
                                    <span className="text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Profile Button */}
                    <button
                        onClick={handleUserClick}
                        className="flex items-center gap-3 bg-black/50 border border-white/10 pl-1 pr-4 py-1 rounded-full hover:bg-black/70 transition-all hover:border-white/30 group"
                    >
                        <div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-white/20 relative group-hover:scale-105 transition-transform">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                                    {user?.user_metadata?.first_name ? user.user_metadata.first_name[0] : <User size={16} />}
                                </div>
                            )}
                        </div>
                        <div className="text-left">
                            {user ? (
                                <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">{user.user_metadata?.first_name}</p>
                            ) : (
                                <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">Sign In</p>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            <MobileNavbar />
        </>
    );
};

export default Navigation;
