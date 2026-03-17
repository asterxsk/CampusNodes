import React, { useState, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { AnimatePresence } from 'framer-motion';
import Avatar from '../ui/Avatar';
import { Search, Edit2, Trash2, ImageOff, Loader2 } from 'lucide-react';
import useAdminFetch from '../../hooks/useAdminFetch';
import AdminSearchInput from './AdminSearchInput';
import AdminLoadingSpinner from './AdminLoadingSpinner';

const AdminUsersTab = () => {
    const { showConfirm } = useModal();
    const toast = useToast();
    const { data: users, loading, fetch } = useAdminFetch(
        'profiles',
        'updated_at',
        'desc'
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Edit modal state
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', role: '' });

    const handleDeleteUser = async (userId) => {
        const confirmed = await showConfirm({
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This will also remove their posts and connections (if RLS/Cascades allow). This action CANNOT be undone.',
            confirmText: 'Delete User',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (!confirmed) return;

        setProcessingId(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            toast.success('Profile deleted successfully.');
            fetch();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemoveAvatar = async (userId) => {
        const confirmed = await showConfirm({
            title: 'Remove Profile Picture',
            message: "Remove this user's profile picture?",
            confirmText: 'Remove',
            cancelText: 'Cancel',
            variant: 'danger'
        });

        if (!confirmed) return;

        setProcessingId(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: null })
                .eq('id', userId);

            if (error) throw error;
            fetch();
            toast.success('Avatar removed successfully');
        } catch (error) {
            console.error('Error removing avatar:', error);
            toast.error('Failed to remove avatar.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setProcessingId('edit');
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: editForm.first_name,
                    last_name: editForm.last_name,
                    role: editForm.role
                })
                .eq('id', editingUser.id);

            if (error) throw error;
            setEditingUser(null);
            fetch();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user details.');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(u =>
            (u.first_name || '').toLowerCase().includes(term) ||
            (u.last_name || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">User Management</h3>
                <AdminSearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search users..."
                />
            </div>

            {loading ? (
                <AdminLoadingSpinner message="Loading users..." />
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/50">
                                <th className="p-4 text-xs tracking-wider text-gray-400 uppercase font-semibold">User</th>
                                <th className="p-4 text-xs tracking-wider text-gray-400 uppercase font-semibold">Email</th>
                                <th className="p-4 text-xs tracking-wider text-gray-400 uppercase font-semibold">Role</th>
                                <th className="p-4 text-xs tracking-wider text-gray-400 uppercase font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar url={user.avatar_url} firstName={user.first_name} size="sm" />
                                                <div>
                                                    <div className="font-medium text-white">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs text-gray-500 font-mono" title={user.id}>
                                                        {user.id.substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {user.email || 'N/A'}
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            <span className="px-2 py-1 bg-white/10 rounded-md text-xs">
                                                {user.role || 'Student'}
                                            </span>
                                        </td>
                                        <td className="p-4 flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setEditForm({ first_name: user.first_name || '', last_name: user.last_name || '', role: user.role || 'Student' });
                                                }}
                                                className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                title="Edit Details"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveAvatar(user.id)}
                                                disabled={processingId === user.id}
                                                className="p-2 text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors disabled:opacity-50"
                                                title="Remove Avatar"
                                            >
                                                <ImageOff size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={processingId === user.id}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Profile"
                                            >
                                                {processingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setEditingUser(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Edit User Details</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            value={editForm.first_name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-accent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={editForm.last_name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-accent outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Role</label>
                                    <input
                                        type="text"
                                        value={editForm.role}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-accent outline-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={processingId === 'edit'}
                                        className="flex-1 py-2 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors flex justify-center items-center"
                                    >
                                        {processingId === 'edit' ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsersTab;
