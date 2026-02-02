import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadSenders, setUnreadSenders] = useState(new Set());
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
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

    // Fetch pending friend request count
    const fetchPendingRequests = async () => {
        if (!user) {
            setPendingRequestCount(0);
            return;
        }

        try {
            const { count, error } = await supabase
                .from('friendships')
                .select('*', { count: 'exact', head: true })
                .eq('user2_id', user.id)
                .eq('status', 'pending');

            if (error) throw error;
            setPendingRequestCount(count || 0);
        } catch (err) {
            console.error('Error fetching pending requests:', err);
        }
    };

    // Listen for friendship changes
    useEffect(() => {
        fetchPendingRequests();

        if (!user) return;

        const channel = supabase.channel('ui_friend_requests')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'friendships',
                filter: `user2_id=eq.${user.id}`
            }, () => fetchPendingRequests())
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    return (
        <UIContext.Provider value={{
            isAuthModalOpen, openAuthModal, closeAuthModal,
            isChatOpen, setIsChatOpen, toggleChat, openChat, closeChat,
            unreadCount: unreadSenders.size,
            unreadSenders,
            addUnreadSender,
            removeUnreadSender,
            pendingRequestCount,
            fetchPendingRequests,
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
