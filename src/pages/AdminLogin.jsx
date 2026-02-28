import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react'

export function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
            if (authError) throw authError
            navigate('/admin')
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020205] flex items-center justify-center relative overflow-hidden">

            {/* ── Animated background ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gradient orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-pink-600/20 to-transparent blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-radial from-purple-700/15 to-transparent blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-radial from-cyan-500/10 to-transparent blur-[100px]" />

                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            <div className="relative z-10 w-full max-w-[440px] mx-auto px-6">
                {/* Logo / brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_40px_rgba(236,72,153,0.4)] mb-5">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-cyber font-black text-white uppercase tracking-widest">Admin Portal</h1>
                    <p className="text-gray-500 text-sm mt-2 font-sans">Sign in to manage your store</p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                >
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm px-4 py-3 rounded-xl mb-6"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] uppercase tracking-widest text-gray-400 font-cyber">Email</label>
                            <div className="relative group">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors pointer-events-none" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@yourstore.com"
                                    className="w-full bg-white/5 border border-white/10 focus:border-pink-500/60 text-white pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] uppercase tracking-widest text-gray-400 font-cyber">Password</label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors pointer-events-none" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••••"
                                    className="w-full bg-white/5 border border-white/10 focus:border-pink-500/60 text-white pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-gray-600"
                                />
                                <button type="button" onClick={() => setShowPass(p => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-cyber text-sm uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-[0.98] shadow-[0_0_30px_rgba(236,72,153,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
                            ) : (
                                <>Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-gray-600">
                        <ShieldCheck size={12} />
                        <span>Secured by Supabase Auth</span>
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-gray-600 text-sm mt-6"
                >
                    Not an admin?{' '}
                    <Link to="/" className="text-pink-500 hover:text-pink-400 transition-colors">Back to store →</Link>
                </motion.p>
            </div>
        </div>
    )
}
