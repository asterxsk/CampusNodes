import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
    const formRef = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            navigate('/'); // Redirect to home/dashboard

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
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Email or NMIMS ID</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                            placeholder="student@nmims.edu"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold">Password</label>
                            <Link to="/forgot-password" class="text-xs text-accent hover:text-white transition-colors">Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button type="submit" variant="accent" fullWidth={true} disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Don't have an account? <Link to="/signup" className="text-white hover:text-accent font-bold transition-colors">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
