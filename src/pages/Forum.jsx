import React, { useState, useEffect, useCallback, memo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, MessageCircle, User, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import PostCommentsModal from '../components/forum/PostCommentsModal';

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

// Memoized Post Card to prevent re-renders when modal opens
const PostCard = memo(({ post, user, onLike, onDelete, onToggleComments, hasLiked, likeCount, commentCount, topComment }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className="bg-surface border border-white/5 p-5 rounded-2xl group hover:bg-white/5 transition-colors"
        >
            <div className="flex gap-3">
                <div className="shrink-0">
                    <Avatar 
                        url={post.profiles?.avatar_url}
                        firstName={post.profiles?.first_name}
                        size="sm"
                        className="border border-white/10"
                    />
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
                                onClick={() => onDelete(post.id)}
                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                title="Delete post"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    {/* Post Content */}
                    <p className="mt-3 text-white whitespace-pre-wrap leading-relaxed">{post.content}</p>

                    {/* Engagement */}
                    <div className="mt-4 flex items-center gap-6">
                        <button
                            onClick={() => onLike(post.id)}
                            className={`flex items-center gap-2 text-sm transition-colors ${hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                        >
                            <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} />
                            <span>{likeCount || 0}</span>
                        </button>

                        <button
                            onClick={() => onToggleComments(post.id)}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-accent transition-colors"
                        >
                            <MessageCircle size={18} />
                            <span>{commentCount > 0 ? commentCount : 'Comment'}</span>
                        </button>
                    </div>

                    {/* Top Comment Preview */}
                    {topComment && (
                        <div
                            onClick={() => onToggleComments(post.id)}
                            className="mt-4 pt-3 border-t border-white/5 w-full text-left group/comment cursor-pointer"
                        >
                            <div className="flex gap-2 items-start">
                                <Avatar 
                                    url={topComment.profiles?.avatar_url}
                                    firstName={topComment.profiles?.first_name}
                                    size="xs"
                                    className="border border-white/10 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-white">{topComment.profiles?.first_name} {topComment.profiles?.last_name}</span>
                                        <span className="text-[10px] text-gray-500">{timeAgo(topComment.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-1 group-hover/comment:text-gray-300 transition-colors">{topComment.content}</p>
                                </div>
                            </div>
                            {commentCount > 1 && (
                                <p className="text-xs text-accent mt-2 pl-8 hover:underline">
                                    View all {commentCount} comments
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

const Forum = () => {
    const { user } = useAuth();
    const toast = useToast();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Comments State
    const [activePostId, setActivePostId] = useState(null);
    const [topComments, setTopComments] = useState({});

    // Likes State
    const [userLikes, setUserLikes] = useState(new Set());
    const [likeCounts, setLikeCounts] = useState({});
    const [commentCounts, setCommentCounts] = useState({});

    // Fetch posts with like counts and comment counts
    const fetchPosts = useCallback(async () => {
        try {
            // Fetch posts first
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (postsError) throw postsError;

            if (!postsData || postsData.length === 0) {
                setPosts([]);
                return;
            }

            // Get unique user_ids from posts
            const userIds = [...new Set(postsData.map(p => p.user_id))];
            
            // Fetch profiles separately
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, avatar_url, role')
                .in('id', userIds);

            if (profilesError) {
                console.error("Error fetching profiles:", profilesError);
            }

            // Create profile map
            const profileMap = {};
            profilesData?.forEach(profile => {
                profileMap[profile.id] = profile;
            });

            // Merge posts with profiles
            const mergedPosts = postsData.map(post => ({
                ...post,
                profiles: profileMap[post.user_id] || null
            }));

            setPosts(mergedPosts);

            // Fetch like counts and user likes
            const postIds = postsData.map(p => p.id);

            const { data: likesData } = await supabase
                .from('post_likes')
                .select('post_id, user_id')
                .in('post_id', postIds);

            const counts = {};
            const userLikedSet = new Set();
            
            likesData?.forEach(like => {
                counts[like.post_id] = (counts[like.post_id] || 0) + 1;
                if (user && like.user_id === user.id) {
                    userLikedSet.add(like.post_id);
                }
            });
            
            setLikeCounts(counts);
            setUserLikes(userLikedSet);

            // Get comment counts
            const { data: commentsData } = await supabase
                .from('post_comments')
                .select('post_id')
                .in('post_id', postIds);

            const commentCountsMap = {};
            commentsData?.forEach(comment => {
                commentCountsMap[comment.post_id] = (commentCountsMap[comment.post_id] || 0) + 1;
            });
            setCommentCounts(commentCountsMap);

            // Fetch top comments
            const { data: topCommentsData } = await supabase
                .from('post_comments')
                .select('*')
                .in('post_id', postIds)
                .order('created_at', { ascending: true });

            // Get user_ids from comments and fetch their profiles
            if (topCommentsData && topCommentsData.length > 0) {
                const commentUserIds = [...new Set(topCommentsData.map(c => c.user_id))];
                const { data: commentProfilesData } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name, avatar_url')
                    .in('id', commentUserIds);

                const commentProfileMap = {};
                commentProfilesData?.forEach(profile => {
                    commentProfileMap[profile.id] = profile;
                });

                // Merge comments with profiles
                const mergedComments = topCommentsData.map(comment => ({
                    ...comment,
                    profiles: commentProfileMap[comment.user_id] || null
                }));

                const topCommentsMap = {};
                mergedComments.forEach(comment => {
                    if (!topCommentsMap[comment.post_id]) {
                        topCommentsMap[comment.post_id] = comment;
                    }
                });
                setTopComments(topCommentsMap);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchPosts();

        // Realtime Subscription
        const channel = supabase
            .channel('forum_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
                fetchPosts();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => {
                fetchPosts();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => {
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchPosts]);

    const handleCreatePost = async () => {
        if (!user) return;
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
            toast.success('Post created!');
            fetchPosts();
        } catch (err) {
            console.error('Error creating post:', err);
            toast.error('Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!user) return;
        
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId)
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success('Post deleted');
            fetchPosts();
        } catch (err) {
            console.error('Error deleting post:', err);
            toast.error('Failed to delete post');
        }
    };

    const handleLike = async (postId) => {
        if (!user) {
            toast.error('Please sign in to like posts');
            return;
        }

        const isLiked = userLikes.has(postId);

        // Optimistic update
        setUserLikes(prev => {
            const newSet = new Set(prev);
            if (isLiked) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
        
        setLikeCounts(prev => ({
            ...prev,
            [postId]: (prev[postId] || 0) + (isLiked ? -1 : 1)
        }));

        try {
            if (isLiked) {
                await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id);
            } else {
                await supabase
                    .from('post_likes')
                    .insert({ post_id: postId, user_id: user.id });
            }
        } catch (err) {
            console.error('Error updating like:', err);
            // Revert optimistic update
            setUserLikes(prev => {
                const newSet = new Set(prev);
                if (isLiked) {
                    newSet.add(postId);
                } else {
                    newSet.delete(postId);
                }
                return newSet;
            });
            setLikeCounts(prev => ({
                ...prev,
                [postId]: (prev[postId] || 0) + (isLiked ? 1 : -1)
            }));
            toast.error('Failed to update like');
        }
    };

    const toggleComments = (postId) => {
        setActivePostId(postId);
    };

    return (
        <div className="min-h-screen bg-background pt-4 md:pt-24 pb-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto w-full">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-white">Campus Feed</h1>
                        <p className="text-gray-400 text-sm">See what&apos;s happening around campus.</p>
                    </div>
                </header>

                {/* Create Post Card */}
                <div className="bg-surface border border-white/10 rounded-2xl p-4 mb-8">
                    <div className="flex gap-4">
                        <Avatar
                            url={user?.user_metadata?.avatar_url}
                            firstName={user?.user_metadata?.first_name}
                            size="md"
                            className="shrink-0"
                        />
                        <div className="flex-1">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What&apos;s on your mind?"
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
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    user={user}
                                    onLike={handleLike}
                                    onDelete={handleDeletePost}
                                    onToggleComments={toggleComments}
                                    hasLiked={userLikes.has(post.id)}
                                    likeCount={likeCounts[post.id] || 0}
                                    commentCount={commentCounts[post.id] || 0}
                                    topComment={topComments[post.id]}
                                />
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

            {/* Comments Modal - Rendered outside main content to prevent re-renders */}
            {activePostId && (
                <PostCommentsModal
                    postId={activePostId}
                    onClose={() => setActivePostId(null)}
                />
            )}
        </div>
    );
};

export default Forum;
