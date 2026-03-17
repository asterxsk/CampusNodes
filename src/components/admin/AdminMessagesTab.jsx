import React, { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import { Search, Send, Loader2, CheckCircle2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useAdminFetch from '../../hooks/useAdminFetch';
import AdminSearchInput from './AdminSearchInput';
import AdminLoadingSpinner from './AdminLoadingSpinner';

const ADMIN_SENDER_ID = '00000000-0000-0000-0000-000000000000'; // System constant

const AdminMessagesTab = () => {
    const toast = useToast();
    const { data: users, loading } = useAdminFetch(
        'profiles',
        'first_name',
        'asc',
        'id, first_name, last_name, avatar_url, role',
        true
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [sending, setSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!selectedUser || !messageContent.trim()) return;

        setSending(true);
        setSuccessMsg('');

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: ADMIN_SENDER_ID,
                    receiver_id: selectedUser.id,
                    content: messageContent.trim()
                });

            if (error) throw error;

            setSuccessMsg('Test message sent successfully!');
            setMessageContent('');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Failed to send admin message:', err);
            toast.error('Error sending message. Check if the reserved UUID exists in profiles.');
        } finally {
            setSending(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(u =>
            (u.first_name || '').toLowerCase().includes(term) ||
            (u.last_name || '').toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    return (
        <div className="h-full flex flex-col pt-2 pb-6">
            <h3 className="text-xl font-bold text-white mb-6">Platform Communications</h3>

            <div className="flex gap-6 h-[500px]">
                {/* User Selection Sidebar */}
                <div className="w-1/3 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-inner">
                    <div className="p-4 border-b border-white/10 shrink-0">
                        <AdminSearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search recipients..."
                            width="w-full"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <AdminLoadingSpinner size="sm" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                {searchTerm ? 'No users found matching your search.' : 'No users found'}
                            </div>
                        ) : (
                            filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full text-left flex items-center gap-3 p-3 transition-colors border-l-2 ${selectedUser?.id === user.id
                                        ? 'bg-accent/10 border-accent'
                                        : 'border-transparent hover:bg-white/5'
                                        }`}
                                >
                                    <Avatar url={user.avatar_url} firstName={user.first_name} size="sm" />
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-medium text-white truncate">{user.first_name} {user.last_name}</div>
                                        <div className="text-xs text-gray-500 truncate">{user.role || 'Student'}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Composer Area */}
                <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-2xl p-6">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-16 h-16 rounded-full border border-dashed border-gray-600 flex items-center justify-center mb-4">
                                <Send size={24} className="text-gray-600 opacity-50 ml-1" />
                            </div>
                            <p>Select a user to send a test message</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex items-center gap-3 pb-4 border-b border-white/10 shrink-0">
                                <div className="text-sm text-gray-400">Sending to:</div>
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                    <Avatar url={selectedUser.avatar_url} firstName={selectedUser.first_name} size="xs" />
                                    <span className="text-sm font-medium text-white">{selectedUser.first_name} {selectedUser.last_name}</span>
                                </div>
                            </div>

                            <form onSubmit={handleSendMessage} className="flex-1 flex flex-col shrink-0 min-h-0">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Message Content</label>
                                <textarea
                                    className="w-full flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent resize-none min-h-[150px]"
                                    placeholder="Type your official CampusNodes broadcast message here..."
                                    value={messageContent}
                                    onChange={e => setMessageContent(e.target.value)}
                                    required
                                />

                                <div className="mt-4 flex items-center justify-between shrink-0">
                                    <div className="text-sm">
                                        {successMsg ? (
                                            <span className="text-green-400 flex items-center gap-2 animate-fade-in">
                                                <CheckCircle2 size={16} /> {successMsg}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Message will be sent with CampusNodes verification badge.</span>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sending || !messageContent.trim()}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-white rounded-lg font-medium transition-colors"
                                    >
                                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessagesTab;
