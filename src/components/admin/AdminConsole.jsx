import React, { useState } from 'react';
import { useAdmin } from '../../context/Contexts';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Users, MessageSquare, ShoppingCart, Briefcase } from 'lucide-react';
import AdminUsersTab from './AdminUsersTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminMarketplaceTab from './AdminMarketplaceTab';
import AdminServicesTab from './AdminServicesTab';

const AdminConsole = ({ isOpen, onClose }) => {
    const { isAdmin } = useAdmin();
    const [activeTab, setActiveTab] = useState('users');

    if (!isAdmin) return null;

    const tabs = [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
        { id: 'services', label: 'Services', icon: Briefcase },
    ];

    const MotionDiv = motion.div;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-6xl h-[85vh] bg-[#0a0a0a] border border-red-500/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-red-500/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-white">CampusNodes Admin Console</h2>
                                <p className="text-red-400 text-sm mt-1">Superuser Access Granted</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Layout */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-64 border-r border-white/10 flex flex-col p-4 gap-2 shrink-0 bg-white/[0.02]">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${isActive
                                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTab === 'users' && <AdminUsersTab />}
                                {activeTab === 'messages' && <AdminMessagesTab />}
                                {activeTab === 'marketplace' && <AdminMarketplaceTab />}
                                {activeTab === 'services' && <AdminServicesTab />}
                            </div>
                        </div>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AdminConsole;
