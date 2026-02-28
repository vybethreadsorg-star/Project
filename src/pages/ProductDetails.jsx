import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Heart, Plus, Minus, Facebook, Twitter, Instagram } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../lib/supabase'

export function ProductDetails() {
    const { id } = useParams()
    const addItem = useCartStore((state) => state.addItem)
    const user = useAuthStore((s) => s.user)

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    // UI selections
    const [selectedSize, setSelectedSize] = useState('')
    const [activeImage, setActiveImage] = useState(0)

    // Accordion states
    const [openAccordion, setOpenAccordion] = useState('description')

    const sizes = ['IT 38', 'IT 40', 'IT 42', 'IT 44', 'IT 46', 'IT 48', 'IT 50', 'IT 52']

    useEffect(() => {
        fetchProduct()
        window.scrollTo(0, 0)
    }, [id])

    async function fetchProduct() {
        setLoading(true)
        const { data } = await supabase.from('products').select('*').eq('id', id).single()
        setProduct(data)
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border border-black border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
                <h1 className="text-2xl font-light tracking-wide mb-4">Product Not Found</h1>
                <Link to="/shop" className="text-sm border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">Return to Shop</Link>
            </div>
        )
    }

    const fmtPrice = p => '$' + Math.floor(p / 100).toLocaleString('en-US')

    // Simulate multiple images based on the reference if none exist
    const images = [
        product.image,
        product.image, // Placeholder for 2nd angle
        product.image  // Placeholder for 3rd angle
    ]

    const mrp = product.mrp && typeof product.mrp === 'number' ? product.mrp : null
    const hasDiscount = mrp && typeof product.price === 'number' && mrp > product.price
    const discountPercent = hasDiscount ? Math.round((1 - (product.price / mrp)) * 100) : 0
    const hasMrp = mrp != null && mrp > 0

    const toggleAccordion = (section) => {
        setOpenAccordion(openAccordion === section ? null : section)
    }

    const renderWithLinks = (text) => {
        if (!text) return null;
        const parts = text.split(/(refund policy|return policy|shipping policy|size guide)/i);
        return parts.map((part, i) => {
            const lowerPart = part.toLowerCase();
            if (lowerPart === 'refund policy' || lowerPart === 'return policy') {
                return (
                    <Link key={i} to="/refund-policy" className="text-black border-b border-black font-medium hover:text-gray-500 hover:border-gray-500 transition-colors">
                        {part}
                    </Link>
                );
            }
            if (lowerPart === 'shipping policy') {
                return (
                    <Link key={i} to="/shipping-info" className="text-black border-b border-black font-medium hover:text-gray-500 hover:border-gray-500 transition-colors">
                        {part}
                    </Link>
                );
            }
            if (lowerPart === 'size guide') {
                return (
                    <Link key={i} to="/size-guide" className="text-black border-b border-black font-medium hover:text-gray-500 hover:border-gray-500 transition-colors cursor-pointer">
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    const brandName = "Brunello Cucinelli" // Hardcoded example for the luxury feel in the ref

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">

            <div className="pt-28 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">

                {/* Minimalist Breadcrumbs */}
                <nav className="text-[11px] uppercase tracking-widest text-gray-500 mb-12 flex items-center gap-2">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    <span>›</span>
                    <Link to="/shop" className="hover:text-black transition-colors">Designers</Link>
                    <span>›</span>
                    <Link to={`/shop?brand=${brandName}`} className="hover:text-black transition-colors">{brandName.toLowerCase()}</Link>
                    <span>›</span>
                    <span className="text-black">{product.name.toLowerCase()}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Left Column: Image Gallery (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6">
                        {/* Thumbnails */}
                        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible w-full md:w-20 shrink-0">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative w-20 aspect-[3/4] overflow-hidden transition-all ${activeImage === idx ? 'border border-black' : 'border border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover object-center" />
                                </button>
                            ))}
                        </div>

                        {/* Main Stage Image */}
                        <div className="flex-1 bg-[#f9f9f9] aspect-[3/4] relative overflow-hidden group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    src={images[activeImage]}
                                    alt={product.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 w-full h-full object-cover object-center"
                                />
                            </AnimatePresence>
                        </div>
                    </div>


                    {/* Right Column: Product Details (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col pt-4 lg:pr-10">

                        {/* Header block */}
                        <div className="mb-10">
                            <h2 className="text-xl md:text-2xl font-normal tracking-wide mb-2 font-serif">{brandName}</h2>
                            <h1 className="text-sm text-gray-600 font-light tracking-wider capitalize mb-8">{product.name.toLowerCase()}</h1>

                            <div className="flex items-baseline gap-3 mb-2 font-sans font-medium">
                                {hasMrp && (
                                    <span className="text-sm line-through text-gray-400">{fmtPrice(mrp)}</span>
                                )}
                                <span className="text-xl text-pink-500">{fmtPrice(product.price)}</span>
                                {hasDiscount && (
                                    <span className="text-[11px] text-pink-400 ml-2 bg-pink-400/10 px-2 py-1 rounded-full font-bold">({discountPercent}% OFF)</span>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                                Duties and Taxes calculated at shipping page
                            </p>
                        </div>

                        {/* Actions block */}
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-2">
                                <div className="relative w-full mr-4">
                                    <select
                                        value={selectedSize}
                                        onChange={(e) => setSelectedSize(e.target.value)}
                                        className="w-full appearance-none border border-black rounded-none py-3 px-4 text-xs tracking-wider outline-none focus:ring-1 focus:ring-black bg-transparent cursor-pointer"
                                    >
                                        <option value="" disabled>Select Size - Italian Sizing</option>
                                        {sizes.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown size={14} className="text-black" />
                                    </div>
                                </div>
                                <Link to="/size-guide" className="text-[10px] uppercase font-medium border-b border-black tracking-widest shrink-0 hover:text-gray-500 hover:border-gray-500 transition-colors">
                                    Size Guide
                                </Link>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        if (!selectedSize) return alert('Please select a size')
                                        addItem({ ...product, quantity: 1, size: selectedSize }, user?.id)
                                    }}
                                    className="flex-1 bg-black text-white hover:bg-gray-900 py-4 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                                >
                                    ADD TO BAG
                                </button>
                                <button className="w-14 shrink-0 flex items-center justify-center border border-transparent hover:border-gray-200 transition-colors" aria-label="Add to Wishlist">
                                    <Heart size={18} strokeWidth={1} className="text-gray-400 hover:text-black transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Accordions */}
                        <div className="border-t border-gray-200 w-full mb-10">
                            {[
                                { id: 'description', title: 'Description', content: product.description || 'No description available for this item. Please contact our concierge for specific details regarding material and fit.' },
                                { id: 'payment', title: 'Payment Options', content: product.payment_options || 'We accept all major credit cards, Apple Pay, PayPal, and Klarna financing.' },
                                { id: 'shipping', title: 'Delivery and Return Timeline', content: product.delivery_info || 'Free express global shipping on all orders over $500. Returns accepted within 14 days of delivery provided the security tag remains intact.' },
                                { id: 'authenticity', title: 'Authenticity Guarantee', content: product.authenticity_guarantee || 'Every item is verified by our team of luxury experts to ensure total authenticity before shipping to you.' },
                                { id: 'offers', title: 'Special Offers', content: `Current Offer Price: ${fmtPrice(product.price)}\nOriginal Price: ${fmtPrice(originalPrice)}\n\n${product.special_offers || 'Automatically applied at checkout when using an eligible premium credit card.'}` },
                            ].map((section) => (
                                <div key={section.id} className="border-b border-gray-200">
                                    <button
                                        onClick={() => toggleAccordion(section.id)}
                                        className="w-full flex items-center justify-between text-left focus:outline-none group py-5"
                                    >
                                        <span className={`text-[10px] font-medium uppercase tracking-[0.15em] transition-colors ${openAccordion === section.id ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>
                                            {section.title}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className={`text-gray-400 transition-transform duration-300 ${openAccordion === section.id ? 'rotate-180 text-black' : ''}`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openAccordion === section.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 text-xs font-light text-gray-500 leading-relaxed whitespace-pre-line tracking-wide">
                                                    {renderWithLinks(section.content)}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Social footer */}
                        <div className="mt-8 flex items-center gap-4">
                            <span className="text-[10px] font-medium tracking-widest uppercase">Share:</span>
                            <div className="flex gap-3">
                                <button className="hover:opacity-60 transition-opacity"><Facebook size={12} fill="currentColor" /></button>
                                <button className="hover:opacity-60 transition-opacity"><Instagram size={12} /></button>
                                <button className="hover:opacity-60 transition-opacity"><Twitter size={12} fill="currentColor" /></button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
