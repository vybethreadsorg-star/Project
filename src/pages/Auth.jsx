import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, MoveRight } from 'lucide-react'
import brandLogo from '../assets/logo.jpeg'
import { WelcomeModal } from '../components/ui/WelcomeModal'

export function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showWelcome, setShowWelcome] = useState(false)
    const [loggedInEmail, setLoggedInEmail] = useState('')
    const navigate = useNavigate()

    const handleAuth = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) {
                    if (error.message.toLowerCase().includes('email not confirmed')) {
                        setError('Your email is not confirmed yet. Please check your inbox and click the confirmation link.')
                    } else if (error.message.toLowerCase().includes('invalid login')) {
                        setError('Incorrect email or password. Please try again.')
                    } else {
                        setError(error.message)
                    }
                    return
                }
                // Show welcome modal then navigate
                setLoggedInEmail(email)
                setShowWelcome(true)
            } else {
                if (!fullName.trim()) {
                    setError('Please enter your full name.')
                    setLoading(false)
                    return
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName.trim() } }
                })
                if (error) {
                    setError(error.message)
                    return
                }
                setSuccess('Account created! Please check your email to confirm your account before logging in.')
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <WelcomeModal
                isOpen={showWelcome}
                onClose={() => { setShowWelcome(false); navigate('/') }}
                userName={loggedInEmail ? loggedInEmail.split('@')[0] : ''}
            />
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white bg-[#1A1A24] pt-24 pb-16">

                {/* Brand Glow Orbs */}
                <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[130px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Subtle Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-[430px] mx-6 relative z-10 rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
                    style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                    <div className="p-10 md:p-12">
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <img src={brandLogo} alt="Vybe Threads" className="h-14 w-auto object-contain mix-blend-screen" />
                        </div>

                        {/* Heading */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black tracking-tight uppercase mb-2">
                                {isLogin ? (
                                    <><span className="text-white">WELCOME </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">BACK</span></>
                                ) : (
                                    <><span className="text-white">CREATE </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-cyan-300">ACCOUNT</span></>
                                )}
                            </h1>
                            <p className="text-white/60 text-sm tracking-wide">
                                {isLogin ? 'Enter your details to access your account.' : 'Join us to experience premium streetwear.'}
                            </p>
                        </div>

                        {/* Error / Success Messages */}
                        {error && (
                            <div className="mb-4 p-3 rounded-xl text-sm font-medium bg-red-500/15 border border-red-500/30 text-red-300">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 rounded-xl text-sm font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                                {success}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleAuth} className="space-y-4">
                            {!isLogin && (
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/30"
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                                        onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.13)'; e.target.style.borderColor = 'rgba(168,85,247,0.5)' }}
                                        onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)' }}
                                        required={!isLogin}
                                    />
                                </div>
                            )}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/30"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                                    onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.13)'; e.target.style.borderColor = 'rgba(103,232,249,0.5)' }}
                                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)' }}
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-pink-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/30"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                                    onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.13)'; e.target.style.borderColor = 'rgba(236,72,153,0.5)' }}
                                    onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)' }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-2 font-bold text-[13px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                                style={{ background: 'linear-gradient(to right, #22d3ee, #a855f7, #ec4899)' }}
                            >
                                {loading ? 'Processing...' : isLogin ? <>Sign In <MoveRight size={16} /></> : <>Create Account <MoveRight size={16} /></>}
                            </button>
                        </form>

                        {/* Switch mode */}
                        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            <p className="text-white/50 text-sm">
                                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-cyan-300 font-bold hover:text-white transition-colors"
                                >
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    )
}

