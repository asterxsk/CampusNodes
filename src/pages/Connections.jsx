import React, { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { Shield, Trophy, UserPlus, Search, UserCheck, Check, X, UserMinus, Users, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/ui/Skeleton';
import anime from 'animejs/lib/anime.es.js';
import DiscoverPeople from '../components/social/DiscoverPeople';

const ConnectionCardSkeleton = () => (
  <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full border-none" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 rounded w-3/4 border-none" />
        <Skeleton className="h-3 rounded w-1/2 border-none" />
      </div>
    </div>
  </div>
);

const Connections = () => {
  const { user } = useAuth();

  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [removeId, setRemoveId] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const fetchData = React.useCallback(async () => {
    try {
      let friendships = [];
      if (user) {
        const { data, error: friendError } = await supabase
          .from('friendships')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        if (friendError) throw friendError;
        friendships = data || [];
      }

      let query = supabase.from('profiles').select('*').limit(50);
      if (user) query = query.neq('id', user.id);

      const { data: allProfiles, error: profileError } = await query;

      if (profileError) throw profileError;

      const profilesData = allProfiles || [];

      if (!user) {
        setFriends([]);
        return;
      }

      const accepted = friendships.filter(f => f.status === 'accepted');
      const friendIds = accepted.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id);

      const myFriends = profilesData.filter(p => friendIds.includes(p.id));
      const myFriendsWithIds = myFriends.map(p => {
        const f = accepted.find(rel => rel.user1_id === p.id || rel.user2_id === p.id);
        return { ...p, friendship_id: f?.id };
      });
      setFriends(myFriendsWithIds);

      const pendingReceived = friendships.filter(f => f.status === 'pending' && f.user2_id === user.id).map(f => f.user1_id);

      setPendingRequests(profilesData.filter(p => pendingReceived.includes(p.id)));

    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('connections_page_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Header slides in naturally with page transition


  useEffect(() => {
    if (loading) return;
    anime({
      targets: '.connection-card',
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(80, { start: 400 }),
      duration: 800,
      easing: 'easeOutExpo'
    });
  }, [loading]);

  // handleConnect removed (moved to DiscoverPeople)

  const handleAccept = async (targetId) => {
    setProcessing(targetId);
    try {
      const { error } = await supabase.from('friendships')
        .update({ status: 'accepted' })
        .eq('user1_id', targetId)
        .eq('user2_id', user.id);
      if (error) throw error;
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (targetId) => {
    setProcessing(targetId);
    try {
      const { error } = await supabase.from('friendships')
        .delete()
        .eq('user1_id', targetId)
        .eq('user2_id', user.id);
      if (error) throw error;
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveClick = (friendshipId, e) => {
    if (!friendshipId) return;

    const button = e.currentTarget;
    const card = button.closest('.group');
    const rect = card ? card.getBoundingClientRect() : button.getBoundingClientRect();

    setPopoverPos(card
      ? { top: rect.top - 60, left: rect.left + (rect.width / 2) - 105 }
      : { top: rect.top - 60, left: rect.left - 100 }
    );
    setRemoveId(friendshipId);
  };

  const confirmRemove = async () => {
    if (!removeId) return;

    try {
      const friendToRemove = friends.find(f => f.friendship_id === removeId);
      const friendId = friendToRemove?.id;

      const { error: deleteError } = await supabase
        .from('friendships')
        .delete()
        .eq('id', removeId);

      if (deleteError) {
        console.error('Error deleting friendship:', deleteError);
        alert('Failed to remove friend. Please try again.');
        return;
      }

      if (friendId && user) {
        try {
          await Promise.all([
            supabase.from('messages').delete().eq('sender_id', user.id).eq('receiver_id', friendId),
            supabase.from('messages').delete().eq('sender_id', friendId).eq('receiver_id', user.id)
          ]);
        } catch (msgErr) {
          console.warn('Could not cleanup messages:', msgErr);
        }
      }

      setFriends(prev => prev.filter(f => f.friendship_id !== removeId));
      setRemoveId(null);
      setTimeout(() => fetchData(), 500);
    } catch (e) {
      console.error('Error in confirmRemove:', e);
      alert('An error occurred. Please try again.');
    }
  };

  // filteredSuggestions removed (moved to DiscoverPeople)

  return (
    <div className="min-h-screen bg-background pt-4 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-display font-bold text-white mb-4">Network & Circle</h1>
          <p className="text-gray-400">Manage your close circle and discover new connections.</p>
        </header>

        {user && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="text-accent" size={24} />
              <h2 className="text-2xl font-bold text-white">Your Circle ({friends.length})</h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <ConnectionCardSkeleton key={i} />)}
              </div>
            ) : friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map(friend => (
                  <div key={friend.id} className="connection-card opacity-0 bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar url={friend.avatar_url} firstName={friend.first_name} size="md" />
                      <div>
                        <h3 className="text-white font-bold">{friend.first_name} {friend.last_name}</h3>
                        <p className="text-gray-400 text-xs">{friend.role || 'Student'}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemoveClick(friend.friendship_id, e)}
                      className="p-2 bg-white/5 text-gray-400 rounded-full hover:bg-red-600 hover:text-white transition-all"
                      title="Remove Connection"
                    >
                      <UserMinus size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <UserPlus size={32} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Your Circle is Empty</h3>
                <p className="text-gray-400 mb-4 max-w-md mx-auto">
                  Connect with classmates, seniors, and friends to build your network on campus.
                </p>
                <p className="text-sm text-accent">Scroll down to discover people</p>
              </div>
            )}
          </section>
        )}

        {user && pendingRequests.length > 0 && (
          <section className="mb-16 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="text-yellow-400" size={24} />
              <h2 className="text-2xl font-bold text-white">Pending Requests ({pendingRequests.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map(request => (
                <div key={request.id} className="connection-card opacity-0 bg-white/5 border border-yellow-500/20 p-5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar url={request.avatar_url} firstName={request.first_name} size="md" />
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

        <DiscoverPeople />

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
