import React, { useState, useMemo, useEffect } from 'react'
import { ProductCard } from '../components/shop/ProductCard'
import { Search, ChevronDown, Filter, Zap, Cpu, Sparkles, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'


const CATEGORIES = ["ALL", "SHIRTS", "HOODIES", "PANTS", "T-SHIRTS", "OUTERWEAR", "KNITWEAR", "CUSTOM"]

export function Shop() {
    const [allProducts, setAllProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOrder, setSortOrder] = useState("newest")
    const [isSortOpen, setIsSortOpen] = useState(false)

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('id', { ascending: false })
            if (!error) {
                setAllProducts((data || []).map(p => ({
                    ...p,
                    price: Math.floor(p.price / 100).toLocaleString('en-IN'),
                })))
            }
            setLoading(false)
        }
        fetchProducts()
    }, [])

    const sortOptions = [
        { id: 'newest', label: 'NEWEST' },
        { id: 'price-low', label: 'LOW PRICE' },
        { id: 'price-high', label: 'HIGH PRICE' },
    ]

    const filteredProducts = useMemo(() => {
        return allProducts
            .filter(p => {
                if (selectedCategory === "ALL") return true;
                const cat = p.category.split(' | ')[0];
                return cat.includes(selectedCategory.replace(/S$/, '')) || selectedCategory.includes(cat.replace(/S$/, ''));
            })
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                const priceA = parseInt(a.price.replace(/,/g, ''))
                const priceB = parseInt(b.price.replace(/,/g, ''))
                if (sortOrder === "price-low") return priceA - priceB
                if (sortOrder === "price-high") return priceB - priceA
                return 0
            })
    }, [allProducts, selectedCategory, searchQuery, sortOrder])

    return (
        <div className="pt-16 pb-24 px-6 md:px-8 max-w-[1400px] mx-auto min-h-screen relative overflow-hidden bg-black text-white">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] -z-10" />

            {/* Page Header */}
            <div className="mb-8 flex flex-col items-center text-center px-4">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-cyan-400" size={16} />
                    <h2 className="text-[12px] uppercase tracking-widest text-cyan-400 font-bold font-sans">Latest Drops</h2>
                </div>
                <h1 className="text-4xl md:text-6xl font-cyber mb-6 tracking-wide font-black uppercase">
                    <span className="text-white drop-shadow-md">THE </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300 drop-shadow-sm">COLLECTION</span>
                </h1>
                <p className="text-gray-300 text-[15px] tracking-wide max-w-xl mx-auto font-sans leading-relaxed">
                    Discover piece-unique luxury streetwear crafted for the modern individual. Curated essentials designed to elevate your everyday syntax.
                </p>
            </div>

            {/* Filters & Tools */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-16 border-b border-white/10 pb-6 sticky top-20 z-30 bg-black/80 backdrop-blur-xl px-4 py-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex flex-wrap gap-4 md:gap-8 w-full xl:w-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`text-[12px] uppercase tracking-widest font-sans font-semibold transition-all relative pb-2 whitespace-nowrap ${selectedCategory === cat ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {cat}
                            {selectedCategory === cat && (
                                <motion.div layoutId="activeCat" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto shrink-0">
                    <div className="relative w-full sm:w-64 group bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-cyan-500/50 transition-colors">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-cyan-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none pl-8 outline-none text-[12px] uppercase tracking-widest font-sans font-semibold text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Custom Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-3 text-[12px] uppercase tracking-widest text-gray-300 font-sans font-semibold bg-[#111111] rounded-full px-5 py-3 border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
                        >
                            <span>Sort:</span>
                            <span className="text-white font-bold w-[90px] text-left">
                                {sortOptions.find(opt => opt.id === sortOrder)?.label}
                            </span>
                            <ChevronDown
                                size={16}
                                className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-cyan-400' : 'text-gray-300'}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <>
                                    {/* Invisible backdrop to detect outside clicks */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsSortOpen(false)}
                                    />

                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-full min-w-[160px] bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 py-2"
                                    >
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    setSortOrder(option.id);
                                                    setIsSortOpen(false);
                                                }}
                                                className={`w-full text-left px-5 py-3 text-[12px] uppercase tracking-widest font-sans font-bold transition-colors ${sortOrder === option.id
                                                    ? 'text-cyan-400 bg-white/5'
                                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <Loader2 size={36} className="text-cyan-400 animate-spin" />
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12 pb-12">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center rounded-2xl border border-white/5 bg-white/5 space-y-6 mx-4">
                    <Sparkles size={48} className="mx-auto text-cyan-500/20" />
                    <p className="text-gray-300 tracking-widest uppercase text-[14px] font-sans font-semibold">No items matched your search.</p>
                    <button
                        onClick={() => { setSelectedCategory("ALL"); setSearchQuery("") }}
                        className="text-white text-[12px] uppercase tracking-widest font-sans font-bold hover:text-cyan-400 transition-colors border-b border-cyan-400/30 pb-1"
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    )
}
