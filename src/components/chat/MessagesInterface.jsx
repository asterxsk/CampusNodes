import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Trash2, Lock, MoreVertical, Search, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { encryptMessage, decryptMessage } from '../../lib/encryption';

const MessagesInterface = ({ onClose, isModal = false }) => {
    const { user } = useAuth();
    const { removeUnreadSender, unreadSenders } = useUI();
    const toast = useToast();
    const { showConfirm } = useModal();

    const [activeChat, setActiveChat] = useState(null);
    const [friends, setFriends] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [firstUnreadId, setFirstUnreadId] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const messagesContainerRef = useRef(null);

    const scrollToBottom = (smooth = true) => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

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
                // Only apply offset if it's significant (keyboard is likely open)
                // Threshold of 150 to avoid triggering on URL bar changes
                setKeyboardOffset(offset > 150 ? offset : 0);

                // Scroll messages to bottom when keyboard opens
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
    }, []);

    useEffect(() => {
        if (user) fetchFriends();
    }, [user]);

    // Auto-scroll on new messages if near bottom
    useEffect(() => {
        // Only auto-scroll if we are already near the bottom OR if it's a new message we just sent
        // For simplicity, we'll auto-scroll unless the user is way up, 
        // but typically for "new message arrived" we might want to show a badge instead if scrolled up.
        // For now, let's keep simple behavior but respect manual scroll a bit? 
        // Actually, previous behavior was always scroll. Let's stick to that for consistency unless requested otherwise.
        if (!showScrollButton) {
            scrollToBottom();
        }
    }, [messages]);

    const markMessagesAsRead = async (senderId) => {
        try {
            // Update ALL messages from this sender to me as read to ensure no "stuck" notifications
            // Actually, to be aggressive and fix the user's issue, let's just update anything that isn't true.
            // Or simpler: just update where receiver is me and sender is them.
            // But we can keep .eq('is_read', false) if we trust the DB. 
            // Let's use use .or('is_read.eq.false,is_read.is.null') logic if possible, or just drop the filter to be safe.
            // Dropping the filter adds overhead but guarantees consistency.

            const { error: updateError } = await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('sender_id', senderId)
                .eq('receiver_id', user.id)
                .neq('is_read', true); // Update false or null

            if (updateError) throw updateError;

            // Also update local unread count via context
            removeUnreadSender(senderId);
        } catch (err) {
            console.error("Error marking messages as read:", err);
        }
    };

    useEffect(() => {
        if (activeChat) {
            // Reset unread marker state when switching chats
            setFirstUnreadId(null);

            // Fetch first, then mark read internally
            fetchMessages(activeChat.id);

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

                        // If user is looking (not scrolled up), scroll to bottom
                        if (!showScrollButton) scrollToBottom();

                        // Mark as read immediately
                        await markMessagesAsRead(activeChat.id);
                    }
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${user.id}` // Listen for updates to messages WE sent (e.g. marked as read)
                }, (payload) => {
                    if (payload.new.receiver_id === activeChat.id) {
                        setMessages(prev => prev.map(msg =>
                            msg.id === payload.new.id ? { ...msg, ...payload.new, content: msg.content } : msg
                        ));
                    }
                })
                .subscribe();

            return () => supabase.removeChannel(channel);
        }
    }, [activeChat]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const { data: friendships } = await supabase
                .from('friendships')
                .select('*')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .eq('status', 'accepted');

            if (!friendships?.length) { setFriends([]); return; }

            const friendIds = friendships.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', friendIds);

            setFriends(profiles || []);
        } catch (err) {
            console.error("Error fetching friends:", err);
        } finally {
            setLoading(false);
        }
    };

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

    const filteredFriends = friends.filter(friend =>
        (friend.first_name + ' ' + friend.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex bg-black h-full overflow-hidden relative">
            {/* ==================== LEFT SIDEBAR (Chat List) ==================== */}
            <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-white/10 flex flex-col bg-background z-20 transition-transform duration-300 absolute md:relative inset-0 ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-bold text-white font-display">Chats</h1>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Friends List */}
                <div className="flex-1 overflow-y-auto px-2 pb-20 md:pb-2 custom-scrollbar">
                    {loading && friends.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-sm">Loading chats...</div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-sm">No friends found</div>
                    ) : (
                        filteredFriends.map(friend => (
                            <button
                                key={friend.id}
                                onClick={() => setActiveChat(friend)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${activeChat?.id === friend.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border border-white/10">
                                        {friend.avatar_url ? (
                                            <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                                                {friend.first_name?.[0]}
                                            </div>
                                        )}
                                    </div>
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
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/10">
                                    {activeChat.avatar_url ? (
                                        <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                                            {activeChat.first_name?.[0]}
                                        </div>
                                    )}
                                </div>
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
                            className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('/chat-bg.png')] bg-repeat bg-opacity-5 flex flex-col relative"
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
                                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {msg.sender_id === user.id && msg.is_read && (
                                                            <span className="font-bold"> • Read</span>
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
                            className={`p-4 ${isModal ? 'pb-4' : 'pb-4'} ${keyboardOffset === 0 && !isModal ? 'pb-16 md:pb-4' : ''} bg-background border-t border-white/10 shrink-0 transition-all`}
                        >
                            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-full px-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-sm py-1"
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
        </div>
    );
};

export default MessagesInterface;
