import React from 'react';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Navigation = () => {
    const { user } = useAuth();
    const { openAuthModal, openProfileModal } = useUI();

    const handleUserClick = () => {
        if (user) {
            openProfileModal();
        } else {
            openAuthModal();
        }
    };

    return (
        <>
            <DesktopNavbar />

            {/* Desktop Profile (Fixed Top Right) - Kept separate from the centralized Nav Pill */}
            <div className="hidden md:block fixed top-6 right-6 z-50">
                <div className="flex flex-col items-end gap-2">

                    {/* Profile Button - PFP only, name on hover */}
                    <button
                        onClick={handleUserClick}
                        className="flex items-center gap-0 bg-transparent p-1 rounded-full relative overflow-hidden group transition-all duration-200"
                    >
                        <div className="relative z-10 shrink-0">
                            <Avatar 
                                url={user?.user_metadata?.avatar_url} 
                                firstName={user?.user_metadata?.first_name}
                                size="sm"
                            />
                        </div>

                        <div className="pl-3 pr-4 overflow-hidden whitespace-nowrap">
                            {user ? (
                                <p className="text-xs font-bold text-white">{user.user_metadata?.first_name}</p>
                            ) : (
                                <p className="text-xs font-bold text-white">Sign In</p>
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
