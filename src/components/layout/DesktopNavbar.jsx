import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PillNav from '../ui/PillNav';
import { useUI } from '../../context/UIContext';
import Logo from '../ui/Logo';

const DesktopNavbar = () => {
    const location = useLocation();
    const { unreadCount, setIsChatOpen } = useUI();

    const navItems = useMemo(() => [
        { label: 'Home', href: '/' },
        { label: 'Market', href: '/market' },
        { label: 'Services', href: '/services' },
        { label: 'Forum', href: '/forum' },
        { label: 'Social', href: '/connections' },
        { label: 'Chat', onClick: () => setIsChatOpen(true) }
    ], [setIsChatOpen]);
    // Removed href for Chat to ensure it works as an overlay button via PillNav's new onClick support

    return (
        <div className="hidden md:flex fixed top-6 left-0 right-0 justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto">
                <PillNav
                    logo={<Logo className="w-6 h-6" />}
                    items={navItems}
                    activeHref={location.pathname}
                    baseColor="#000"
                    pillColor="#fff"
                    pillTextColor="#000"
                    hoveredPillTextColor="#fff"
                    initialLoadAnimation={true}
                />
            </div>
        </div>
    );
};

export default DesktopNavbar;
