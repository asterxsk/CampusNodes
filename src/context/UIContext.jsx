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
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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



    // Fetch unread messages count/senders
    const fetchUnreadMessages = async () => {
        if (!user) return;
        try {
            // Get all unique sender_ids for unread messages sent to current user
            const { data, error } = await supabase
                .from('messages')
                .select('sender_id')
                .eq('receiver_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            if (data) {
                const senders = new Set(data.map(msg => msg.sender_id));
                setUnreadSenders(senders);
            }
        } catch (err) {
            console.error('Error fetching unread messages:', err);
        }
    };

    // Listen for new incoming messages and updates to read status
    useEffect(() => {
        fetchPendingRequests();
        fetchUnreadMessages();

        if (!user) {
            setUnreadSenders(new Set());
            return;
        }

        const channel = supabase.channel('ui_friend_requests')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'friendships',
                filter: `user2_id=eq.${user.id}`
            }, () => fetchPendingRequests())
            .subscribe();

        // Subscribe to messages changes
        const messagesChannel = supabase
            .channel('ui_messages_tracking')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, (payload) => {
                // If is_read is false (default), add to unread
                // Note: If chat is open, the message component handles marking it read immediately,
                // triggering an UPDATE event which will remove it.
                if (payload.new && !payload.new.is_read) {
                    addUnreadSender(payload.new.sender_id);
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, (payload) => {
                // If message marked as read, we might need to refresh or check
                // Easier strategy: Refetch unread counts to be accurate or remove if we know the specific sender logic
                // For robustness, let's just refetch unread senders
                fetchUnreadMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(messagesChannel);
        };
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

            isNavHovered, setIsNavHovered,
            isProfileModalOpen, setIsProfileModalOpen,
            openProfileModal: () => setIsProfileModalOpen(true),
            closeProfileModal: () => setIsProfileModalOpen(false)
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
