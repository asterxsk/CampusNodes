import React, { useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { UIContext } from './Contexts';

export const UIProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadSenders, setUnreadSenders] = useState(new Set());
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isNavHovered, setIsNavHovered] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const toggleChat = () => setIsChatOpen(prev => !prev);
    const openChat = () => setIsChatOpen(true);
    const closeChat = () => setIsChatOpen(false);

    const addUnreadSender = useCallback((senderId) => {
        setUnreadSenders(prev => {
            const newSet = new Set(prev);
            newSet.add(senderId);
            return newSet;
        });
    }, []);

    const removeUnreadSender = useCallback((senderId) => {
        setUnreadSenders(prev => {
            const newSet = new Set(prev);
            newSet.delete(senderId);
            return newSet;
        });
    }, []);

    const fetchPendingRequests = useCallback(async () => {
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
    }, [user]);

    const fetchUnreadMessages = useCallback(async () => {
        if (!user) return;
        try {
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
    }, [user]);

    useEffect(() => {
        fetchPendingRequests();
        fetchUnreadMessages();

        if (!user) {
            setUnreadSenders(new Set());
            return;
        }

        const channel = supabase.channel(`ui_friend_requests_${Date.now()}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'friendships',
                filter: `user2_id=eq.${user.id}`
            }, () => fetchPendingRequests())
            .subscribe();

        const messagesChannel = supabase
            .channel(`ui_messages_tracking_${Date.now()}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, (payload) => {
                if (payload.new && !payload.new.is_read) {
                    addUnreadSender(payload.new.sender_id);
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, () => {
                fetchUnreadMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(messagesChannel);
        };
    }, [user, fetchPendingRequests, fetchUnreadMessages, addUnreadSender]);

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
            isEditProfileModalOpen, setIsEditProfileModalOpen,
            openProfileModal: () => {
                setIsProfileModalOpen(true);
            },
            openEditProfileModal: () => {
                setIsProfileModalOpen(false);
                setIsEditProfileModalOpen(true);
            },
            closeEditProfileModal: () => {
                setIsEditProfileModalOpen(false);
            },
            isChangePasswordModalOpen,
            openChangePasswordModal: () => {
                setIsChangePasswordModalOpen(true);
            },
            closeChangePasswordModal: () => {
                setIsChangePasswordModalOpen(false);
            },
            closeProfileModal: () => {
                setIsProfileModalOpen(false);
            }
        }}>
            {children}
        </UIContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUI = () => useContext(UIContext);

export default UIProvider;
