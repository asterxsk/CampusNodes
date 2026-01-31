import React, { useEffect, useState } from 'react';
import anime from 'animejs/lib/anime.es.js';
import Button from '../components/ui/Button';
import { Shield, Trophy, UserPlus, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Connections = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Try fetching from profiles table
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .limit(20);

                if (error || !data || data.length === 0) {
                    throw new Error("No data or error");
                }
                setUsers(data);
            } catch (err) {
                console.log("Error fetching users", err);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl border border-white/20">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.first_name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                user.first_name ? user.first_name[0] : 'U'
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{user.first_name} {user.last_name}</h3>
                                            <p className="text-accent text-xs uppercase tracking-wider font-bold mb-1">{user.role || 'Student'}</p>
                                            <div className="flex gap-2 text-[10px] text-gray-400">
                                                {user.skills && user.skills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="bg-white/5 px-2 py-0.5 rounded-sm">{skill}</span>
                                                ))}
                                            </div>
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
                                    <Button variant="outline" className="px-4 py-1.5 text-xs h-auto">
                                        Connect
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
