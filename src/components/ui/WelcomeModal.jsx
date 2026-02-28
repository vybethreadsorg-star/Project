import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ShoppingBag, X } from 'lucide-react'

export function WelcomeModal({ isOpen, onClose, userName }) {
    // Auto-close after 4 seconds
    useEffect(() => {
        if (!isOpen) return
        const t = setTimeout(onClose, 4000)
        return () => clearTimeout(t)
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.88, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[201] flex items-center justify-center px-6 pointer-events-none"
                    >
                        <div
                            className="relative w-full max-w-[420px] rounded-3xl overflow-hidden pointer-events-auto shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
                            style={{
                                background: 'rgba(255,255,255,0.07)',
                                backdropFilter: 'blur(28px)',
                                border: '1px solid rgba(255,255,255,0.13)',
                            }}
                        >
                            {/* Gradient Top Bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

                            {/* Glow Orbs inside card */}
                            <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="relative z-10 p-8 text-white">
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.08)' }}
                                >
                                    <X size={16} />
                                </button>

                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                                        style={{ background: 'linear-gradient(135deg, #22d3ee, #a855f7, #ec4899)' }}
                                    >
                                        <ShoppingBag size={28} strokeWidth={1.8} className="text-white" />
                                    </div>
                                </div>

                                {/* Heading */}
                                <div className="text-center mb-5">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <Sparkles size={14} className="text-cyan-400" />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">Welcome Back</span>
                                        <Sparkles size={14} className="text-pink-400" />
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase leading-tight">
                                        <span className="text-white">Welcome to </span>
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400">
                                            Vybe Threads
                                        </span>
                                    </h2>
                                    {userName && (
                                        <p className="text-white/60 text-sm mt-1 font-medium">
                                            {userName}
                                        </p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full my-5" style={{ background: 'rgba(255,255,255,0.1)' }} />

                                {/* Message */}
                                <p className="text-center text-white/70 text-sm leading-relaxed font-medium">
                                    This is your wardrobe. Explore our latest drops, exclusive styles, and premium streetwear crafted for you.
                                </p>

                                {/* CTA */}
                                <button
                                    onClick={onClose}
                                    className="w-full mt-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
                                    style={{ background: 'linear-gradient(to right, #22d3ee, #a855f7, #ec4899)' }}
                                >
                                    Let's Shop →
                                </button>

                                {/* Auto-close indicator */}
                                <p className="text-center text-white/25 text-[11px] mt-3 tracking-wide">
                                    Closes automatically in a moment
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
