import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, ChevronLeft, Minimize2, Maximize2, Trash2, Clock, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { encryptMessage, decryptMessage } from '../../lib/encryption';
import { useUI } from '../../context/UIContext';

const ChatWidget = () => {
    const { user } = useAuth();
    const { isChatOpen, openChat, closeChat, addUnreadSender, removeUnreadSender, unreadSenders } = useUI();
    const [activeChat, setActiveChat] = useState(null); // The friend user object
    const [friends, setFriends] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Global Listener for Unread Badge
    useEffect(() => {
        if (!user) return;
        const channel = supabase
            .channel('global_chat_listener')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, (payload) => {
                // If chat is closed OR (chat is open BUT this message is NOT from the active person)
                if (!isChatOpen || (activeChat && activeChat.id !== payload.new.sender_id) || !activeChat) {
                    addUnreadSender(payload.new.sender_id);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, isChatOpen, activeChat]);

    // Clear unread when opening a chat
    useEffect(() => {
        if (activeChat) {
            removeUnreadSender(activeChat.id);
        }
    }, [activeChat]);

    useEffect(() => {
        if (isChatOpen && user) {
            fetchFriends();
        }
    }, [isChatOpen, user]);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.id);
            const channel = supabase
                .channel(`chat:${activeChat.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${activeChat.id}` // Listen for messages FROM them
                }, (payload) => {
                    if (payload.new.receiver_id === user.id) {
                        const decryptedContent = decryptMessage(payload.new.content, payload.new.sender_id, payload.new.receiver_id);
                        const msgWithDecrypted = { ...payload.new, content: decryptedContent };
                        setMessages(prev => [...prev, msgWithDecrypted]);
                        scrollToBottom();
                        // If we are viewing this chat, don't mark unread.
                        // But global listener might have fired? 
                        // Actually global listener has check for activeChat.
                    }
                })
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${user.id}` // Listen for my own messages (if sent from another device)
                }, (payload) => {
                    if (payload.new.receiver_id === activeChat.id) {
                        const decryptedContent = decryptMessage(payload.new.content, payload.new.sender_id, payload.new.receiver_id);
                        const msgWithDecrypted = { ...payload.new, content: decryptedContent };
                        setMessages(prev => {
                            if (prev.find(m => m.id === payload.new.id)) return prev;
                            return [...prev, msgWithDecrypted];
                        });
                        scrollToBottom();
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [activeChat, user]);

    const fetchFriends = async () => {
        try {
            const { data: friendships, error } = await supabase
                .from('friendships')
                .select('*')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .eq('status', 'accepted');

            if (error) throw error;

            const friendIds = friendships.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id);
            if (friendIds.length === 0) {
                setFriends([]);
                return;
            }

            const { data: profiles } = await supabase.from('profiles').select('*').in('id', friendIds);
            setFriends(profiles || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (friendId) => {
        try {
            setLoading(true);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
                .gt('created_at', oneDayAgo)
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) throw error;

            // Filter deleted messages and Decrypt
            const visibleMessages = data.filter(msg => {
                if (msg.sender_id === user.id && msg.deleted_by_sender) return false;
                if (msg.receiver_id === user.id && msg.deleted_by_receiver) return false;
                return true;
            }).map(msg => ({
                ...msg,
                content: decryptMessage(msg.content, msg.sender_id, msg.receiver_id)
            }));

            setMessages(visibleMessages || []);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = async () => {
        if (!activeChat || !confirm("Clear chat history? This cannot be undone.")) return;

        try {
            // Mark Sent messages as deleted
            await supabase.from('messages')
                .update({ deleted_by_sender: true })
                .eq('sender_id', user.id)
                .eq('receiver_id', activeChat.id);

            // Mark Received messages as deleted
            await supabase.from('messages')
                .update({ deleted_by_receiver: true })
                .eq('receiver_id', user.id)
                .eq('sender_id', activeChat.id);

            setMessages([]);
        } catch (err) {
            console.error("Failed to clear chat", err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const content = newMessage.trim();
        setNewMessage(''); // optimistic clear

        // Optimistic Update (Show plain text)
        const tempMsg = {
            id: Date.now(),
            sender_id: user.id,
            receiver_id: activeChat.id,
            content: content,
            created_at: new Date().toISOString(),
            is_temp: true
        };
        setMessages(prev => [...prev, tempMsg]);
        scrollToBottom();

        try {
            const encryptedContent = encryptMessage(content, user.id, activeChat.id);
            const { error, data } = await supabase.from('messages').insert({
                sender_id: user.id,
                receiver_id: activeChat.id,
                content: encryptedContent // Send Encrypted
            }).select();

            if (error) throw error;

            // Replace temp with real (and decrypt the response just in case, though we know what we sent)
            // The server returns the encrypted content, so we need to decrypt it for the state if we were to use it directly
            // But since we did an optimistic update with the Real content, we simply swap the ID and keep the content
            // OR to be safe, we decrypt the return value to ensure consistency
            const returnedMsg = data[0];
            const decryptedReturnedMsg = {
                ...returnedMsg,
                content: decryptMessage(returnedMsg.content, returnedMsg.sender_id, returnedMsg.receiver_id)
            };

            setMessages(prev => prev.map(m => m.id === tempMsg.id ? decryptedReturnedMsg : m));

        } catch (err) {
            console.error("Failed to send", err);
            // Revert optimistic?
        }
    };

    if (!user) return null; // Only show for logged in users

    return (
        <>
            {/* Launcher Fab (Desktop Only - Mobile uses Bottom Bar) */}
            {!isChatOpen && (
                <button
                    onClick={openChat}
                    className="fixed z-[9990] bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-accent text-black rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] md:flex hidden items-center justify-center hover:scale-110 transition-transform hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                >
                    <MessageSquare size={24} />
                    {unreadSenders.size > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-black z-50">
                            <span className="text-[10px] font-bold text-white">{unreadSenders.size}</span>
                        </div>
                    )}
                </button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed z-[9999] bg-zinc-900 border border-white/20 shadow-2xl overflow-hidden
                                   inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[500px] md:rounded-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="h-16 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                            <div className="flex items-center gap-3">
                                {activeChat ? (
                                    <>
                                        <button onClick={() => setActiveChat(null)} className="md:hidden p-1 hover:bg-white/10 rounded-full">
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button onClick={() => setActiveChat(null)} className="hidden md:block p-1 hover:bg-white/10 rounded-full mr-1">
                                            <ChevronLeft size={18} />
                                        </button>
                                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                                            {activeChat.avatar_url ? (
                                                <img src={activeChat.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs">{activeChat.first_name?.[0]}</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{activeChat.first_name} {activeChat.last_name}</h3>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[10px] text-gray-400">Online</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                        <MessageSquare size={20} className="text-accent" />
                                        Messages <Lock size={12} className="text-green-500/50 ml-1" title="End-to-End Encrypted" />
                                    </h3>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {activeChat && (
                                    <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition-colors" title="Clear Chat">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button onClick={closeChat} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto bg-zinc-900/50 relative">
                            {/* Disappearing Pill */}
                            {activeChat && (
                                <div className="sticky top-4 z-10 flex justify-center w-full pointer-events-none mb-2">
                                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                                        <Clock size={12} className="text-accent" />
                                        <span className="text-[10px] text-white font-medium">1-Day Disappearing Messages</span>
                                    </div>
                                </div>
                            )}

                            {!activeChat ? (
                                /* Friend List */
                                <div className="p-4 space-y-2">
                                    {friends.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-10">
                                            <p>No friends yet.</p>
                                            <p className="text-xs">Connect with people to chat!</p>
                                        </div>
                                    ) : (
                                        friends.map(friend => (
                                            <button
                                                key={friend.id}
                                                onClick={() => setActiveChat(friend)}
                                                className="w-full p-3 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-colors text-left group border border-transparent hover:border-white/10 relative"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/10 group-hover:border-accent/50 transition-colors">
                                                    {friend.avatar_url ? (
                                                        <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20} /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white text-sm">{friend.first_name} {friend.last_name}</h4>
                                                    <p className="text-xs text-gray-500">Click to chat</p>
                                                </div>
                                                {/* Unread Badge for Friend */}
                                                {unreadSenders.has(friend.id) && (
                                                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : (
                                /* Chat Messages */
                                <div className="p-4 space-y-4 min-h-full flex flex-col justify-end">
                                    {messages.map((msg, idx) => (
                                        <div key={msg.id || idx} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === user.id
                                                    ? 'bg-accent text-black rounded-tr-sm'
                                                    : 'bg-white/10 text-white rounded-tl-sm border border-white/10'
                                                    }`}
                                            >
                                                <p>{msg.content}</p>
                                                <span className={`text-[9px] block mt-1 opacity-50 ${msg.sender_id === user.id ? 'text-black' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area (Only if Active Chat) */}
                        {activeChat && (
                            <form onSubmit={sendMessage} className="p-3 bg-black/50 border-t border-white/10 shrink-0 flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-9 h-9 bg-accent text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all font-bold"
                                >
                                    <Send size={16} className={newMessage.trim() ? 'ml-0.5' : ''} />
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
