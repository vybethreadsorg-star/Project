import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'
import brandLogo from '../../assets/logo.jpeg'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { cartItems, openCart } = useCartStore()
    const { user, isAdmin, signOut } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSignOut = async () => {
        try { await signOut() }
        catch (e) { console.error('Sign out error:', e) }
        finally {
            setIsMobileMenuOpen(false)
            navigate('/')
        }
    }

    const navLinks = [
        { to: '/', label: 'HOME', activeColor: 'text-pink-500' },
        { to: '/shop', label: 'SHOP', activeColor: 'text-cyan-400' },
        { to: '/customize', label: 'CUSTOMIZE', activeColor: 'text-pink-500' },
    ]

    return (
        <nav className={`fixed top-0 w-full z-[60] transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-4'}`}>
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between md:grid md:grid-cols-3 items-center text-white">

                {/* Logo */}
                <div className="flex justify-start">
                    <Link to="/" className="group flex items-center">
                        <img src={brandLogo} alt="Vybe Threads" className="h-10 md:h-14 w-auto object-contain mix-blend-screen" />
                    </Link>
                </div>

                {/* Nav Links – Center */}
                <div className="hidden md:flex justify-center space-x-10 text-[13px] uppercase tracking-widest font-sans font-semibold">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`transition-colors ${location.pathname === link.to ? link.activeColor : `hover:${link.activeColor}`}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex justify-end items-center gap-3">
                    {/* Cart */}
                    <button onClick={openCart} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-all group relative">
                        <ShoppingBag size={20} strokeWidth={1.5} className="group-hover:text-pink-500 transition-all" />
                        {cartItemCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-[8px] w-4 h-4 flex items-center justify-center font-bold">
                                {cartItemCount}
                            </div>
                        )}
                    </button>

                    {/* Admin Link (only for admins) */}
                    {user && isAdmin && (
                        <Link
                            to="/admin"
                            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest font-sans text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-400 transition-all rounded"
                        >
                            <LayoutDashboard size={14} /> Admin
                        </Link>
                    )}

                    {/* Auth Button */}
                    {user ? (
                        <button
                            onClick={handleSignOut}
                            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest font-sans text-gray-300 hover:text-pink-500 border border-white/10 hover:border-pink-500/40 transition-all rounded"
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    ) : (
                        <Link
                            to="/auth"
                            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-widest font-sans text-cyan-400 hover:text-white border border-cyan-500/30 hover:border-cyan-400 transition-all rounded"
                        >
                            <LogIn size={14} /> Login
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 bg-black z-[100] flex flex-col p-8"
                    >
                        <div className="flex justify-between items-center mb-20">
                            <img src={brandLogo} alt="Vybe Threads" className="h-10 w-auto object-contain mix-blend-screen" />
                            <button className="text-pink-500" onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={32} />
                            </button>
                        </div>
                        <div className="flex flex-col space-y-10 text-xl md:text-2xl tracking-[0.2em] uppercase font-sans font-semibold items-center justify-center mt-10">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pink-500 transition-colors">HOME</Link>
                            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-cyan-400 transition-colors">SHOP</Link>
                            <Link to="/customize" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pink-500 transition-colors">CUSTOMIZE</Link>
                            {user && isAdmin && (
                                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-400 hover:text-white transition-colors">ADMIN</Link>
                            )}
                            {user ? (
                                <button onClick={handleSignOut} className="text-gray-300 hover:text-pink-500 transition-colors text-base font-semibold">LOGOUT</button>
                            ) : (
                                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="text-cyan-400 hover:text-white transition-colors">LOGIN</Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
