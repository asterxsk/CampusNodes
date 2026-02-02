import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, MoreHorizontal, User, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';
import Button from '../components/ui/Button';

// Utility for relative time
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

const Forum = () => {
    const { user } = useAuth();
    const { openAuthModal } = useUI();
    const toast = useToast();
    const { showConfirm } = useModal();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Comments State
    const [activePostId, setActivePostId] = useState(null);
    const [comments, setComments] = useState({}); // { postId: [comments] }
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    // Initial Fetch
    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        first_name,
                        last_name,
                        avatar_url,
                        role
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (postId) => {
        setLoadingComments(true);
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
            setComments(prev => ({ ...prev, [postId]: data }));
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        fetchPosts();

        // Realtime Subscription
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
                fetchPosts();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, payload => {
                // Refresh comments if the active post is the one that got a new comment
                if (activePostId && payload.new.post_id === activePostId) {
                    fetchComments(activePostId);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activePostId]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!user) return openAuthModal();
        if (!newPostContent.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('posts')
                .insert({
                    user_id: user.id,
                    content: newPostContent.trim()
                });

            if (error) throw error;
            setNewPostContent('');
            toast.success('Post created successfully!');
        } catch (err) {
            console.error("Error creating post:", err);
            toast.error('Failed to post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        const confirmed = await showConfirm({
            title: 'Delete Post',
            message: 'Are you sure you want to delete this post? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
            toast.success('Post deleted successfully');
        } catch (err) {
            console.error("Error deleting post:", err);
            toast.error('Failed to delete post');
        }
    };

    const handleLike = async (postId) => {
        if (!user) return openAuthModal();
        toast.info('Likes coming soon!');
    };

    const toggleComments = (postId) => {
        if (activePostId === postId) {
            setActivePostId(null);
        } else {
            setActivePostId(postId);
            fetchComments(postId);
        }
    };

    const handlePostComment = async (e, postId) => {
        e.preventDefault();
        if (!user) return openAuthModal();
        if (!newComment.trim()) return;

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
            fetchComments(postId); // Refresh immediately
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-32 px-4 md:px-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-white">Campus Feed</h1>
                        <p className="text-gray-400 text-sm">See what's happening around campus.</p>
                    </div>
                </header>

                {/* Create Post Card */}
                <div className="bg-surface border border-white/10 rounded-2xl p-4 mb-8">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-white/10">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                    <User size={20} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[60px] text-base"
                                rows={2}
                            />
                            <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/5">
                                <div className="text-xs text-gray-500">
                                </div>
                                <Button
                                    onClick={handleCreatePost}
                                    disabled={!newPostContent.trim() || isSubmitting}
                                    className="px-4 py-1.5 h-8 text-xs rounded-full"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {posts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                    className="bg-surface border border-white/5 p-5 rounded-2xl group hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-white/10">
                                            {post.profiles?.avatar_url ? (
                                                <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br from-blue-500 to-purple-600">
                                                    {post.profiles?.first_name?.[0] || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm hover:underline cursor-pointer">
                                                        {post.profiles?.first_name} {post.profiles?.last_name}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span>@{post.profiles?.role || 'Student'}</span>
                                                        <span>•</span>
                                                        <span>{timeAgo(post.created_at)}</span>
                                                    </div>
                                                </div>

                                                {/* Options (Delete) */}
                                                {user && user.id === post.user_id && (
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-2 text-gray-200 text-[15px] whitespace-pre-wrap leading-relaxed">
                                                {post.content}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/5">
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors group/like"
                                                >
                                                    <div className="p-1.5 rounded-full group-hover/like:bg-red-500/10 transition-colors">
                                                        <Heart size={16} />
                                                    </div>
                                                    <span className="text-xs">Like</span>
                                                </button>

                                                <button
                                                    onClick={() => toggleComments(post.id)}
                                                    className={`flex items-center gap-2 transition-colors ${activePostId === post.id ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
                                                >
                                                    <div className="p-1.5 rounded-full hover:bg-blue-400/10 transition-colors">
                                                        <MessageCircle size={16} />
                                                    </div>
                                                    <span className="text-xs">Comment</span>
                                                </button>
                                            </div>

                                            {/* Comments Section */}
                                            <AnimatePresence>
                                                {activePostId === post.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                                            {/* Comment List */}
                                                            {loadingComments ? (
                                                                <div className="text-center text-xs text-gray-500 py-2">Loading comments...</div>
                                                            ) : (comments[post.id] || []).length > 0 ? (
                                                                (comments[post.id] || []).map((comment) => (
                                                                    <div key={comment.id} className="flex gap-3">
                                                                        <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden shrink-0">
                                                                            {comment.profiles?.avatar_url ? (
                                                                                <img src={comment.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-white bg-slate-600">
                                                                                    {comment.profiles?.first_name?.[0]}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-xs font-bold text-white">
                                                                                    {comment.profiles?.first_name} {comment.profiles?.last_name}
                                                                                </span>
                                                                                <span className="text-[10px] text-gray-500">{timeAgo(comment.created_at)}</span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-gray-500 italic">No comments yet.</p>
                                                            )}

                                                            {/* Add Comment Input */}
                                                            <form onSubmit={(e) => handlePostComment(e, post.id)} className="flex items-center gap-2 mt-2">
                                                                <input
                                                                    type="text"
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    placeholder="Write a comment..."
                                                                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/50"
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={!newComment.trim()}
                                                                    className="shrink-0 p-1.5 bg-accent text-black rounded-full disabled:opacity-50"
                                                                >
                                                                    <Send size={14} />
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {posts.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                <p>No posts yet. Be the first to say hello! 👋</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Forum;
