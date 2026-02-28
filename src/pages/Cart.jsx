import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { ShoppingBag, X, Plus, Minus, ArrowRight, ShieldCheck, Trash2 } from 'lucide-react';

export function Cart() {
    const { cartItems, removeItem, updateQuantity } = useCartStore();
    const user = useAuthStore((s) => s.user);

    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseInt(item.price.replace(/,/g, ''));
        return acc + price * item.quantity;
    }, 0);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-black pt-40 pb-32 px-6 md:px-12 flex flex-col items-center font-sans">
                <ShoppingBag size={64} className="text-gray-500 mb-8" strokeWidth={1} />
                <h1 className="text-4xl tracking-widest uppercase text-white mb-4 font-black">Your Bag is Empty</h1>
                <p className="text-gray-400 text-center max-w-md mb-8 font-semibold tracking-wide">
                    Looks like you haven't added anything yet. Discover our latest arrivals.
                </p>
                <Link to="/shop">
                    <button className="bg-white text-black py-4 px-8 uppercase tracking-widest text-sm font-black hover:bg-gray-200 transition-colors flex items-center gap-2 rounded-xl">
                        Continue Shopping <ArrowRight size={16} />
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-32 pb-32 px-4 md:px-8 text-white font-sans selection:bg-cyan-500/30">
            <div className="max-w-[1240px] mx-auto relative z-10">
                <div className="mb-14 border-b border-white/10 pb-6">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3 uppercase">
                        Your Bag
                    </h1>
                    <div className="flex items-center gap-3 text-gray-400 text-[13px] font-bold tracking-widest uppercase">
                        <span className="text-cyan-400">{cartItems.length} items</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> Secure Checkout</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="hidden md:grid grid-cols-12 gap-6 pb-4 border-b border-white/10 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-3 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-1"></div>
                        </div>

                        <AnimatePresence>
                            {cartItems.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={item.cartItemId}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl group hover:border-white/30 transition-all shadow-sm hover:shadow-cyan-500/10"
                                >
                                    {/* Mobile Only: Product Name & Delete */}
                                    <div className="md:hidden flex justify-between items-start w-full mb-2">
                                        <h3 className="text-sm font-bold tracking-wide text-white">{item.name}</h3>
                                        <button onClick={() => removeItem(item.cartItemId, user?.id)} className="text-gray-500 hover:text-pink-400 transition-colors p-1 bg-white/5 rounded-full">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Product Details Column */}
                                    <div className="col-span-6 flex items-center gap-5">
                                        <div className="w-24 md:w-28 aspect-[4/5] bg-black border border-white/10 rounded-xl relative overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all group-hover:scale-105 duration-500" />
                                            {item.custom && (
                                                <div className="absolute top-2 left-2 bg-cyan-500 text-black text-[10px] font-black px-2 py-1 tracking-widest uppercase rounded">
                                                    Custom
                                                </div>
                                            )}
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="flex gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                                <span>{item.category.split('|')[0]}</span>
                                                <span className="text-cyan-400">Size: {item.size}</span>
                                            </div>
                                            <h3 className="text-lg font-bold tracking-wide text-white leading-tight">{item.name}</h3>
                                            {item.custom && <p className="text-xs font-semibold text-gray-400 mt-2 line-clamp-2 bg-white/5 p-2 rounded-lg border border-white/10">"{item.custom.text}"</p>}
                                        </div>
                                    </div>

                                    {/* Mobile Only details */}
                                    <div className="md:hidden w-full flex justify-between items-center mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                            Size: <span className="text-cyan-400">{item.size}</span>
                                        </div>
                                        <div className="text-lg font-black text-white tracking-widest">₹{item.price}</div>
                                    </div>

                                    {/* Quantity Column */}
                                    <div className="col-span-3 flex justify-start md:justify-center items-center">
                                        <div className="flex items-center gap-4 bg-[#111111] border border-white/10 p-2 rounded-xl px-4 select-none">
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1), user?.id)}
                                                className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-6 text-center text-[15px] font-bold text-white tracking-widest">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1, user?.id)}
                                                className="text-gray-400 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price Column */}
                                    <div className="col-span-2 hidden md:block text-right">
                                        <span className="text-lg font-black text-gray-200 tracking-widest">₹{(parseInt(item.price.replace(/,/g, '')) * item.quantity).toLocaleString('en-IN')}</span>
                                    </div>

                                    {/* Remove Column */}
                                    <div className="col-span-1 hidden md:flex justify-end">
                                        <button
                                            onClick={() => removeItem(item.cartItemId, user?.id)}
                                            className="text-gray-500 hover:text-pink-400 bg-white/5 hover:bg-pink-400/10 p-2 rounded-full transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4 w-full">
                        <div className="bg-[#111111] border border-white/10 p-8 rounded-3xl sticky top-32 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                            <h3 className="text-[15px] font-bold tracking-widest uppercase text-white mb-6 border-b border-white/10 pb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-5 text-[15px] tracking-wide font-semibold">
                                <div className="flex justify-between items-center text-gray-400">
                                    <span className="uppercase text-[12px] tracking-widest">Subtotal</span>
                                    <span className="text-white tracking-widest">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-400">
                                    <span className="uppercase text-[12px] tracking-widest">Shipping</span>
                                    <span className="text-emerald-400 tracking-widest">FREE</span>
                                </div>

                                <div className="pt-6 mt-6 border-t border-white/10">
                                    <div className="flex justify-between items-end mb-8">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                                        <span className="text-3xl font-black tracking-tighter text-white">
                                            ₹{subtotal.toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    <Link to="/checkout" className="block w-full">
                                        <button className="w-full py-5 bg-white text-black hover:bg-gray-200 text-[13px] font-black uppercase tracking-widest transition-all rounded-2xl flex justify-center items-center gap-3 group active:scale-[0.98]">
                                            <span>Proceed to Checkout</span>
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>

                                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400/70 mt-6 bg-emerald-900/10 py-3 rounded-xl border border-emerald-500/10">
                                        <ShieldCheck size={14} className="text-emerald-400" /> Secure Encrypted Payment
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

