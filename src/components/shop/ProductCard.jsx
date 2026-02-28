import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { ProductModal } from './ProductModal'

const LABEL_STYLES = {
    NEW: 'bg-emerald-500 text-white',
    HOT: 'bg-red-500 text-white',
    SALE: 'bg-pink-500 text-white',
    LIMITED: 'bg-amber-500 text-white',
    BESTSELLER: 'bg-violet-600 text-white',
    'OUT OF STOCK': 'bg-red-600 text-white',
    'STOCK LIMITED': 'bg-amber-600 text-white',
}

export function ProductCard({ product }) {
    const addItem = useCartStore((state) => state.addItem)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const hasMrp = product.mrp != null && product.mrp > 0
    const hasDiscount = hasMrp && typeof product.price === 'number' && product.mrp > product.price
    const discountPct = hasDiscount
        ? Math.round((1 - product.price / product.mrp) * 100)
        : 0

    const fmtPrice = (val) => {
        const num = typeof val === 'number' ? Math.floor(val / 100) : parseInt(String(val).replace(/,/g, ''), 10)
        return isNaN(num) ? val : num.toLocaleString('en-IN')
    }

    const sizes = Array.isArray(product.sizes) ? product.sizes : []

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="group relative flex flex-col w-full bg-neon-gradient rounded-[18px] p-[2px] transition-all duration-300 hover:shadow-[0_15px_40px_rgba(255,255,255,0.06)]"
        >
            <div className="w-full h-full bg-[#FAFAFA] rounded-[16px] p-4 flex flex-col">
                <div
                    className="relative aspect-[4/5] mb-4 bg-gray-100 rounded-xl overflow-hidden shadow-inner cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 xl:group-hover:scale-[1.03]"
                        onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#f3f4f6'; }}
                    />

                    {/* Label Badge */}
                    {product.label && (
                        <div className="absolute top-3 left-3 z-20">
                            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-[4px] shadow tracking-widest uppercase ${LABEL_STYLES[product.label] || 'bg-black text-white'}`}>
                                {product.label}
                            </span>
                        </div>
                    )}

                    {/* Discount % badge */}
                    {hasDiscount && (
                        <div className="absolute top-3 right-3 z-20">
                            <span className="text-[10px] font-bold px-2 py-1.5 rounded-full bg-black/80 text-pink-400 shadow tracking-wider">
                                -{discountPct}%
                            </span>
                        </div>
                    )}

                    {/* Bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Add to Bag button */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-0 lg:translate-y-4 opacity-100 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true) }}
                            className="w-full bg-[#111111] text-white py-3.5 rounded-full font-sans text-[12px] font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg"
                        >
                            Add to Bag
                        </button>
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col space-y-1.5 px-1">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] text-gray-400 font-sans font-bold tracking-widest uppercase mb-0.5">
                                {product.category.split('|')[0].trim()}
                            </span>
                            <h3 className="text-[15px] font-sans font-bold tracking-tight text-gray-900 leading-tight truncate">
                                {product.name}
                            </h3>
                        </div>

                        {/* Price block */}
                        <div className="shrink-0 text-right">
                            {hasMrp && (
                                <p className="text-[13px] text-gray-400 font-bold line-through leading-none mb-1">
                                    ₹{fmtPrice(product.mrp)}
                                </p>
                            )}
                            <p className="text-[19px] font-bold text-pink-500 font-sans leading-tight">
                                ₹{fmtPrice(product.price)}
                            </p>
                        </div>
                    </div>

                    {/* Sizes */}
                    {sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {sizes.map(size => (
                                <span key={size} className="text-[10px] font-bold text-gray-500 border border-gray-200 px-2 py-0.5 rounded uppercase tracking-wider">
                                    {size}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </motion.div>
    )
}
