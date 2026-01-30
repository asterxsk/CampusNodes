import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs/lib/anime.es.js';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';

import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const navRef = useRef(null);
    const menuRef = useRef(null);
    const { user, signOut } = useAuth(); // Hook to get auth state

    useEffect(() => {
        anime({
            targets: navRef.current,
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutExpo',
            delay: 200
        });
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            anime({
                targets: menuRef.current,
                translateX: ['-100%', '0%'], // Slide from Left
                easing: 'easeInOutExpo',
                duration: 800
            });
            anime({
                targets: '.menu-link',
                translateX: [-50, 0], // Slide items in
                opacity: [0, 1],
                delay: anime.stagger(100, { start: 200 }),
                easing: 'easeOutExpo'
            });
        } else {
            document.body.style.overflow = 'auto';
            if (menuRef.current) {
                anime({
                    targets: menuRef.current,
                    translateX: '-100%',
                    easing: 'easeInOutExpo',
                    duration: 600
                });
            }
        }
    }, [isOpen]);

    const toggleMenu = () => setIsOpen(!isOpen);

    // ... menuItems logic remains same ...
    const menuItems = [
        { name: 'Marketplace', path: '/market' },
        { name: 'Services', path: '/services' },
        { name: 'Connections', path: '/connections' },
    ];

    if (!user) {
        menuItems.push(
            { name: 'Sign In', path: '/login', isAuth: true },
            { name: 'Create Account', path: '/signup', isAuth: true }
        );
    }

    return (
        <>
            <nav ref={navRef} className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center text-white pointer-events-none">

                <div className="flex items-center gap-6 pointer-events-auto">
                    {/* Hamburger Trigger (LEFT) */}
                    <button onClick={toggleMenu} className="group flex flex-col items-start gap-1.5 p-2 mix-blend-difference z-50 hover:opacity-75 transition-opacity">
                        <span className={`h-[2px] bg-white transition-all duration-300 ${isOpen ? 'w-6 rotate-45 translate-y-2' : 'w-8'}`} />
                        <span className={`h-[2px] bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-6 group-hover:w-8'}`} />
                        <span className={`h-[2px] bg-white transition-all duration-300 ${isOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-4 group-hover:w-8'}`} />
                    </button>

                    {/* Logo (No Text) */}
                    <Link to="/" className="text-xl md:text-2xl font-display font-bold tracking-tighter mix-blend-difference z-50">
                        Campus Nodes
                    </Link>
                </div>

                {/* User Avatar (RIGHT) */}
                {user && (
                    <Link to="/profile" className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 hover:bg-white hover:text-black transition-all text-sm font-bold mix-blend-difference z-50">
                        {user.user_metadata?.first_name ? user.user_metadata.first_name[0] : user.email[0].toUpperCase()}
                    </Link>
                )}
            </nav>

            {/* Sidebar Menu */}
            <div ref={menuRef} className="fixed top-0 left-0 h-full w-[320px] bg-black/95 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col transform -translate-x-full shadow-2xl">
                {/* Menu Items (Top) */}
                <div className="flex-1 flex flex-col pt-32 px-8 gap-6 text-left overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`menu-link text-3xl font-display font-bold text-white hover:text-accent transition-colors duration-300 opacity-0 ${item.isAuth ? 'text-xl font-sans tracking-widest text-gray-400' : ''}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* User Section (Pinned Bottom) */}
                {user && (
                    <div className="p-8 border-t border-white/10 animate opacity-0 menu-link mt-auto bg-black/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold border border-white/10">
                                {user.user_metadata?.first_name ? user.user_metadata.first_name[0] : user.email[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{user.user_metadata?.first_name || 'Student'}</p>
                                <p className="text-gray-500 text-xs truncate max-w-[120px]">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link to="/profile" onClick={() => setIsOpen(false)} className="text-sm text-gray-300 hover:text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-1 bg-accent rounded-full"></span> View Profile
                            </Link>
                            <Link to="/settings" onClick={() => setIsOpen(false)} className="text-sm text-gray-300 hover:text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span> Settings
                            </Link>
                            <button onClick={() => { signOut(); setIsOpen(false); }} className="text-sm text-red-500 hover:text-red-400 uppercase tracking-wider text-left mt-2 pl-3">
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Navbar;
