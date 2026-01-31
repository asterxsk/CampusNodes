import React, { useEffect, useState } from 'react';
import anime from 'animejs/lib/anime.es.js';
import Button from '../components/ui/Button';
import { Shield, Trophy, UserPlus, Search, UserCheck, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const Connections = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(null); // ID of user being processed

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // 1. Fetch profiles (limit 50 for now)
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .limit(50);

                if (profileError) throw profileError;

                let usersWithStatus = profiles;

                // 2. If logged in, fetch friendships to determine status
                if (user) {
                    const { data: friendships, error: friendError } = await supabase
                        .from('friendships')
                        .select('*')
                        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

                    if (!friendError && friendships) {
                        usersWithStatus = profiles.map(profile => {
                            if (profile.id === user.id) return null; // Exclude self

                            const friendship = friendships.find(f =>
                                (f.user1_id === user.id && f.user2_id === profile.id) ||
                                (f.user2_id === user.id && f.user1_id === profile.id)
                            );

                            let status = 'none';
                            if (friendship) {
                                if (friendship.status === 'accepted') {
                                    status = 'accepted';
                                } else if (friendship.status === 'pending') {
                                    status = friendship.user1_id === user.id ? 'sent' : 'received';
                                }
                            }
                            return { ...profile, status };
                        }).filter(Boolean); // Remove nulls (self)
                    }
                }

                setUsers(usersWithStatus);
            } catch (err) {
                console.error("Error fetching users", err);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    const handleConnect = async (targetId) => {
        if (!user) return;
        setProcessing(targetId);
        try {
            const { error } = await supabase.from('friendships').insert({
                user1_id: user.id,
                user2_id: targetId,
                status: 'pending' // Default, but being explicit
            });

            if (error) throw error;

            // Optimistic update
            setUsers(prev => prev.map(u =>
                u.id === targetId ? { ...u, status: 'sent' } : u
            ));
        } catch (err) {
            console.error("Error sending request:", err);
            alert("Could not check connectivity.");
        } finally {
            setProcessing(null);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getButtonContent = (status, userId) => {
        if (processing === userId) return <span className="animate-pulse">...</span>;

        switch (status) {
            case 'accepted':
                return <><UserCheck size={14} className="mr-1" /> Connected</>;
            case 'sent':
                return <><Clock size={14} className="mr-1" /> Requested</>;
            case 'received':
                return 'Accept Request'; // TODO: Implement Accept logic if needed here, or redirect
            default:
                return 'Connect';
        }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-display font-bold text-white mb-2">Add Connections</h1>
                        <p className="text-gray-400">Discover and connect with students across campus.</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 pl-12 text-white focus:outline-none focus:border-white/30 transition-colors"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((profile) => (
                            <div key={profile.id} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl border border-white/20 overflow-hidden">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt={profile.first_name} className="w-full h-full object-cover" />
                                            ) : (
                                                profile.first_name ? profile.first_name[0] : 'U'
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{profile.first_name} {profile.last_name}</h3>
                                            <p className="text-accent text-xs uppercase tracking-wider font-bold mb-1">{profile.role || 'Student'}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/20">
                                        <UserPlus size={20} />
                                    </button>
                                </div>

                                <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                        <Shield size={12} className="text-green-500" />
                                        <span>Verified Student</span>
                                    </div>
                                    <Button
                                        onClick={() => handleConnect(profile.id)}
                                        disabled={profile.status === 'sent' || profile.status === 'accepted' || processing === profile.id}
                                        variant={profile.status === 'sent' || profile.status === 'accepted' ? 'outline' : 'primary'}
                                        className={`px-4 py-1.5 text-xs h-auto min-w-[100px] ${profile.status === 'sent' ? 'opacity-70' : ''}`}
                                    >
                                        {getButtonContent(profile.status, profile.id)}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Connections;
