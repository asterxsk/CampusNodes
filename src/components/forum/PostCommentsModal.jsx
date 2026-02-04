import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useToast } from '../../context/ToastContext';

// Utility for relative time (duplicated to avoid circular deps or verify if utils exist)
const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
};

const PostCommentsModal = ({ postId, onClose }) => {
    const { user } = useAuth();
    const { openAuthModal } = useUI();
    const toast = useToast();

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const bottomRef = useRef(null);

    // Fetch comments
    const fetchComments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('post_comments')
                .select(`
                    *,
                    profiles:user_id (
                        first_name,
                        last_name,
                        avatar_url
                    )
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComments(data || []);

            // Scroll to bottom on load if there are comments
            if (data?.length > 0) {
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (postId) fetchComments();

        // Realtime subscription for this post's comments
        const channel = supabase
            .channel(`comments_${postId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'post_comments',
                filter: `post_id=eq.${postId}`
            }, () => {
                fetchComments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [postId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!user) return openAuthModal();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content: newComment.trim()
                });

            if (error) throw error;
            setNewComment('');
            // Optional: fetchComments handled by realtime, but optimistic update or manual fetch is safer for UX immediacy
            // fetchComments(); 
        } catch (err) {
            console.error("Error posting comment:", err);
            toast.error('Failed to post comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-surface border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface/95 backdrop-blur z-10">
                        <h3 className="text-lg font-bold text-white">Comments</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Comments List (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[50vh] md:min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/50"></div>
                            </div>
                        ) : comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-white/10">
                                        {comment.profiles?.avatar_url ? (
                                            <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-white bg-slate-600">
                                                {comment.profiles?.first_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-bold text-white">
                                                    {comment.profiles?.first_name} {comment.profiles?.last_name}
                                                </span>
                                                <span className="text-[10px] text-gray-500">{timeAgo(comment.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 opacity-70">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <User size={32} />
                                </div>
                                <p className="text-sm">No comments yet.</p>
                                <p className="text-xs">Be the first to share your thoughts!</p>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Sticky Input Footer */}
                    <div className="p-4 bg-surface border-t border-white/5 pb-safe">
                        <form onSubmit={handlePostComment} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-white/10 hidden sm:block">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-white">
                                        <User size={14} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full bg-black/50 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || isSubmitting}
                                    className="absolute right-1.5 top-1.5 p-1.5 bg-accent text-black rounded-full disabled:opacity-50 hover:scale-105 transition-all"
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <Send size={16} className="ml-0.5" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PostCommentsModal;
