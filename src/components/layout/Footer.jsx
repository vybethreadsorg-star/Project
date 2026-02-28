import React from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Github, Twitter, Instagram, Send } from 'lucide-react'
import brandLogo from '../../assets/logo.jpeg'

export function Footer() {
    return (
        <footer className="bg-cyber-dark border-t border-white/5 text-white pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-purple/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-12">
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <img src={brandLogo} alt="Vybe Threads" className="h-10 w-auto object-contain mix-blend-screen" />
                    </div>
                    <p className="text-gray-300 text-[15px] leading-relaxed max-w-xs font-sans">
                        Pioneering the future of unisex street fashion. Premium fabrics, modern aesthetics. Wear your future.
                    </p>
                    <div className="flex space-x-6 text-gray-300">
                        <Instagram size={22} className="hover:text-cyber-pink cursor-pointer transition-colors" />
                        <Twitter size={22} className="hover:text-cyber-cyan cursor-pointer transition-colors" />
                        <Github size={22} className="hover:text-cyber-purple cursor-pointer transition-colors" />
                    </div>
                </div>

                <div>
                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-cyber-cyan mb-8 font-sans">Collections</h3>
                    <ul className="space-y-4 text-[13px] tracking-widest text-gray-300 uppercase font-sans font-medium">
                        <li><Link to="/shop" className="hover:text-white transition-colors underline-offset-4 hover:underline decoration-cyber-cyan/50">Shop All</Link></li>
                        <li><Link to="/customize" className="hover:text-white transition-colors underline-offset-4 hover:underline decoration-cyber-cyan/50">Custom Lab</Link></li>
                        <li><Link to="/shop" className="hover:text-white transition-colors underline-offset-4 hover:underline decoration-cyber-cyan/50">New Arrivals</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-cyber-purple mb-8 font-sans">Support</h3>
                    <ul className="space-y-4 text-[13px] tracking-widest text-gray-300 uppercase font-sans font-medium">
                        <li><Link to="/shipping-info" className="hover:text-white transition-colors">Shipping Info</Link></li>
                        <li><Link to="/refund-policy" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                        <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-[12px] font-semibold uppercase tracking-widest text-cyber-pink mb-8 font-sans">Join Newsletter</h3>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="YOUR@EMAIL.COM"
                                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-[12px] uppercase tracking-widest focus:border-cyber-pink outline-none transition-all placeholder:text-gray-500 font-sans"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-cyber-pink">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[11px] font-sans font-medium uppercase tracking-widest text-gray-400">
                <p>© 2026 VYBE THREADS // ALL RIGHTS RESERVED</p>
                <p className="mt-4 md:mt-0">DESIGNED BY VYBE THREADS TEAM</p>
            </div>
        </footer>
    )
}
