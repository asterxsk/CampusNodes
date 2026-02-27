import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Send, Trash2, Lock, MoreVertical, Search, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { encryptMessage, decryptMessage } from '../../lib/encryption';
import Avatar from '../../components/ui/Avatar';

const MessagesInterface = ({ isModal = false }) => {
    const { user } = useAuth();
    const { removeUnreadSender, unreadSenders } = useUI();
    const toast = useToast();
    const { showConfirm } = useModal();

    const [activeChat, setActiveChat] = useState(null);
    const [friends, setFriends] = useState([]);
    const [activeChats, setActiveChats] = useState([]);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newChatSearchTerm, setNewChatSearchTerm] = useState('');
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [firstUnreadId, setFirstUnreadId] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const showScrollButtonRef = useRef(false);

    useEffect(() => { showScrollButtonRef.current = showScrollButton; }, [showScrollButton]);

    // const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const messagesContainerRef = useRef(null);

    const scrollToBottom = useCallback((smooth = true) => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }, []);

    const checkScroll = () => {
        if (!messagesContainerRef.current) return;
        const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
        // Show button if user is scrolled up more than 300px from bottom
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    };

    // Handle mobile keyboard visibility
    useEffect(() => {
        const handleViewportChange = () => {
            if (window.visualViewport) {
                const offset = window.innerHeight - window.visualViewport.height;
                setKeyboardOffset(offset > 150 ? offset : 0);

                if (offset > 150) {
                    setTimeout(() => scrollToBottom(true), 100);
                }
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
            window.visualViewport.addEventListener('scroll', handleViewportChange);
            return () => {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
                window.visualViewport.removeEventListener('scroll', handleViewportChange);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // useEffect(() => {
    //     if (user) fetchFriends();
    // }, [user]);

    useEffect(() => {
        if (!showScrollButton) {
            scrollToBottom();
        }
    }, [messages, showScrollButton, scrollToBottom]);

    const markMessagesAsRead = useCallback(async (senderId) => {
        try {
            const { error: updateError } = await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('sender_id', senderId)
                .eq('receiver_id', user.id)
                .neq('is_read', true);

            if (updateError) throw updateError;
            removeUnreadSender(senderId);
        } catch (err) {
            console.error("Error marking messages as read:", err);
        }
    }, [user.id, removeUnreadSender]);

    const markMessagesAsReadCallback = useCallback(markMessagesAsRead, [markMessagesAsRead]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            // Fetch accepted friendships
            const { data: friendships } = await supabase
                .from('friendships')
                .select('*')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .eq('status', 'accepted');

            if (!friendships?.length) {
                setFriends([]);
                setActiveChats([]);
                return;
            }

            const friendIds = friendships.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', friendIds);

            setFriends(profiles || []);

            // Now determine which of these friends have an active chat history
            // We'll fetch the most recent messages for the user to see who they've talked to
            const { data: recentMessages } = await supabase
                .from('messages')
                .select('sender_id, receiver_id')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .or(`and(sender_id.eq.${user.id},deleted_by_sender.eq.false),and(receiver_id.eq.${user.id},deleted_by_receiver.eq.false)`)
                .order('created_at', { ascending: false });

            const activeFriendIds = new Set();
            if (recentMessages) {
                recentMessages.forEach(msg => {
                    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                    activeFriendIds.add(otherId);
                });
            }

            // Filter friends to only those with active chat history
            const activeProfiles = (profiles || []).filter(p => activeFriendIds.has(p.id));
            setActiveChats(activeProfiles);

        } catch (err) {
            console.error("Error fetching friends and active chats:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFriendsCallback = React.useCallback(fetchFriends, [user]);

    useEffect(() => {
        if (user) fetchFriendsCallback();
    }, [user, fetchFriendsCallback]);

    const fetchMessages = async (friendId) => {
        setLoading(true);
        try {
            // Fetch messages between user and friend, excluding soft-deleted ones
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            // Filter out messages based on deletion flags
            // If user is sender, check deleted_by_sender. If user is receiver, check deleted_by_receiver.
            const filteredMessages = (data || []).filter(msg => {
                if (msg.sender_id === user.id) {
                    return !msg.deleted_by_sender;
                } else {
                    return !msg.deleted_by_receiver;
                }
            });

            // Identify first unread message from the OTHER person
            const firstUnread = filteredMessages.find(m => m.sender_id === friendId && !m.is_read);
            if (firstUnread) {
                setFirstUnreadId(firstUnread.id);
            } else {
                setFirstUnreadId(null); // No unread messages
            }

            const decryptedMessages = filteredMessages.map(msg => ({
                ...msg,
                content: decryptMessage(msg.content, msg.sender_id, msg.receiver_id)
            }));
            setMessages(decryptedMessages);

            // Mark messages as read AFTER identifying which ones were unread
            if (firstUnread) {
                await markMessagesAsRead(friendId);
            }

            // Scroll logic
            if (firstUnread) {
                // If there are unread messages, we might want to scroll to the banner?
                // For now, let's just stick to bottom or maybe scroll to banner could be a nice touch later.
                // Keeping standard behavior: scroll to bottom
                setTimeout(() => scrollToBottom(false), 50);
            } else {
                setTimeout(() => scrollToBottom(false), 50);
            }

        } catch (err) {
            console.error("Error fetching messages:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessagesCallback = React.useCallback(fetchMessages, [user.id, scrollToBottom, markMessagesAsRead]);

    // Refresh messages on window focus to ensure read status is up to date
    useEffect(() => {
        const handleFocus = () => {
            if (activeChat) fetchMessagesCallback(activeChat.id);
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [activeChat, fetchMessagesCallback]);

    // Moved usage before definition fix:
    // Actually, we must place the useEffect AFTER this block or use function hoisting, but using useCallback prevents hoisting.
    // So we will insert the useEffect HERE.

    useEffect(() => {
        if (activeChat) {
            // Reset unread marker state when switching chats
            setFirstUnreadId(null);

            // Focus input when chat opens
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            // Fetch first, then mark read internally
            fetchMessagesCallback(activeChat.id);

            const channel = supabase
                .channel(`chat:${activeChat.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${activeChat.id}`
                }, async (payload) => {
                    if (payload.new.receiver_id === user.id) {
                        const decryptedContent = decryptMessage(payload.new.content, payload.new.sender_id, payload.new.receiver_id);
                        const msgWithDecrypted = { ...payload.new, content: decryptedContent };
                        setMessages(prev => [...prev, msgWithDecrypted]);

                        if (!showScrollButtonRef.current) scrollToBottom();

                        // Mark as read immediately
                        await markMessagesAsReadCallback(activeChat.id);
                    }
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${user.id}` // Listen for updates to messages WE sent (e.g. marked as read)
                }, (payload) => {
                    // console.log('Realtime UPDATE received:', payload);
                    if (payload.new.receiver_id === activeChat.id) {
                        setMessages(prev => prev.map(msg =>
                            msg.id === payload.new.id ? { ...msg, ...payload.new, content: msg.content } : msg
                        ));
                    }
                })
                .subscribe();

            return () => supabase.removeChannel(channel);
        }
    }, [activeChat, user.id, fetchMessagesCallback, markMessagesAsReadCallback, scrollToBottom]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const content = newMessage.trim();
        setNewMessage('');

        const tempMsg = {
            id: Date.now(),
            sender_id: user.id,
            receiver_id: activeChat.id,
            content: content,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMsg]);
        scrollToBottom();

        try {
            const encryptedContent = encryptMessage(content, user.id, activeChat.id);
            await supabase.from('messages').insert({
                sender_id: user.id,
                receiver_id: activeChat.id,
                content: encryptedContent
            });

            // If this is a newly initiated chat, ensure they are in the activeChats list
            setActiveChats(prev => {
                if (!prev.some(p => p.id === activeChat.id)) {
                    return [...prev, activeChat];
                }
                return prev;
            });
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const clearChat = async () => {
        if (!activeChat) return;

        const confirmed = await showConfirm({
            title: 'Clear Chat History',
            message: 'This will permanently clear all messages in this conversation for BOTH you and the other person. This action cannot be undone.',
            confirmText: 'Clear All',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            // Update messages where current user is the sender - mark as deleted by sender
            const { error: error1 } = await supabase
                .from('messages')
                .update({ deleted_by_sender: true, deleted_by_receiver: true })
                .eq('sender_id', user.id)
                .eq('receiver_id', activeChat.id);

            if (error1) throw error1;

            // Update messages where current user is the receiver - mark as deleted by both
            const { error: error2 } = await supabase
                .from('messages')
                .update({ deleted_by_sender: true, deleted_by_receiver: true })
                .eq('sender_id', activeChat.id)
                .eq('receiver_id', user.id);

            if (error2) throw error2;

            // Clear local state
            setMessages([]);

            // Remove from activeChats and close chat view
            setActiveChats(prev => prev.filter(c => c.id !== activeChat.id));
            setActiveChat(null);

            toast.success('Chat cleared for both users');
        } catch (err) {
            console.error("Failed to clear chat", err);
            toast.error('Failed to clear messages');
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Please log in to access messages.</p>
            </div>
        );
    }

    const filteredActiveChats = activeChats.filter(friend =>
        (friend.first_name + ' ' + friend.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredNewChatFriends = friends.filter(friend =>
        (friend.first_name + ' ' + friend.last_name).toLowerCase().includes(newChatSearchTerm.toLowerCase())
    );

    const handleStartNewChat = (friend) => {
        setActiveChat(friend);
        setShowNewChatModal(false);
        // Add to active chats immediately so it appears in the list
        setActiveChats(prev => {
            if (!prev.some(p => p.id === friend.id)) {
                return [friend, ...prev];
            }
            return prev;
        });
    };

    return (
        <div className="flex bg-black h-full overflow-hidden relative">
            {/* ==================== LEFT SIDEBAR (Chat List) ==================== */}
            <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-white/10 flex flex-col bg-background z-20 transition-transform duration-300 absolute md:relative inset-0 ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-bold text-white font-display">Chats</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowNewChatModal(true)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors border border-white/10"
                            title="Start New Chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Active Chats List */}
                <div className="flex-1 overflow-y-auto px-2 pb-20 md:pb-2 custom-scrollbar">
                    {loading && friends.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-sm">Loading chats...</div>
                    ) : filteredActiveChats.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-sm">No active chats found. Try starting a new one!</div>
                    ) : (
                        filteredActiveChats.map(friend => (
                            <button
                                key={friend.id}
                                onClick={() => setActiveChat(friend)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${activeChat?.id === friend.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <Avatar
                                        url={friend.avatar_url}
                                        firstName={friend.first_name}
                                        size="md"
                                    />
                                    {unreadSenders.has(friend.id) && (
                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full border-2 border-black" />
                                    )}
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className="font-semibold text-white truncate text-sm">{friend.first_name} {friend.last_name}</h3>
                                        <span className="text-[10px] text-gray-500">12:30 PM</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">
                                        {unreadSenders.has(friend.id) ? <span className="text-accent font-medium">New message</span> : friend.role || 'Student'}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ==================== RIGHT CHAT AREA (Main) ==================== */}
            <div
                className={`flex-1 flex flex-col bg-[#0a0a0a] transition-all duration-300 absolute md:relative inset-0 z-30 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
                style={{
                    height: keyboardOffset > 0 ? `calc(100% - ${keyboardOffset}px)` : '100%',
                    top: 0
                }}
            >
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full text-white">
                                    <ChevronLeft size={24} />
                                </button>
                                <Avatar
                                    url={activeChat.avatar_url}
                                    firstName={activeChat.first_name}
                                    size="md"
                                />
                                <div>
                                    <h2 className="font-bold text-white text-sm">{activeChat.first_name} {activeChat.last_name}</h2>
                                    <p className="text-[10px] text-accent flex items-center gap-1">
                                        <Lock size={8} /> End-to-end encrypted
                                    </p>
                                </div>
                                <button onClick={clearChat} className="p-2 hover:bg-red-500/10 rounded-full hover:text-red-500 transition-colors ml-2" title="Clear Chat">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Right side spacer for close button if needed, but button is moved */}
                            <div className="w-8"></div>
                        </div>

                        <div
                            className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/5 flex flex-col relative"
                            ref={messagesContainerRef}
                            onScroll={checkScroll}
                        >
                            <div className="flex-1 min-h-0" /> {/* Spacer to push messages down */}
                            <div className="space-y-2 flex flex-col justify-end">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-60">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                            <Send size={24} className="-ml-1 text-white/50" />
                                        </div>
                                        <p className="text-sm">No messages yet.</p>
                                        <p className="text-xs">Send a message to start chatting!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <React.Fragment key={msg.id}>
                                            {/* Unread Banner */}
                                            {msg.id === firstUnreadId && (
                                                <div className="w-full flex justify-center my-4 animate-fade-in">
                                                    <div className="bg-accent/10 border border-accent/20 backdrop-blur-sm text-accent text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg">
                                                        Unread Messages
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender_id === user.id
                                                    ? 'bg-accent text-black rounded-tr-sm'
                                                    : 'bg-[#1f1f1f] text-white rounded-tl-sm border border-white/5'
                                                    }`}>
                                                    <p>{msg.content}</p>
                                                    <p className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${msg.sender_id === user.id ? 'text-black/60' : 'text-gray-500'}`}>
                                                        <span>
                                                            {msg.created_at && !isNaN(new Date(msg.created_at).getTime())
                                                                ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                : ''}
                                                        </span>
                                                        {msg.sender_id === user.id && msg.is_read === true && (
                                                            <span className="font-bold flex items-center gap-0.5" title={msg.read_at ? `Read at ${new Date(msg.read_at).toLocaleString()}` : 'Read'}>
                                                                <span>•</span> Read
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))
                                )}
                            </div>

                            {/* Jump to Latest Button */}
                            {showScrollButton && (
                                <div className="sticky bottom-0 left-0 right-0 flex justify-center pb-2 pointer-events-none">
                                    <button
                                        onClick={() => scrollToBottom(true)}
                                        className="pointer-events-auto bg-black/80 backdrop-blur hover:bg-black text-white p-2 rounded-full border border-white/20 shadow-lg text-xs flex items-center gap-2 transition-all animate-bounce"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Input Area - Keyboard responsive on mobile */}
                        <form
                            onSubmit={sendMessage}
                            className={`p-4 ${isModal ? 'pb-4' : 'pb-4'} ${keyboardOffset === 0 && !isModal ? 'pb-[90px] md:pb-4' : ''} bg-background border-t border-white/10 shrink-0 transition-all`}
                        >
                            <div
                                className="flex items-center gap-2 bg-[#1a1a1a] rounded-full px-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors cursor-text"
                                onClick={() => inputRef.current?.focus()}
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-sm py-1 cursor-text"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-accent text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(37,99,235,0.4)] transition-all"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    // Empty State (Desktop Right Side)
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-500 bg-background/50 relative">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                            <Send size={40} className="text-white/20" />
                        </div>
                        <h2 className="text-2xl font-bold text-white/50 mb-2 font-display">CampusNodes Web</h2>
                        <p className="text-sm max-w-xs text-center text-gray-600">
                            Send and receive messages with end-to-end encryption. Select a chat to start messaging.
                        </p>
                    </div>
                )}
            </div>

            {/* New Chat Modal Overlays entirely within this component container */}
            {showNewChatModal && (
                <div className="absolute inset-0 z-[60] bg-black/80 flex flex-col pt-10 px-4 pb-4 animate-fade-in backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md mx-auto flex flex-col h-full max-h-[80vh] shadow-2xl relative overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-white/5">
                            <h2 className="text-lg font-bold text-white">Start New Chat</h2>
                            <button
                                onClick={() => setShowNewChatModal(false)}
                                className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search your friends..."
                                    value={newChatSearchTerm}
                                    onChange={(e) => setNewChatSearchTerm(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
                            {filteredNewChatFriends.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    {friends.length === 0 ? "You don't have any friends yet." : "No friends found matching your search."}
                                </div>
                            ) : (
                                filteredNewChatFriends.map(friend => {
                                    const isActive = activeChats.some(c => c.id === friend.id);
                                    return (
                                        <button
                                            key={friend.id}
                                            onClick={() => handleStartNewChat(friend)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors mb-1 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar url={friend.avatar_url} firstName={friend.first_name} size="md" />
                                                <div className="text-left">
                                                    <h3 className="font-semibold text-white text-sm">{friend.first_name} {friend.last_name}</h3>
                                                    <p className="text-xs text-gray-400 capitalize">{friend.role || 'Student'}</p>
                                                </div>
                                            </div>
                                            {isActive ? (
                                                <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">Joined</span>
                                            ) : (
                                                <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">Message</span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesInterface;

