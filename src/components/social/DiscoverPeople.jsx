import React, { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import anime from 'animejs/lib/anime.es.js';

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

const DiscoverPeople = ({ className = "" }) => {
  const { user } = useAuth();
  const { openAuthModal } = useUI();
  
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(null);

  const fetchData = useCallback(async () => {
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
        setSuggestions(profilesData.map(p => ({ ...p, status: 'none' })));
        return;
      }

      const accepted = friendships.filter(f => f.status === 'accepted');
      const friendIds = accepted.map(f => f.user1_id === user.id ? f.user2_id : f.user1_id);
      
      const pendingSent = friendships.filter(f => f.status === 'pending' && f.user1_id === user.id).map(f => f.user2_id);
      const pendingReceived = friendships.filter(f => f.status === 'pending' && f.user2_id === user.id).map(f => f.user1_id);

      const discoverList = profilesData.filter(p =>
        p.id !== user.id &&
        !friendIds.includes(p.id) &&
        !pendingReceived.includes(p.id)
      ).map(p => ({
        ...p,
        status: pendingSent.includes(p.id) ? 'sent' : 'none'
      }));

      setSuggestions(discoverList);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('discover_people_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  useEffect(() => {
    if (!loading && suggestions.length > 0) {
      anime({
        targets: '.discover-card',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(80, { start: 100 }),
        duration: 800,
        easing: 'easeOutExpo'
      });
    }
  }, [loading, suggestions.length]);

  const handleConnect = async (targetId) => {
    if (!user) return openAuthModal();
    setProcessing(targetId);
    try {
      const { error } = await supabase.from('friendships').insert({ 
        user1_id: user.id, 
        user2_id: targetId, 
        status: 'pending' 
      });
      if (error) throw error;
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  const filteredSuggestions = suggestions.filter(u =>
    (`${u.first_name} ${u.last_name}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Search className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold text-white font-display">Discover People</h2>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/20 rounded-full px-4 py-2 pl-10 text-white focus:outline-none focus:border-accent transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <ConnectionCardSkeleton key={i} />)}
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2 font-display">
            {searchTerm ? 'No matches found' : 'No suggestions available'}
          </h3>
          <p className="text-gray-400 mb-4 max-w-xs mx-auto">
            {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new people to connect with'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-accent hover:text-accent/80 text-sm font-bold"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.map(userSuggestion => (
            <div key={userSuggestion.id} className="discover-card opacity-0 bg-white/5 border border-white/10 p-6 rounded-xl hover:border-accent/50 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <Avatar url={userSuggestion.avatar_url} firstName={userSuggestion.first_name} size="lg" />
                <div>
                  <h3 className="text-white font-bold text-lg font-display">{userSuggestion.first_name} {userSuggestion.last_name}</h3>
                  <p className="text-accent text-xs font-bold uppercase tracking-wider">{userSuggestion.role || 'Student'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <Button
                  onClick={() => handleConnect(userSuggestion.id)}
                  variant={userSuggestion.status === 'sent' || userSuggestion.status === 'accepted' ? 'outline' : 'primary'}
                  disabled={userSuggestion.status === 'sent' || processing === userSuggestion.id}
                  className="px-6 py-2 text-sm"
                >
                  {processing === userSuggestion.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : userSuggestion.status === 'sent' ? (
                    'Requested'
                  ) : (
                    'Connect'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverPeople;
