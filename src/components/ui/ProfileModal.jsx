import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import Avatar from './Avatar';
import { Edit2, X, Camera, Trash2, Loader2, LogOut, BookOpen, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const ProfileModal = () => {
    const { user, signOut } = useAuth();
    const { isProfileModalOpen, closeProfileModal } = useUI();

    // Modal States
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Reset/Init on open
    useEffect(() => {
        if (isProfileModalOpen && user) {
            setFormData({
                firstName: user.user_metadata?.first_name || '',
                lastName: user.user_metadata?.last_name || '',
                bio: user.user_metadata?.bio || '',
            });

            // Animations
            requestAnimationFrame(() => {
                anime({
                    targets: '.trust-score-counter',
                    innerHTML: [0, 95],
                    round: 1,
                    easing: 'easeInOutExpo',
                    duration: 2000,
                });
                anime({
                    targets: '.trust-ring-path',
                    strokeDashoffset: [283, 283 - (283 * 95) / 100],
                    easing: 'easeInOutExpo',
                    duration: 2500,
                    delay: 500
                });
            });
        }
    }, [isProfileModalOpen, user]);

    if (!isProfileModalOpen || !user) return null;

    const avatarUrl = user.user_metadata?.avatar_url;

    const handleSignOut = () => {
        setShowSignOutModal(true);
    };

    const confirmSignOut = async () => {
        await signOut();
        setShowSignOutModal(false);
        closeProfileModal();
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            data: {
                first_name: formData.firstName,
                last_name: formData.lastName,
                bio: formData.bio
            }
        });

        const { error: profileError } = await supabase.from('profiles').update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            bio: formData.bio
        }).eq('id', user.id);

        setLoading(false);
        if (!error && !profileError) setIsEditing(false);
    };

    const handleAvatarUpload = async (e) => {
        try {
            setAvatarLoading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

        } catch (error) {
            console.error('Error uploading avatar:', error.message);
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setAvatarLoading(true);
            if (avatarUrl) {
                const path = avatarUrl.split('/avatars/')[1];
                if (path) await supabase.storage.from('avatars').remove([path]);
            }
            await supabase.auth.updateUser({ data: { avatar_url: null } });
            await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
        } catch (error) {
            console.error('Error removing avatar:', error.message);
        } finally {
            setAvatarLoading(false);
        }
    };

    // Change Password Handlers
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // Update password using Supabase
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            setPasswordSuccess('Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            
            // Close modal after short delay
            setTimeout(() => {
                setShowChangePasswordModal(false);
                setPasswordSuccess('');
            }, 1500);
        } catch (error) {
            setPasswordError(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <AnimatePresence>
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeProfileModal}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-background border border-white/10 rounded-3xl w-[95vw] md:w-[80vw] max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeProfileModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-10">
                            {/* Header / Profile Info */}
                            <div className="flex flex-col md:flex-row gap-10 items-start mb-10">
                                {/* Avatar */}
                                <div className="relative group w-40 h-40 shrink-0 mx-auto md:mx-0">
                                    <div className="w-full h-full">
                                        {avatarLoading ? (
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-white/20 flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
                                                <Loader2 className="animate-spin text-white" size={40} />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
                                                <Avatar 
                                                    url={avatarUrl}
                                                    firstName={user?.user_metadata?.first_name}
                                                    size="xl"
                                                    className="w-full h-full text-5xl"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm z-10">
                                        <button onClick={() => fileInputRef.current.click()} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                                            <Camera size={20} />
                                        </button>
                                        {avatarUrl && (
                                            <button onClick={handleRemoveAvatar} className="p-3 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-500 transition-colors">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 w-full relative">
                                    {isEditing ? (
                                        <form onSubmit={handleUpdate} className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <input 
                                                    type="text" 
                                                    value={formData.firstName} 
                                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                                                    className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors" 
                                                    placeholder="First Name" 
                                                />
                                                <input 
                                                    type="text" 
                                                    value={formData.lastName} 
                                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                                                    className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors" 
                                                    placeholder="Last Name" 
                                                />
                                            </div>
                                            <textarea 
                                                value={formData.bio} 
                                                onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                                                className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors resize-none" 
                                                rows={4} 
                                                placeholder="Bio" 
                                            />
                                            <div className="flex gap-3">
                                                <button type="submit" disabled={loading} className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50">
                                                    {loading ? 'Saving...' : 'Save'}
                                                </button>
                                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 bg-transparent border border-white/10 text-white rounded-full hover:bg-white/5 transition-colors">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="text-center md:text-left">
                                            <h2 className="text-4xl font-display font-bold text-white mb-3">
                                                {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                                            </h2>
                                            <p className="text-gray-400 mb-4 text-lg">{user.email}</p>
                                            <p className="text-gray-300 italic mb-8 text-base">
                                                {user.user_metadata?.bio || 'No bio yet.'}
                                            </p>

                                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                <button 
                                                    onClick={() => setIsEditing(true)} 
                                                    className="px-5 py-2.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center gap-2 text-white transition-colors"
                                                >
                                                    <Edit2 size={16} /> Edit Profile
                                                </button>
                                                <button 
                                                    onClick={() => setShowChangePasswordModal(true)} 
                                                    className="px-5 py-2.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center gap-2 text-white transition-colors"
                                                >
                                                    <Lock size={16} /> Change Password
                                                </button>
                                                <button 
                                                    onClick={handleSignOut} 
                                                    className="px-5 py-2.5 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full flex items-center gap-2 text-red-400 transition-colors"
                                                >
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trust Score & Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-5">
                                    <div className="w-20 h-20 relative flex items-center justify-center">
                                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="5" />
                                            <circle className="trust-ring-path" cx="50" cy="50" r="45" fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="283" strokeDashoffset="283" strokeLinecap="round" />
                                        </svg>
                                        <span className="trust-score-counter text-2xl font-bold text-white">0</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Trust Score</p>
                                        <p className="text-sm text-gray-400">High Reliability</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Major</p>
                                        <p className="text-white">Computer Engineering</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Styled Sign Out Confirmation Modal */}
                        <AnimatePresence>
                            {showSignOutModal && (
                                <motion.div 
                                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md rounded-3xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div 
                                        className="bg-zinc-900 border border-white/10 p-8 rounded-3xl text-center max-w-sm mx-4 shadow-2xl"
                                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    >
                                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                                            <LogOut size={40} className="text-red-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">Sign Out?</h3>
                                        <p className="text-gray-400 mb-8 text-base">Are you sure you want to sign out of your account?</p>
                                        <div className="flex gap-3 justify-center">
                                            <button 
                                                onClick={() => setShowSignOutModal(false)} 
                                                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={confirmSignOut} 
                                                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors shadow-lg shadow-red-500/25"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Change Password Modal */}
                        <AnimatePresence>
                            {showChangePasswordModal && (
                                <motion.div 
                                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md rounded-3xl"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div 
                                        className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md mx-4 shadow-2xl"
                                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                                                    <Lock size={24} className="text-accent" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">Change Password</h3>
                                                    <p className="text-gray-400 text-sm">Update your account password</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setShowChangePasswordModal(false);
                                                    setPasswordError('');
                                                    setPasswordSuccess('');
                                                    setPasswordData({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: '',
                                                    });
                                                }}
                                                className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            {/* Current Password */}
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.current ? 'text' : 'password'}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors pr-12"
                                                        placeholder="Enter current password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility('current')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* New Password */}
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.new ? 'text' : 'password'}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors pr-12"
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility('new')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirm New Password */}
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.confirm ? 'text' : 'password'}
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors pr-12"
                                                        placeholder="Confirm new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePasswordVisibility('confirm')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Error Message */}
                                            {passwordError && (
                                                <motion.div 
                                                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle size={16} />
                                                    {passwordError}
                                                </motion.div>
                                            )}

                                            {/* Success Message */}
                                            {passwordSuccess && (
                                                <motion.div 
                                                    className="text-green-400 text-sm bg-green-500/10 p-3 rounded-xl text-center"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    {passwordSuccess}
                                                </motion.div>
                                            )}

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowChangePasswordModal(false);
                                                        setPasswordError('');
                                                        setPasswordSuccess('');
                                                        setPasswordData({
                                                            currentPassword: '',
                                                            newPassword: '',
                                                            confirmPassword: '',
                                                        });
                                                    }}
                                                    className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-medium transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 px-6 py-3.5 bg-accent hover:bg-accent/90 text-white rounded-full font-medium transition-colors disabled:opacity-50 shadow-lg shadow-accent/25"
                                                >
                                                    {loading ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <Loader2 size={18} className="animate-spin" />
                                                            Updating...
                                                        </span>
                                                    ) : (
                                                        'Update Password'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
