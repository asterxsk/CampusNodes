import React, { useRef, useEffect, useState } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
    const formRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');

    useEffect(() => {
        anime({
            targets: formRef.current,
            translateY: [20, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 800
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`, // Placeholder redirect
            });

            if (error) throw error;

            setMessage('Password reset link has been sent to your email.');
            setEmail('');

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

            <div ref={formRef} className="w-full max-w-md bg-surface/50 backdrop-blur-md border border-white/10 p-8 md:p-12 relative z-10 opacity-0 rounded-sm shadow-2xl">
                <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors text-sm">
                    <ArrowLeft size={16} className="mr-2" /> Back to Login
                </Link>

                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
                        <Mail size={24} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Forgot Password?</h1>
                    <p className="text-gray-400 text-sm">Enter your email to receive a reset link</p>
                </div>

                {message && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-xs rounded-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                            placeholder="student@nmims.edu"
                            required
                        />
                    </div>

                    <Button type="submit" variant="accent" fullWidth={true} disabled={loading}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
