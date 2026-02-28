import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FeaturedCarousel } from '../components/shop/FeaturedCarousel'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, MessageCircle, Star, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [carouselLoading, setCarouselLoading] = useState(true)

    useEffect(() => {
        async function fetchFeatured() {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('is_featured', true)
                .eq('is_active', true)
                .order('id', { ascending: true })

            const formatted = (data || []).map(p => ({
                ...p,
                price: Math.floor(p.price / 100).toLocaleString('en-IN'),
            }))
            setFeaturedProducts(formatted)
            setCarouselLoading(false)
        }
        fetchFeatured()
    }, [])

    return (
        <div className="overflow-hidden bg-black min-h-screen">

            {/* ── Hero Section ── */}
            <section className="relative flex flex-col items-center pt-24 pb-0">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1627163439134-7a8c47ee8020?auto=format&fit=crop&q=100&w=2000"
                        alt="Cyberpunk Background"
                        className="w-full h-full object-cover opacity-60 grayscale-[0.5]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pb-0">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2 border border-pink-500/30 rounded-full bg-pink-500/5 mb-6 backdrop-blur-sm">
                            <Zap size={14} className="text-pink-500 animate-pulse" />
                            <span className="text-[12px] uppercase font-semibold tracking-widest font-sans text-pink-500">New Collection 2026</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-cyber mb-6 leading-[1] font-black tracking-tight mt-2">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]">WEAR</span>
                            <span className="block text-white drop-shadow-md">YOUR</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">FUTURE</span>
                        </h1>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pb-0 mt-10">
                            <Link to="/shop">
                                <button className="min-w-[240px] py-4 text-[15px] font-semibold bg-pink-500 text-white font-sans tracking-widest uppercase hover:bg-pink-600 hover:scale-105 shadow-[0_0_20px_rgba(236,72,153,0.6)] transition-all duration-300 flex items-center justify-center gap-3 group">
                                    SHOP NOW <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </Link>
                            <Link to="/customize">
                                <button className="min-w-[240px] py-4 text-[15px] font-semibold border-2 border-pink-500 text-pink-400 font-sans tracking-widest uppercase hover:bg-pink-500/10 hover:text-pink-300 transition-all duration-300 flex items-center justify-center gap-3 group bg-black/50 backdrop-blur-md">
                                    CUSTOMIZE NOW <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Brand Stats Bar ── */}
            <section className="py-10 border-y border-white/5 relative z-10" style={{ background: 'linear-gradient(to right, #0d0d0f, #111116, #0d0d0f)' }}>
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '10,000+', label: 'Happy Customers' },
                            { value: '500+', label: 'Unique Designs' },
                            { value: '4.9★', label: 'Average Rating' },
                            { value: '48hrs', label: 'Custom Delivery' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col gap-1"
                            >
                                <span className="text-3xl md:text-4xl font-cyber font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300 drop-shadow-sm">
                                    {stat.value}
                                </span>
                                <span className="text-[13px] text-gray-300 uppercase font-semibold tracking-widest font-sans">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Collection (Supabase-backed) ── */}
            <section className="py-24 relative z-10 w-full overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0B0B0F, #111111)' }}>
                <div className="flex flex-col justify-center items-center text-center mb-6 md:mb-12 relative z-20 px-4">
                    <h3 className="text-3xl md:text-5xl font-sans mb-3 tracking-wide font-medium text-white drop-shadow-md">
                        Featured Collections
                    </h3>
                    <p className="text-[15px] text-gray-300 font-sans tracking-wide max-w-md mx-auto leading-relaxed">
                        Discover piece-unique luxury streetwear crafted for the modern individual.
                    </p>
                </div>
                {carouselLoading ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <Loader2 size={36} className="text-pink-500 animate-spin" />
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <FeaturedCarousel products={featuredProducts} />
                ) : (
                    <div className="text-center text-gray-400 py-20 text-[15px] font-sans">No featured products yet.</div>
                )}
            </section>

            {/* ── Category Showcase ── */}
            <section className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto relative z-10">
                <div className="text-center mb-14">
                    <p className="text-[12px] font-semibold uppercase tracking-widest text-pink-400 font-sans mb-3">Browse by Style</p>
                    <h2 className="text-3xl md:text-5xl font-cyber font-black text-white uppercase drop-shadow-sm">
                        Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300">Category</span>
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { title: 'Hoodies', tag: 'BESTSELLER', img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&q=80&w=600', link: '/shop', border: 'border-cyan-500/50', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]', hoverBorder: 'hover:border-cyan-400' },
                        { title: 'T-Shirts', tag: 'NEW', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600', link: '/shop', border: 'border-pink-500/50', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]', hoverBorder: 'hover:border-pink-400' },
                        { title: 'Custom', tag: 'YOUR DESIGN', img: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=600', link: '/customize', border: 'border-purple-500/50', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', hoverBorder: 'hover:border-purple-400' },
                        { title: 'Cargos', tag: 'LIMITED', img: 'https://images.unsplash.com/photo-1624378439575-d1ead6bb2d50?auto=format&fit=crop&q=80&w=600', link: '/shop', border: 'border-yellow-500/50', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]', hoverBorder: 'hover:border-yellow-400' },
                    ].map((cat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className={`relative overflow-hidden rounded-lg group cursor-pointer border ${cat.border} ${cat.shadow} ${cat.hoverBorder} transition-colors`}
                            style={{ minHeight: 260 }}
                        >
                            <Link to={cat.link} className="block w-full h-full absolute inset-0">
                                <img
                                    src={cat.img}
                                    alt={cat.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-5">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-pink-400 font-sans drop-shadow-md">{cat.tag}</span>
                                    <h3 className="text-xl md:text-2xl font-cyber font-black text-white uppercase mt-1 drop-shadow-md">{cat.title}</h3>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.8)]">
                                        <ArrowRight size={14} className="text-white" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Why Choose Us ── */}
            <section className="py-20 px-6 md:px-12 relative z-10" style={{ background: 'linear-gradient(to bottom, #0a0a0e, #0d0d12)' }}>
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[12px] font-semibold uppercase tracking-widest text-cyan-400 font-sans mb-3">Why Us</p>
                        <h2 className="text-3xl md:text-5xl font-cyber font-black text-white uppercase drop-shadow-sm">
                            Built Different.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">Crafted Different.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: '⚡', title: 'Ultra-Fast Delivery', desc: 'We ship your order within 48 hours. Custom prints completed in just 3-5 days — no waiting forever.', color: 'from-pink-500/20 to-transparent', border: 'border-pink-500/40' },
                            { icon: '🎨', title: 'Custom Printing', desc: 'Upload your own art, logo, or design. Our DTG print tech brings your vision to life with vibrant precision.', color: 'from-cyan-500/20 to-transparent', border: 'border-cyan-500/40' },
                            { icon: '🧵', title: 'Premium Fabric', desc: 'Every piece uses 280gsm combed cotton. Soft, structured, and built to last wash after wash.', color: 'from-purple-500/20 to-transparent', border: 'border-purple-500/40' },
                            { icon: '🔒', title: 'Secure Payments', desc: 'Shop with confidence. We support UPI, cards & net banking via Razorpay with end-to-end encryption.', color: 'from-pink-500/20 to-transparent', border: 'border-pink-500/40' },
                            { icon: '♻️', title: 'Eco-Conscious', desc: 'Packaging made from recycled materials. We print on demand to reduce overproduction and waste.', color: 'from-green-500/20 to-transparent', border: 'border-green-500/40' },
                            { icon: '🤝', title: 'Easy Returns', desc: '7-day hassle-free returns on all non-custom orders. Your satisfaction is our highest priority.', color: 'from-yellow-500/20 to-transparent', border: 'border-yellow-500/40' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className={`bg-[#111116] border ${item.border} rounded-xl p-7 relative overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-sm`}
                            >
                                <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${item.color} opacity-40`} />
                                <div className="text-4xl mb-4 relative z-10 drop-shadow-md">{item.icon}</div>
                                <h3 className="font-sans text-white font-bold text-lg uppercase tracking-wide mb-2 relative z-10 drop-shadow-sm">{item.title}</h3>
                                <p className="text-gray-300 text-[15px] font-sans leading-relaxed relative z-10">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Brand Manifesto Banner ── */}
            <section className="relative py-24 px-6 overflow-hidden z-10">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000"
                        alt="Brand Banner"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <p className="text-[12px] font-semibold uppercase tracking-widest text-pink-400 font-sans mb-5 drop-shadow-md">Our Philosophy</p>
                    <h2 className="text-4xl md:text-6xl font-cyber font-black text-white uppercase leading-tight mb-6 drop-shadow-lg">
                        Fashion Is Not<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300">Just Clothing.</span><br />
                        It's Identity.
                    </h2>
                    <p className="text-gray-200 font-sans text-[16px] leading-relaxed max-w-xl mx-auto mb-8 drop-shadow-md">
                        We design for those who refuse to blend in. Every stitch, every print, every drop is a statement —
                        crafted for rebels, creators, and dreamers who wear their future on their sleeves.
                    </p>
                    <Link to="/shop">
                        <button className="px-10 py-4 text-[15px] font-semibold bg-black/50 backdrop-blur-md border-2 border-cyan-400/80 text-cyan-300 font-sans tracking-widest uppercase hover:bg-cyan-400/20 hover:text-cyan-200 transition-all duration-300 flex items-center gap-3 mx-auto group">
                            EXPLORE THE DROP <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </Link>
                </div>
            </section>

            {/* ── Community Reviews ── */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto relative z-10 w-full">
                <div className="flex justify-center items-center text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-cyber mb-4 tracking-wide font-black uppercase drop-shadow-md">
                        <span className="text-white">WHAT THE </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300">COMMUNITY</span>
                        <span className="text-white"> SAYS</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#111116] border border-cyan-500/50 rounded-lg p-8 shadow-[0_4px_20px_rgba(6,182,212,0.2)] hover:border-cyan-400 transition-colors">
                        <div className="flex gap-1 mb-6">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill="#22d3ee" className="text-cyan-400" />)}
                        </div>
                        <p className="text-gray-200 font-sans text-[15px] tracking-wide leading-relaxed mb-8">
                            "The quality is insane. Wore the Neon Circuit Tee to a tech event and got so many compliments. Truly futuristic fashion."
                        </p>
                        <p className="text-cyan-400 font-sans font-bold text-[13px] tracking-widest uppercase">- Akira M.</p>
                    </div>
                    <div className="bg-[#111116] border border-pink-500/50 rounded-lg p-8 shadow-[0_4px_20px_rgba(236,72,153,0.2)] hover:border-pink-400 transition-colors">
                        <div className="flex gap-1 mb-6">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill="#f472b6" className="text-pink-400" />)}
                        </div>
                        <p className="text-gray-200 font-sans text-[15px] tracking-wide leading-relaxed mb-8">
                            "Custom print feature is a game changer! I uploaded my own glitch art and it came out perfectly on the hoodie."
                        </p>
                        <p className="text-pink-400 font-sans font-bold text-[13px] tracking-widest uppercase">- Zara K.</p>
                    </div>
                    <div className="bg-[#111116] border border-purple-500/50 rounded-lg p-8 shadow-[0_4px_20px_rgba(168,85,247,0.2)] hover:border-purple-400 transition-colors">
                        <div className="flex gap-1 mb-6">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={18} fill="#c084fc" className="text-purple-400" />)}
                        </div>
                        <p className="text-gray-200 font-sans text-[15px] tracking-wide leading-relaxed mb-8">
                            "Best streetwear brand I've found. The cyberpunk aesthetic is authentic, not just surface-level. Amazing materials too."
                        </p>
                        <p className="text-purple-400 font-sans font-bold text-[13px] tracking-widest uppercase">- Devon R.</p>
                    </div>
                </div>
            </section>

            {/* ── Newsletter CTA ── */}
            <section className="py-20 px-6 relative z-10 border-t border-white/5">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-[12px] font-semibold uppercase tracking-widest text-pink-400 font-sans mb-4 drop-shadow-md">Stay Ahead of the Drop</p>
                    <h2 className="text-3xl md:text-5xl font-cyber font-black text-white uppercase mb-4 drop-shadow-lg">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Collective</span>
                    </h2>
                    <p className="text-gray-300 text-[15px] font-sans mb-8 leading-relaxed">
                        Get early access to new drops, exclusive discounts, and behind-the-scenes looks — straight to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 px-5 py-4 bg-[#111116] border border-white/20 text-white text-[15px] font-sans focus:outline-none focus:border-pink-500/80 placeholder:text-gray-500 transition-colors rounded-sm"
                        />
                        <button className="px-8 py-4 bg-pink-500 text-white text-[15px] font-bold font-sans tracking-widest uppercase hover:bg-pink-600 shadow-[0_0_20px_rgba(236,72,153,0.6)] transition-all duration-300 whitespace-nowrap flex items-center gap-2 justify-center group rounded-sm">
                            JOIN <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Floating WhatsApp Button ── */}
            <div className="fixed bottom-8 right-8 z-[60]">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg text-white hover:shadow-[#25D366]/50 transition-shadow"
                >
                    <MessageCircle size={32} />
                </motion.button>
            </div>

        </div>
    )
}
