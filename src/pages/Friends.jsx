import React, { useEffect, useState } from 'react';
import { UserCheck, MessageSquare, Trash2, Check, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/ui/Button';

const Friends = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConnections = async () => {
        if (!user) return;
        try {
            setLoading(true);
            // 1. Get all friendships (pending received OR accepted involved)
            const { data: friendships, error: friendshipError } = await supabase
                .from('friendships')
                .select('*')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

            if (friendshipError) throw friendshipError;

            if (!friendships || friendships.length === 0) {
                setFriends([]);
                setRequests([]);
                setLoading(false);
                return;
            }

            // 2. Separate IDs into "Requests Received" and "Friends"
            // Requests: status='pending' AND user2_id == me
            // Friends: status='accepted' AND (user1 == me OR user2 == me)
            const pendingFriendships = friendships.filter(f => f.status === 'pending' && f.user2_id === user.id);
            const acceptedFriendships = friendships.filter(f => f.status === 'accepted');

            // 3. Collect unique Profile IDs needed
            const requestProfileIds = pendingFriendships.map(f => f.user1_id);
            const friendProfileIds = acceptedFriendships.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id);

            const allIds = [...new Set([...requestProfileIds, ...friendProfileIds])];

            if (allIds.length === 0) {
                setFriends([]);
                setRequests([]);
                setLoading(false);
                return;
            }

            // 4. Fetch Profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', allIds);

            if (profilesError) throw profilesError;

            // 5. Merge Data
            const requestsFull = pendingFriendships.map(f => {
                const profile = profiles.find(p => p.id === f.user1_id);
                return profile ? { ...profile, friendship_id: f.id } : null;
            }).filter(Boolean);

            const friendsFull = acceptedFriendships.map(f => {
                const partnerId = f.user1_id === user.id ? f.user2_id : f.user1_id;
                const profile = profiles.find(p => p.id === partnerId);
                return profile ? { ...profile, friendship_id: f.id } : null;
            }).filter(Boolean);

            setRequests(requestsFull);
            setFriends(friendsFull);

        } catch (err) {
            console.error("Error fetching connections:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [user]);

    const handleAccept = async (friendshipId) => {
        try {
            const { error } = await supabase
                .from('friendships')
                .update({ status: 'accepted' })
                .eq('id', friendshipId);

            if (error) throw error;
            // Refetch or optimistically update
            fetchConnections();
        } catch (e) {
            console.error("Error accepting:", e);
            alert("Failed to accept");
        }
    };

    const handleDecline = async (friendshipId) => {
        // Decline = Delete the request
        handleRemove(friendshipId);
    };

    const handleRemove = async (friendshipId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const { error } = await supabase
                .from('friendships')
                .delete()
                .eq('id', friendshipId);

            if (error) throw error;
            // Remove from local state immediately
            setFriends(prev => prev.filter(f => f.friendship_id !== friendshipId));
            setRequests(prev => prev.filter(r => r.friendship_id !== friendshipId));
        } catch (e) {
            console.error("Error removing:", e);
            alert("Failed to remove");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black pt-32 px-6 md:px-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-32 px-6 md:px-12 pb-20">
            <h1 className="text-5xl font-display font-bold text-white mb-4">Social Circle</h1>
            <p className="text-gray-400 mb-12">Manage your connections and requests.</p>

            {/* Friend Requests Section */}
            {requests.length > 0 && (
                <div className="mb-12 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-6 text-accent">
                        <Bell size={20} />
                        <h2 className="text-2xl font-bold text-white">Pending Requests ({requests.length})</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-between border-l-4 border-l-accent">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold overflow-hidden border border-white/10">
                                        {req.avatar_url ? (
                                            <img src={req.avatar_url} alt={req.first_name} className="w-full h-full object-cover" />
                                        ) : (
                                            req.first_name ? req.first_name[0] : 'U'
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{req.first_name || 'Unknown'} {req.last_name}</h3>
                                        <p className="text-gray-400 text-xs">Wants to connect</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(req.friendship_id)}
                                        className="p-2 bg-green-600/20 text-green-500 rounded-full hover:bg-green-600 hover:text-white transition-all"
                                        title="Accept"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDecline(req.friendship_id)}
                                        className="p-2 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all"
                                        title="Decline"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends Section */}
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <UserCheck size={20} className="text-gray-400" />
                Your Connections
            </h2>

            {friends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {friends.map((friend) => (
                        <div key={friend.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-4 relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center text-white font-bold overflow-hidden border border-white/10">
                                    {friend.avatar_url ? (
                                        <img src={friend.avatar_url} alt={friend.first_name} className="w-full h-full object-cover" />
                                    ) : (
                                        friend.first_name ? friend.first_name[0] : 'U'
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{friend.first_name} {friend.last_name}</h3>
                                    <p className="text-gray-400 text-xs">{friend.role || 'Student'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                                    <MessageSquare size={16} />
                                </button>
                                <button
                                    onClick={() => handleRemove(friend.friendship_id)}
                                    className="p-2 bg-white/5 text-gray-400 rounded-full hover:bg-red-600 hover:text-white transition-all"
                                    title="Remove Friend"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-12 py-12 border border-dashed border-white/10 rounded-xl">
                    <p className="mb-4">No friends added yet.</p>
                    <a href="#/connections" className="text-accent hover:underline">Go find people!</a>
                </div>
            )}
        </div>
    );
};

export default Friends;
