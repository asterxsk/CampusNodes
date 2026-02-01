import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Shield, Trophy, UserPlus, Search, UserCheck, Check, X, UserMinus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const Connections = () => {
    const { user } = useAuth();
    const { openAuthModal } = useUI();
    const navigate = useNavigate();

    // State
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(null);
    const [removeId, setRemoveId] = useState(null); // For remove confirmation
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch All Friendships (Accepted & Pending)
            // If internal user is null, we can't fetch friendships relevant to them, 
            // but we can still fetch suggestions (all profiles).
            let friendships = [];
            if (user) {
                const { data, error: friendError } = await supabase
                    .from('friendships')
                    .select('*')
                    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
                if (friendError) throw friendError;
                friendships = data || [];
            }

            // 2. Fetch Profiles for Suggestions (Limit 50 for now)
            const { data: allProfiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .limit(50);

            if (profileError) throw profileError;

            if (!user) {
                // If not logged in, everyone is a "suggestion"
                setSuggestions(allProfiles);
                setFriends([]);
                return;
            }

            // --- Process Friends ---
            const accepted = friendships.filter(f => f.status === 'accepted');
            const friendIds = accepted.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id);

            const myFriends = allProfiles.filter(p => friendIds.includes(p.id));
            const myFriendsWithIds = myFriends.map(p => {
                const f = accepted.find(rel => rel.user1_id === p.id || rel.user2_id === p.id);
                return { ...p, friendship_id: f?.id };
            });
            setFriends(myFriendsWithIds);

            // --- Process Suggestions (Exclude Self & Friends) ---
            const pendingSent = friendships.filter(f => f.status === 'pending' && f.user1_id === user.id).map(f => f.user2_id);
            const pendingReceived = friendships.filter(f => f.status === 'pending' && f.user2_id === user.id).map(f => f.user1_id);

            const myPendingRequests = allProfiles.filter(p => pendingReceived.includes(p.id));
            setPendingRequests(myPendingRequests);

            const discoverList = allProfiles.filter(p =>
                p.id !== user.id &&
                !friendIds.includes(p.id) &&
                !pendingReceived.includes(p.id) // Don't show pending requests in suggestions
            ).map(p => {
                let status = 'none';
                if (pendingSent.includes(p.id)) status = 'sent';
                return { ...p, status };
            });

            setSuggestions(discoverList);

        } catch (err) {
            console.error("Error fetching connections:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const channel = supabase.channel('connections_page_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => fetchData())
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [user]);

    const handleConnect = async (targetId) => {
        if (!user) return openAuthModal();
        setProcessing(targetId);
        try {
            const { error } = await supabase.from('friendships').insert({ user1_id: user.id, user2_id: targetId, status: 'pending' });
            if (error) throw error;
            fetchData();
        } catch (e) { console.error(e); alert("Action failed"); }
        finally { setProcessing(null); }
    };

    const handleAccept = async (targetId) => {
        setProcessing(targetId);
        try {
            // We need to find the specific friendship ID or use query
            const { error } = await supabase.from('friendships')
                .update({ status: 'accepted' })
                .eq('user1_id', targetId) // They sent it to me
                .eq('user2_id', user.id);
            if (error) throw error;
            fetchData();
        } catch (e) { console.error(e); }
        finally { setProcessing(null); }
    };

    const handleDecline = async (targetId) => {
        setProcessing(targetId);
        try {
            const { error } = await supabase.from('friendships')
                .delete()
                .eq('user1_id', targetId)
                .eq('user2_id', user.id); // They sent it to me
            if (error) throw error;
            fetchData();
        } catch (e) { console.error(e); }
        finally { setProcessing(null); }
    };

    const handleRemoveClick = (friendshipId, e) => {
        const button = e.currentTarget;
        const card = button.closest('.group');
        if (card) {
            const rect = card.getBoundingClientRect();
            // Position above the card, centered horizontally relative to card or specific offset
            // Logic from Friends.jsx: left + width/2 - 105
            setPopoverPos({
                top: rect.top - 60,
                left: rect.left + (rect.width / 2) - 105
            });
        } else {
            const rect = button.getBoundingClientRect();
            setPopoverPos({ top: rect.top - 60, left: rect.left - 100 });
        }
        setRemoveId(friendshipId);
    };

    const confirmRemove = async () => {
        if (!removeId) return;
        try {
            await supabase.from('friendships').delete().eq('id', removeId);
            setRemoveId(null);
            fetchData();
        } catch (e) { console.error(e); }
    };

    const filteredSuggestions = suggestions.filter(u =>
        (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-5xl font-display font-bold text-white mb-4">Network & Circle</h1>
                    <p className="text-gray-400">Manage your close circle and discover new connections.</p>
                </header>

                {/* Section 1: My Circle (Friends) */}
                {user && (
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="text-accent" size={24} />
                            <h2 className="text-2xl font-bold text-white">Your Circle ({friends.length})</h2>
                        </div>

                        {friends.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {friends.map(friend => (
                                    <div key={friend.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-800 rounded-full border border-white/20 overflow-hidden">
                                                {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{friend.first_name?.[0]}</div>}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">{friend.first_name} {friend.last_name}</h3>
                                                <p className="text-gray-400 text-xs">{friend.role || 'Student'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleRemoveClick(friend.friendship_id, e)}
                                            className="p-2 bg-white/5 text-gray-400 rounded-full hover:bg-red-600 hover:text-white transition-all opacity-100"
                                            title="Remove Connection"
                                        >
                                            <UserMinus size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-gray-500">
                                You haven't connected with anyone yet.
                            </div>
                        )}
                    </section>
                )}

                {/* Section 2: Pending Requests */}
                {user && pendingRequests.length > 0 && (
                    <section className="mb-16 animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <UserCheck className="text-yellow-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">Pending Requests ({pendingRequests.length})</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingRequests.map(request => (
                                <div key={request.id} className="bg-white/5 border border-yellow-500/20 p-5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-800 rounded-full border border-white/20 overflow-hidden">
                                            {request.avatar_url ? <img src={request.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{request.first_name?.[0]}</div>}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{request.first_name} {request.last_name}</h3>
                                            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Wants to join</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(request.id)}
                                            className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500 hover:text-black transition-colors"
                                            title="Accept"
                                            disabled={processing === request.id}
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDecline(request.id)}
                                            className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                            title="Decline"
                                            disabled={processing === request.id}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section 3: Discover (Suggestions) */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <Search className="text-purple-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">Discover People</h2>
                        </div>
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded-full px-4 py-2 pl-10 text-white focus:outline-none focus:border-accent"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSuggestions.map(user => (
                                <div key={user.id} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-accent/50 transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-gray-800 rounded-full border border-white/20 overflow-hidden">
                                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{user.first_name?.[0]}</div>}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{user.first_name} {user.last_name}</h3>
                                            <p className="text-accent text-xs font-bold uppercase tracking-wider">{user.role || 'Student'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-end">
                                        <Button
                                            onClick={() => handleConnect(user.id)}
                                            variant={user.status === 'sent' || user.status === 'accepted' ? 'outline' : 'primary'}
                                            disabled={user.status === 'sent' || processing === user.id}
                                            className="px-6 py-2 text-sm"
                                        >
                                            {processing === user.id ? '...' :
                                                user.status === 'sent' ? 'Requested' :
                                                    user.status === 'received' ? 'Accept Request' :
                                                        'Connect'
                                            }
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Popover Pill (Replaces Modal) */}
                {removeId && (
                    <>
                        <div className="fixed inset-0 z-[99] bg-transparent" onClick={() => setRemoveId(null)} />
                        <div
                            className="fixed z-[100] bg-black border border-white/20 p-2 pl-4 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] animate-fade-in"
                            style={{ top: popoverPos.top, left: popoverPos.left }}
                        >
                            <span className="text-xs font-bold text-white whitespace-nowrap">Remove Connection?</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={confirmRemove}
                                    className="p-1.5 bg-green-500 text-black rounded-full hover:scale-110 transition-transform shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                    title="Confirm"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={() => setRemoveId(null)}
                                    className="p-1.5 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                    title="Cancel"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Connections;
