import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import Avatar from './Avatar';
import { X, Camera, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-next-line no-unused-vars

const COLLEGES = ['MPSTME', 'NMIMS', 'DJ Sanghvi'];
const COURSES = [
    'Computer Engineering',
    'MBA Tech Engineering',
    'Research',
    'Artificial Intelligence',
    'Data Science',
    'Information Technology',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics & Telecommunication',
    'Mechatronics',
    'Cyber Security',
    'Business Management',
    'Finance',
    'Marketing'
];

const CourseSearchDropdown = ({ value, onChange, courses }) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentSearch = value || '';
    const filtered = courses.filter(c => c.toLowerCase().includes(currentSearch.toLowerCase()));

    return (
        <div className="relative">
            <input
                type="text"
                value={currentSearch}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                placeholder="Search course..."
                className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors"
                required
            />
            {isOpen && filtered.length > 0 && (
                <ul className="absolute z-50 w-full bg-zinc-900 border border-white/10 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-2xl">
                    {filtered.map(c => (
                        <li
                            key={c}
                            onClick={() => {
                                onChange(c);
                                setIsOpen(false);
                            }}
                            className="px-4 py-3 hover:bg-white/10 cursor-pointer text-white text-sm border-b border-white/5 last:border-0"
                        >
                            {c}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const EditProfileModal = () => {
    const { user } = useAuth();
    const { isEditProfileModalOpen, closeEditProfileModal } = useUI();

    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        status: 'Student',
        college: '',
        course: ''
    });

    useEffect(() => {
        if (isEditProfileModalOpen && user) {
            setFormData({
                firstName: user.user_metadata?.first_name || '',
                lastName: user.user_metadata?.last_name || '',
                bio: user.user_metadata?.bio || '',
                status: user.user_metadata?.status || 'Student',
                college: user.user_metadata?.college || '',
                course: user.user_metadata?.course || ''
            });
        }
    }, [isEditProfileModalOpen, user]);

    if (!isEditProfileModalOpen || !user) return null;

    const avatarUrl = user.user_metadata?.avatar_url;
    const isTeacher = formData.status === 'Teacher';

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (isTeacher) {
            // Block saves if teacher is selected
            return;
        }

        setLoading(true);
        const updates = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            bio: formData.bio,
            status: formData.status,
            college: formData.college,
            course: formData.course
        };

        const { error } = await supabase.auth.updateUser({
            data: updates
        });

        const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', user.id);

        setLoading(false);
        if (!error && !profileError) {
            closeEditProfileModal();
        } else {
            console.error("Failed to update profile", error || profileError);
        }
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

    return (
        <AnimatePresence>
            {isEditProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeEditProfileModal}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-background border border-white/10 rounded-3xl w-[95vw] md:w-[60vw] max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-10"
                    >
                        <button
                            onClick={closeEditProfileModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-3xl font-display font-bold text-white mb-8">Edit Profile</h2>

                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            {/* Avatar Section */}
                            <div className="relative group w-32 h-32 shrink-0 mx-auto md:mx-0">
                                <div className="w-full h-full">
                                    {avatarLoading ? (
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
                                            <Loader2 className="animate-spin text-white" size={30} />
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
                                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-10">
                                    <button onClick={() => fileInputRef.current.click()} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors" title="Change Avatar">
                                        <Camera size={18} />
                                    </button>
                                    {avatarUrl && (
                                        <button onClick={handleRemoveAvatar} className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-500 transition-colors" title="Remove Avatar">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                            </div>

                            {/* Form Section */}
                            <div className="flex-1 w-full relative">
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">First Name</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors"
                                                placeholder="First Name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Last Name</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors"
                                                placeholder="Last Name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Bio</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors resize-none"
                                            rows={3}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="h-px bg-white/10 my-6" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Current Status</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                    className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors appearance-none"
                                                >
                                                    <option value="Student" className="bg-zinc-900">Student</option>
                                                    <option value="Teacher" className="bg-zinc-900">Teacher</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">College</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.college}
                                                    onChange={e => setFormData({ ...formData, college: e.target.value })}
                                                    className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white w-full focus:border-accent focus:outline-none transition-colors appearance-none"
                                                    required
                                                >
                                                    <option value="" disabled className="bg-zinc-900">Select your college</option>
                                                    {COLLEGES.map(c => (
                                                        <option key={c} value={c} className="bg-zinc-900">{c}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Course / Major</label>
                                        <CourseSearchDropdown
                                            value={formData.course}
                                            onChange={val => setFormData({ ...formData, course: val })}
                                            courses={COURSES}
                                        />
                                    </div>

                                    {/* Warnings */}
                                    <AnimatePresence>
                                        {isTeacher && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3 mt-4"
                                            >
                                                <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
                                                <p className="text-yellow-200 text-sm">
                                                    Teacher verification required. We are currently not accepting new teacher registrations at this time.
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading || isTeacher}
                                            className="flex-1 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            {loading ? 'Saving Changes...' : 'Save Profile'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeEditProfileModal}
                                            className="px-8 py-3 bg-transparent border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
