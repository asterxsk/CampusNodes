import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Shield, BookOpen, Edit2, X, Save, Camera, Trash2, Loader2, Upload } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: user?.user_metadata?.first_name || '',
        lastName: user?.user_metadata?.last_name || '',
        bio: user?.user_metadata?.bio || '',
    });

    if (!user) return <div className="pt-32 px-12 text-white">Please log in to view profile.</div>;

    const initial = user.user_metadata?.first_name ? user.user_metadata.first_name[0] : user.email[0].toUpperCase();
    const avatarUrl = user.user_metadata?.avatar_url;

    useEffect(() => {
        // Simple animation on mount
        anime({
            targets: '.trust-score-counter',
            innerHTML: [0, 95], // Mock score for now
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
    }, []);

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
        setLoading(false);
        if (!error) setIsEditing(false);
    };

    const handleAvatarUpload = async (e) => {
        try {
            setAvatarLoading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update User Metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

        } catch (error) {
            console.error('Error uploading avatar:', error.message);
            alert(`Error: ${error.message}`);
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            setAvatarLoading(true);
            const { error } = await supabase.auth.updateUser({
                data: { avatar_url: null }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error removing avatar:', error.message);
        } finally {
            setAvatarLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12 relative group/profile">
                    {/* Edit Toggle */}
                    {!isEditing && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setIsEditing(true);
                            }}
                            className="absolute top-0 right-0 p-3 text-gray-400 hover:text-white border border-white/10 rounded-full hover:bg-white/10 transition-colors z-50 cursor-pointer"
                        >
                            <Edit2 size={20} />
                        </button>
                    )}

                    {/* Avatar Section */}
                    <div className="relative group w-32 h-32 shrink-0">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-white/20 flex items-center justify-center text-4xl font-bold text-white shadow-2xl overflow-hidden relative">
                            {avatarLoading ? (
                                <Loader2 className="animate-spin text-white" size={32} />
                            ) : avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                initial
                            )}
                        </div>

                        {/* Interactive Overlay */}
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-sm z-10">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                                title="Upload Photo"
                            >
                                <Camera size={18} />
                            </button>
                            {avatarUrl && (
                                <button
                                    onClick={handleRemoveAvatar}
                                    className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-500 transition-colors"
                                    title="Remove Photo"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div className="flex-1 w-full relative">
                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4 animate-fade-in relative">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                                <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full bg-black border border-white/20 p-2 text-white focus:border-accent outline-none rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full bg-black border border-white/20 p-2 text-white focus:border-accent outline-none rounded"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Bio</label>
                                    <textarea
                                        rows="3"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-black border border-white/20 p-2 text-white focus:border-accent outline-none rounded"
                                    />
                                </div>

                                <button type="submit" disabled={loading} className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded flex items-center gap-2">
                                    <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        ) : (
                            // View Mode
                            <div className="animate-fade-in">
                                <h1 className="text-4xl font-display font-bold text-white mb-2">
                                    {user.user_metadata?.first_name || 'Student'} {user.user_metadata?.last_name || ''}
                                </h1>
                                <p className="text-gray-400 mb-4">{user.email}</p>
                                <p className="text-gray-300 italic mb-6 max-w-xl">{user.user_metadata?.bio || 'No bio yet.'}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="2" />
                                                <circle
                                                    className="trust-ring-path"
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke="#fff"
                                                    strokeWidth="2"
                                                    strokeDasharray="283"
                                                    strokeDashoffset="283" // Will animate
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="text-center z-10">
                                                <span className="trust-score-counter text-3xl font-display font-bold text-white">0</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Trust Score</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded flex items-center gap-3">
                                        <BookOpen className="text-blue-400" size={20} />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Major</p>
                                            <p className="text-white">Computer Engineering</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 border-t border-white/10 pt-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                    <div className="p-12 text-center border border-dashed border-white/10 rounded-lg text-gray-500">
                        No recent trades or services.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
