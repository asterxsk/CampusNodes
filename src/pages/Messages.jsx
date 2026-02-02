import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, User, Trash2, Lock, MoreVertical, Search, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { encryptMessage, decryptMessage } from '../lib/encryption';

const Messages = () => {
    const { user } = useAuth();
    const { removeUnreadSender, unreadSenders } = useUI();
    const navigate = useNavigate();

    const [activeChat, setActiveChat] = useState(null);
    const [friends, setFriends] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (user) fetchFriends();
    }, [user]);

    useEffect(() => {
        if (activeChat) {
            removeUnreadSender(activeChat.id);
            fetchMessages(activeChat.id);

            const channel = supabase
                .channel(`chat:${activeChat.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${activeChat.id}`
                }, (payload) => {
                    if (payload.new.receiver_id === user.id) {
                        const decryptedContent = decryptMessage(payload.new.content, payload.new.sender_id, payload.new.receiver_id);
                        const msgWithDecrypted = { ...payload.new, content: decryptedContent };
                        setMessages(prev => [...prev, msgWithDecrypted]);
                        scrollToBottom();
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
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            const decryptedMessages = (data || []).map(msg => ({
                ...msg,
                content: decryptMessage(msg.content, msg.sender_id, msg.receiver_id)
            }));
            setMessages(decryptedMessages);
            setTimeout(scrollToBottom, 100);
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
            // Ideally show error state to user
        }
    };

    const clearChat = async () => {
        if (!activeChat || !window.confirm('Clear all messages with this person?')) return;
        try {
            await supabase.from('messages').delete()
                .eq('sender_id', user.id).eq('receiver_id', activeChat.id);
            await supabase.from('messages').delete()
                .eq('sender_id', activeChat.id).eq('receiver_id', user.id);
            setMessages([]);
        } catch (err) {
            console.error("Failed to clear chat", err);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
                <p className="text-gray-400">Please log in to access messages.</p>
            </div>
        );
    }

    const filteredFriends = friends.filter(friend =>
        (friend.first_name + ' ' + friend.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex bg-black h-screen overflow-hidden md:pt-28">
            {/* ==================== LEFT SIDEBAR (Chat List) ==================== */}
            <div className={`w-full md:w-[400px] border-r border-white/10 flex flex-col bg-background z-20 transition-transform duration-300 absolute md:relative inset-0 ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-xl z-10">
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
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Friends List */}
                <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
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

                {/* Bottom Spacer for Mobile Nav */}
                <div className="h-20 md:hidden" />
            </div>

            {/* ==================== RIGHT CHAT AREA (Main) ==================== */}
            <div className={`flex-1 flex flex-col bg-[#0a0a0a] transition-transform duration-300 absolute md:relative inset-0 z-30 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/50 backdrop-blur-md shrink-0">
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
                            </div>

                            <div className="flex items-center gap-2 text-gray-400">
                                <button className="p-2 hover:bg-white/10 rounded-full hover:text-white transition-colors">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-full hover:text-white transition-colors">
                                    <Video size={20} />
                                </button>
                                <button onClick={clearChat} className="p-2 hover:bg-red-500/10 rounded-full hover:text-red-500 transition-colors" title="Clear Chat">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[url('/chat-bg.png')] bg-repeat bg-opacity-5">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Send size={24} className="-ml-1 text-white/50" />
                                    </div>
                                    <p className="text-sm">No messages yet.</p>
                                    <p className="text-xs">Send a message to start chatting!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.sender_id === user.id
                                            ? 'bg-accent text-black rounded-tr-sm'
                                            : 'bg-[#1f1f1f] text-white rounded-tl-sm border border-white/5'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-[9px] mt-1 text-right ${msg.sender_id === user.id ? 'text-black/60' : 'text-gray-500'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className="p-4 bg-background border-t border-white/10 shrink-0">
                            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-full px-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
                                <input
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
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-500 bg-background/50">
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

export default Messages;
