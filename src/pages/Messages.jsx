import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, User, Trash2, Lock } from 'lucide-react';
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
                .channel(`chat_mobile:${activeChat.id}`)
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

    return (
        <div className="min-h-screen bg-background pt-4 pb-28">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-20 px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                    {activeChat ? (
                        <>
                            <button onClick={() => setActiveChat(null)} className="p-2 -ml-2 hover:bg-white/10 rounded-full">
                                <ChevronLeft size={24} className="text-white" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                                {activeChat.avatar_url ? (
                                    <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                                        {activeChat.first_name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="font-bold text-white">{activeChat.first_name} {activeChat.last_name}</h1>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Lock size={10} /> End-to-end encrypted
                                </p>
                            </div>
                            <button onClick={clearChat} className="p-2 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400">
                                <Trash2 size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full">
                                <ChevronLeft size={24} className="text-white" />
                            </button>
                            <h1 className="text-xl font-bold text-white">Messages</h1>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            {!activeChat ? (
                // Friends List
                <div className="px-4 py-4 space-y-2">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading...</div>
                    ) : friends.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg">No friends yet.</p>
                            <p className="text-gray-500 text-sm mt-1">Connect with people to chat!</p>
                        </div>
                    ) : (
                        friends.map(friend => (
                            <button
                                key={friend.id}
                                onClick={() => setActiveChat(friend)}
                                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                                        {friend.avatar_url ? (
                                            <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                                                {friend.first_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    {unreadSenders.has(friend.id) && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-white">{friend.first_name} {friend.last_name}</h3>
                                    <p className="text-sm text-gray-500">{friend.role || 'Student'}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            ) : (
                // Chat View
                <div className="flex flex-col h-[calc(100vh-180px)]">
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <p>No messages yet.</p>
                                <p className="text-sm">Say hi! 👋</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.sender_id === user.id
                                        ? 'bg-accent text-black rounded-br-md'
                                        : 'bg-white/10 text-white rounded-bl-md'
                                        }`}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="px-4 py-3 bg-background border-t border-white/10">
                        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-2 bg-accent text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Messages;
