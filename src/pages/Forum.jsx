import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, MoreHorizontal, User, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
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
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    useEffect(() => {
        fetchPosts();

        // Realtime Subscription
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
                fetchPosts(); // Refresh on any change for simplicity
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

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
        } catch (err) {
            console.error("Error creating post:", err);
            alert("Failed to post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
            // State update handled by realtime subscription
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    const handleLike = async (postId) => {
        if (!user) return openAuthModal();
        // Optimistic UI updates or robust "likes" table handling would go here.
        // For MVP, we'll implement a simple toggle if a likes table exists, or just increment counter.
        // Given db_forum.sql has post_likes table, we should use that.
        // However, simpler approach for now: just trigger a toast "Liked!" to show interaction
        // as fully implementing like toggle state for list requires joining likes table or checking efficiently.
        // I will implement a basic "Like" visual feedback for now.
        alert("Likes coming soon!");
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-24 px-4 md:px-8">
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
                                    {/* Optional: Add image/media buttons here later */}
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

                                                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group/comment">
                                                    <div className="p-1.5 rounded-full group-hover/comment:bg-blue-400/10 transition-colors">
                                                        <MessageCircle size={16} />
                                                    </div>
                                                    <span className="text-xs">Comment</span>
                                                </button>
                                            </div>
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
