import React from 'react';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useTheme } from '../../context/Contexts';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Edit2, Lock, LogOut, Palette, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

const themes = [
    { id: 'dark', label: 'Dark (Default)' },
    { id: 'catppuccin-mocha', label: 'Catppuccin Mocha' }
];

const Navigation = () => {
    const { user, signOut } = useAuth();
    const { openAuthModal, openProfileModal, openChangePasswordModal } = useUI();
    const { theme, setTheme } = useTheme();

    const handleUserClick = () => {
        if (!user) {
            openAuthModal();
        } else {
            openProfileModal();
        }
    };

    return (
        <>
            <DesktopNavbar />

            {/* Desktop Profile (Fixed Top Right) */}
            <div className="hidden md:block fixed top-6 right-6 z-50">
                <div className="flex flex-col items-end gap-2 relative">

                    <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full border border-white/5 pr-1 hover:bg-black/60 transition-colors">
                        {/* Profile Button - clicking avatar still opens profile view */}
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

                            <div className="pl-3 pr-2 overflow-hidden whitespace-nowrap">
                                {user ? (
                                    <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">{user.user_metadata?.first_name}</p>
                                ) : (
                                    <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">Sign In</p>
                                )}
                            </div>
                        </button>

                        {/* Kebab Menu - only show if logged in */}
                        {user && (
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none">
                                        <MoreVertical size={16} />
                                    </button>
                                </DropdownMenu.Trigger>

                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        asChild
                                        sideOffset={5}
                                        align="end"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="min-w-[220px] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-[100]"
                                        >
                                            <DropdownMenu.Item
                                                onClick={openChangePasswordModal}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer outline-none transition-colors mb-1"
                                            >
                                                <Lock size={16} /> Change Password
                                            </DropdownMenu.Item>

                                            <DropdownMenu.Separator className="h-px bg-white/10 my-1 mx-1" />

                                            {/* Themes Submenu */}
                                            <DropdownMenu.Sub>
                                                <DropdownMenu.SubTrigger className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer outline-none transition-colors data-[state=open]:bg-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <Palette size={16} /> Switch Theme
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-500" />
                                                </DropdownMenu.SubTrigger>
                                                <DropdownMenu.Portal>
                                                    <DropdownMenu.SubContent
                                                        className="min-w-[180px] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] animate-in fade-in slide-in-from-left-2 duration-200"
                                                        sideOffset={8}
                                                        alignOffset={-4}
                                                    >
                                                        {themes.map(t => (
                                                            <DropdownMenu.Item
                                                                key={t.id}
                                                                onClick={() => setTheme(t.id)}
                                                                className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer outline-none transition-colors"
                                                            >
                                                                <span>{t.label}</span>
                                                                {theme === t.id && <Check size={14} className="text-accent" />}
                                                            </DropdownMenu.Item>
                                                        ))}
                                                    </DropdownMenu.SubContent>
                                                </DropdownMenu.Portal>
                                            </DropdownMenu.Sub>

                                            <DropdownMenu.Separator className="h-px bg-white/10 my-1 mx-1" />

                                            <DropdownMenu.Item
                                                onClick={() => signOut()}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl cursor-pointer outline-none transition-colors mt-1"
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </DropdownMenu.Item>
                                        </motion.div>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        )}
                    </div>
                </div>
            </div>

            <MobileNavbar />
        </>
    );
};

export default Navigation;
