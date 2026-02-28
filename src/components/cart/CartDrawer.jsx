import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { X, Plus, Minus, ArrowRight, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function CartDrawer() {
    const { isOpen, closeCart, cartItems, removeItem, updateQuantity } = useCartStore();
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseInt(item.price.replace(/,/g, ''));
        return acc + price * item.quantity;
    }, 0);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('cart-drawer-open');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('cart-drawer-open');
            if (!document.body.classList.contains('product-modal-open')) {
                document.body.style.overflow = '';
            }
        }
        return () => {
            document.body.classList.remove('cart-drawer-open');
            if (!document.body.classList.contains('product-modal-open')) {
                document.body.style.overflow = '';
            }
        };
    }, [isOpen]);

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md z-[100] flex flex-col font-sans text-white shadow-2xl overflow-hidden border-l border-white/10 bg-[#1A1A24]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-8 pt-8">
                            <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
                                Your Bag <span className="text-white/50 text-base font-medium">({cartItems.length})</span>
                            </h2>
                            <button
                                onClick={closeCart}
                                className="w-10 h-10 flex items-center justify-center transition-colors rounded-full text-white/60 hover:text-white"
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                            >
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Scrollable Area (Items + Footer) */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent">

                            {/* Cart Items Section */}
                            <div className="flex-1 px-6 space-y-4">
                                {cartItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pb-20">
                                        <p className="text-gray-300 font-semibold tracking-wide">Your bag is currently empty.</p>
                                        <button
                                            onClick={closeCart}
                                            className="text-sm font-bold text-white hover:text-gray-300 transition-colors underline decoration-white/30 underline-offset-4 tracking-wide"
                                        >
                                            Continue Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pb-4">
                                        {cartItems.map((item) => (
                                            <motion.div
                                                layout
                                                key={item.cartItemId}
                                                className="relative p-4 rounded-3xl flex gap-5 overflow-hidden group border transition-all duration-300 shadow-md"
                                                style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
                                            >
                                                {/* Hover Glow Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/5 group-hover:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                                {/* Image Container */}
                                                <div className="w-[100px] h-[120px] bg-[#1A1A24] border border-white/5 relative overflow-hidden flex-shrink-0 rounded-2xl">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Item Details */}
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="text-sm font-bold tracking-widest uppercase leading-tight pr-4">
                                                                {item.name}
                                                            </h3>
                                                            <button
                                                                onClick={() => removeItem(item.cartItemId, user?.id)}
                                                                className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5 mr-1"
                                                            >
                                                                <Trash2 size={16} strokeWidth={1.5} />
                                                            </button>
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">
                                                            {item.category.split('|')[0]} &nbsp;&bull;&nbsp; SIZE: {item.size}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4 border-t border-transparent">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center justify-between bg-[#1a1a1a] rounded-full px-3 py-1.5 w-[90px]">
                                                            <button
                                                                onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1), user?.id)}
                                                                className="text-gray-300 hover:text-white transition-colors"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="text-xs font-bold w-4 text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1, user?.id)}
                                                                className="text-gray-300 hover:text-white transition-colors"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>

                                                        <p className="text-[15px] font-black mr-1 tracking-wide">
                                                            ₹{(parseInt(item.price.replace(/,/g, '')) * item.quantity).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer (Summary & Actions) Now inside the scrolling container */}
                            {cartItems.length > 0 && (
                                <div className="px-6 pb-6 pt-6 shrink-0 z-10">
                                    <div className="rounded-[2rem] p-6 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        {/* Subtle glow effect behind summary */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl opacity-50" />

                                        <div className="space-y-4 font-bold mb-12 relative z-10">
                                            <div className="flex justify-between items-center text-white/60 text-sm tracking-wide">
                                                <span>Subtotal</span>
                                                <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-white/60 text-sm tracking-wide">
                                                <span>Shipping</span>
                                                <span className="text-emerald-400 font-bold">Complimentary</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[12px] text-white/50 font-bold uppercase tracking-widest">Estimated Total</span>
                                            <span className="text-2xl font-black tracking-tight">₹{subtotal.toLocaleString('en-IN')}</span>
                                        </div>

                                        <button
                                            onClick={handleCheckout}
                                            className="w-full py-4 font-bold uppercase tracking-widest transition-all rounded-full flex justify-center items-center gap-3 text-sm text-white"
                                            style={{ background: 'linear-gradient(to right, #22d3ee, #a855f7, #ec4899)' }}
                                        >
                                            <span>Secure Checkout</span>
                                            <ArrowRight size={18} strokeWidth={2} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
}
