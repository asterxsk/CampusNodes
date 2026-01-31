import React from 'react';
import { UserCheck, MessageSquare } from 'lucide-react';

const Friends = () => {
    // Mock friends for now
    const friends = [
        { id: 1, name: 'Aarya Nadiger', role: 'Student', status: 'Online' },
        { id: 2, name: 'Rushi Shah', role: 'Student', status: 'Offline' },
    ];

    return (
        <div className="min-h-screen bg-black pt-32 px-6 md:px-12">
            <h1 className="text-5xl font-display font-bold text-white mb-12">Your Friends</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((friend) => (
                    <div key={friend.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                                {friend.name[0]}
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{friend.name}</h3>
                                <p className="text-gray-400 text-xs">{friend.role}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors">
                                <MessageSquare size={16} />
                            </button>
                            <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors cursor-default">
                                <UserCheck size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {friends.length === 0 && (
                <div className="text-center text-gray-500 mt-20">
                    <p>No friends yet. Go to "Connections" to find people!</p>
                </div>
            )}
        </div>
    );
};

export default Friends;
