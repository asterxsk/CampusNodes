import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, User, ArrowRight, CheckCircle, Check } from 'lucide-react';
import Toast, { useToast, ToastContainer } from '../components/ui/Toast';

const Signup = () => {
    const formRef = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [verificationStep, setVerificationStep] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [otp, setOtp] = useState('');
    const { toasts, addToast, removeToast } = useToast();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        anime({
            targets: formRef.current,
            translateY: [20, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 800
        });
    }, [verificationStep]); // Re-animate on step change

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Email Validation: name.name@nmims.edu.in
        const emailRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@nmims\.edu\.in$/;
        const isValidFormat = formData.email.includes('.') && (formData.email.endsWith('@nmims.edu.in') || formData.email.endsWith('@nmims.in'));

        if (!isValidFormat) {
            setError("Email must follow the format: firstname.lastname@nmims.edu.in");
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                    }
                }
            });

            if (error) throw error;

            // Instead of redirecting, move to verification step
            setVerificationStep(true);
            setLoading(false);

        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'signup'
            });

            if (error) throw error;

            // Success

            // Create Profile manually now that they are verified
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                role: 'Student',
                email: formData.email // Optional, good for admin view
            });

            if (profileError) {
                console.warn("Profile creation note:", profileError);
            }

            addToast('Verification successful! Account created.', 'success');
            setIsVerified(true);
            setTimeout(() => navigate('/'), 2000);

        } catch (error) {
            setError(error.message || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: formData.email,
                // options: { emailRedirectTo: '...' } // Not needed if using code
            });
            if (error) throw error;
            addToast('Verification code resent! Check your inbox.', 'success');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-20">
            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div ref={formRef} className="w-full max-w-md bg-surface/50 backdrop-blur-md border border-white/10 p-8 md:p-12 relative z-10 opacity-0 rounded-sm shadow-2xl">

                {isVerified ? (
                    // STEP 3: SUCCESS STATE
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500 border border-green-500/30"
                        >
                            <Check size={40} />
                        </motion.div>
                        <h2 className="text-3xl font-display font-bold text-white mb-2">Success!</h2>
                        <p className="text-gray-400">Your account has been verified.</p>
                        <p className="text-gray-500 text-sm mt-1">Redirecting to campus nodes...</p>
                    </div>
                ) : !verificationStep ? (
                    // STEP 1: SIGNUP FORM
                    <>
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-display font-bold text-white mb-2">Join Campus Nodes</h1>
                            <p className="text-gray-400 text-sm">Create an account to start trading & connecting</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                                        placeholder="Rohan"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                                        placeholder="Sharma"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Student Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                                    placeholder="firstname.lastname@nmims.edu"
                                    required
                                />
                                <p className="text-[10px] text-gray-500 mt-1">We'll need this to verify your student status later.</p>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Create Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 p-3 text-white focus:outline-none focus:border-accent transition-colors text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <div className="flex items-start gap-2 mb-4">
                                    <input type="checkbox" className="mt-1 bg-black border-white/20 accent-accent" required />
                                    <span className="text-xs text-gray-400 leading-tight">I agree to the <a href="#" className="text-white hover:underline">Terms of Service</a> and <a href="#" className="text-white hover:underline">Privacy Policy</a>.</span>
                                </div>
                                <Button type="submit" variant="primary" fullWidth={true} disabled={loading}>
                                    {loading ? 'Sending Code...' : 'Create Account'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-400">
                            Already have an account? <Link to="/login" className="text-white hover:text-accent font-bold transition-colors">Sign In</Link>
                        </div>
                    </>
                ) : (
                    // STEP 2: VERIFICATION FORM
                    <>
                        <div className="mb-8 text-center">
                            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                                <Mail size={32} />
                            </div>
                            <h1 className="text-2xl font-display font-bold text-white mb-2">Check Your Email</h1>
                            <p className="text-gray-400 text-sm">We sent a 6-digit code to <span className="text-white font-bold">{formData.email}</span></p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold text-center">Verification Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full bg-black/20 border border-white/10 p-4 text-center text-2xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-accent transition-colors"
                                    placeholder="000000"
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={loading}
                                    className="text-xs text-accent hover:text-white underline disabled:opacity-50"
                                >
                                    Resend Code
                                </button>
                            </div>

                            <Button type="submit" variant="accent" fullWidth={true} disabled={loading || otp.length < 6}>
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setVerificationStep(false)}
                                className="w-full text-xs text-gray-500 hover:text-white transition-colors mt-4"
                            >
                                Incorrect email? Go back
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Signup;
