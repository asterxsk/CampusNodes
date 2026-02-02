import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [unreadSenders, setUnreadSenders] = useState(new Set());
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isNavHovered, setIsNavHovered] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const toggleChat = () => setIsChatOpen(prev => !prev);
    const openChat = () => setIsChatOpen(true);
    const closeChat = () => setIsChatOpen(false);

    const addUnreadSender = (senderId) => {
        setUnreadSenders(prev => {
            const newSet = new Set(prev);
            newSet.add(senderId);
            return newSet;
        });
    };

    const removeUnreadSender = (senderId) => {
        setUnreadSenders(prev => {
            const newSet = new Set(prev);
            newSet.delete(senderId);
            return newSet;
        });
    };

    return (
        <UIContext.Provider value={{
            isAuthModalOpen, openAuthModal, closeAuthModal,
            isChatOpen, setIsChatOpen, toggleChat, openChat, closeChat,
            unreadCount: unreadSenders.size,
            unreadSenders,
            addUnreadSender,
            removeUnreadSender,
            isSidebarCollapsed, setIsSidebarCollapsed,
            isNavHovered, setIsNavHovered
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
