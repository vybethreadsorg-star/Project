import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, CreditCard, Wallet, Tag, X,
    CheckCircle2, MapPin, Lock, Sparkles, ArrowRight,
    Truck, Star, ShoppingBag, Home, Plus, Bookmark
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

// ─── THEME ──────────────────────────────────────────────────────────────────
// Background: #1A1A24 (matches Auth & CartDrawer)
// Cards: glassmorphism rgba(255,255,255,0.07) + blur
// Buttons: cyan→purple→pink gradient

const CARD_STYLE = { background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' };

const INPUT = [
    'w-full text-white px-5 py-4 rounded-2xl text-[15px] font-sans font-semibold tracking-wide',
    'outline-none transition-all placeholder:text-white/30',
    'focus:shadow-[0_0_0_3px_rgba(103,232,249,0.25)]'
].join(' ');

const INPUT_STYLE = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' };
const INPUT_FOCUS_STYLE = { background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(103,232,249,0.5)' };

const LABEL = 'block text-[12px] font-bold text-white/50 uppercase tracking-widest mb-2 ml-1';


const STEPS = [
    { label: 'DETAILS', icon: MapPin },
    { label: 'DELIVERY', icon: Truck },
    { label: 'PAYMENT', icon: CreditCard },
];

export function Checkout() {
    const { cartItems, appliedCoupon, discount, applyCoupon, removeCoupon } = useCartStore();
    const user = useAuthStore((s) => s.user);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '', firstName: '', lastName: '',
        address: '', city: '', state: '', pincode: '', phone: '',
    });
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' | 'express'

    // ── Saved addresses ──────────────────────────────────────────────────────
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addingNew, setAddingNew] = useState(true); // default: show form
    const [saveAddress, setSaveAddress] = useState(false);
    const [addressLabel, setAddressLabel] = useState('Home');
    const [addrLoading, setAddrLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    // Fetch saved addresses on mount
    useEffect(() => {
        if (!user) { setAddingNew(true); setAddrLoading(false); return; }
        supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error || !data || data.length === 0) {
                    // No table yet or no addresses: show the form
                    setAddingNew(true);
                    setSavedAddresses([]);
                } else {
                    // Has saved addresses: show picker, pre-select first
                    setSavedAddresses(data);
                    setSelectedAddressId(data[0].id);
                    setFormData(f => ({ ...f, ...data[0].data }));
                    setAddingNew(false);
                }
                setAddrLoading(false);
            })
            .catch(() => { setAddingNew(true); setAddrLoading(false); });
    }, [user]);

    const subtotal = cartItems.reduce((acc, item) => {
        return acc + parseInt(String(item.price).replace(/,/g, '')) * item.quantity;
    }, 0);
    const shippingCost = shippingMethod === 'express' ? 149 : 0;
    const finalTotal = Math.max(0, subtotal + shippingCost - discount);

    const handleInput = (e) => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
    const next = () => setStep(s => Math.min(s + 1, 3));
    const prev = () => setStep(s => Math.max(s - 1, 1));

    // Select a saved address & populate formData
    const handleSelectAddress = (addr) => {
        setSelectedAddressId(addr.id);
        setAddingNew(false);
        setFormData(f => ({ ...f, ...addr.data }));
    };

    // Step 1 Next: optionally save new address then proceed
    const handleNextStep1 = async () => {
        if (addingNew && saveAddress && user && formData.address) {
            await supabase.from('user_addresses').insert({
                user_id: user.id,
                label: addressLabel || 'Home',
                data: {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    phone: formData.phone,
                },
            });
        }
        next();
    };

    async function handleApplyCoupon() {
        const code = couponCode.trim().toUpperCase();
        if (!code) return;
        setCouponLoading(true); setCouponError(''); setCouponSuccess('');

        const { data: c, error } = await supabase.from('coupons').select('*').eq('code', code).single();
        if (error || !c) {
            console.error('Coupon fetch error:', error);
            setCouponError('INVALID CODE');
            setCouponLoading(false);
            return;
        }
        if (!c.is_active) { setCouponError('INACTIVE CODE'); setCouponLoading(false); return; }
        if (c.expires_at && new Date(c.expires_at) < new Date()) { setCouponError('EXPIRED CODE'); setCouponLoading(false); return; }
        if (c.min_order && subtotal * 100 < c.min_order) { setCouponError(`MIN. ORDER ₹${Math.floor(c.min_order / 100)} REQUIRED`); setCouponLoading(false); return; }
        if (c.max_uses != null && c.uses_count >= c.max_uses) { setCouponError('LIMIT REACHED'); setCouponLoading(false); return; }

        const amt = Math.min(c.type === 'percent' ? Math.round(subtotal * c.value / 100) : Math.floor(c.value / 100), subtotal);
        applyCoupon({ id: c.id, code: c.code, type: c.type, value: c.value }, amt);
        setCouponSuccess(c.type === 'percent' ? `${c.value}% OFF APPLIED!` : `₹${amt} OFF APPLIED!`);
        setCouponLoading(false);
    }

    function handleRemoveCoupon() {
        removeCoupon();
        setCouponCode('');
        setCouponError('');
        setCouponSuccess('');
    }
    function handleRemoveCoupon() { removeCoupon(); setCouponCode(''); setCouponError(''); setCouponSuccess(''); }

    // ── Steps ─────────────────────────────────────────────────────────────────
    const Step1 = (
        <div className="space-y-6">
            <STitle icon={MapPin} n={1}>Delivery Address</STitle>

            {/* ── Saved Addresses ────────────────────────────────── */}
            {!addrLoading && savedAddresses.length > 0 && (
                <div className="space-y-3">
                    <p className={LABEL}>Your Saved Addresses</p>
                    {savedAddresses.map(addr => {
                        const selected = selectedAddressId === addr.id && !addingNew;
                        return (
                            <button
                                key={addr.id}
                                type="button"
                                onClick={() => handleSelectAddress(addr)}
                                className="w-full text-left p-4 rounded-2xl transition-all"
                                style={{
                                    background: selected ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${selected ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                    boxShadow: selected ? '0 0 0 3px rgba(34,211,238,0.15)' : 'none',
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                        style={{ borderColor: selected ? '#22d3ee' : 'rgba(255,255,255,0.2)' }}>
                                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Home size={12} className="text-cyan-400 flex-shrink-0" />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300">{addr.label}</span>
                                        </div>
                                        <p className="text-white text-[14px] font-semibold">{addr.data.firstName} {addr.data.lastName}</p>
                                        <p className="text-white/50 text-[12px] mt-0.5 truncate">{addr.data.address}, {addr.data.city}, {addr.data.state} – {addr.data.pincode}</p>
                                        <p className="text-white/40 text-[11px]">{addr.data.phone}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {/* Add new address button */}
                    <button
                        type="button"
                        onClick={() => { setAddingNew(true); setSelectedAddressId(null); }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white/60 hover:text-white text-[12px] font-bold uppercase tracking-widest transition-all"
                        style={{ background: addingNew ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.04)', border: `1px dashed ${addingNew ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.15)'}` }}
                    >
                        <Plus size={14} /> Add New Address
                    </button>
                </div>
            )}

            {/* ── New Address Form ──────────────────────────────── */}
            <AnimatePresence>
                {addingNew && (
                    <motion.div
                        key="new-addr-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                    >
                        <Fld l="Email Address">
                            <input type="email" name="email" placeholder="sweet@example.com" value={formData.email} onChange={handleInput} className={INPUT} />
                        </Fld>

                        <div className="grid grid-cols-2 gap-5">
                            <Fld l="First Name">
                                <input type="text" name="firstName" placeholder="Arjun" value={formData.firstName} onChange={handleInput} className={INPUT} />
                            </Fld>
                            <Fld l="Last Name">
                                <input type="text" name="lastName" placeholder="Sharma" value={formData.lastName} onChange={handleInput} className={INPUT} />
                            </Fld>
                        </div>

                        <Fld l="Street Address">
                            <input type="text" name="address" placeholder="123 Peach Avenue" value={formData.address} onChange={handleInput} className={INPUT} />
                        </Fld>

                        <div className="grid grid-cols-3 gap-4">
                            <Fld l="City">
                                <input type="text" name="city" placeholder="Mumbai" value={formData.city} onChange={handleInput} className={INPUT} />
                            </Fld>
                            <Fld l="State">
                                <input type="text" name="state" placeholder="MH" value={formData.state} onChange={handleInput} className={INPUT} />
                            </Fld>
                            <Fld l="PIN">
                                <input type="text" name="pincode" placeholder="400001" value={formData.pincode} onChange={handleInput} className={INPUT} />
                            </Fld>
                        </div>

                        <Fld l="Phone Number">
                            <input type="tel" name="phone" placeholder="+91 00000 00000" value={formData.phone} onChange={handleInput} className={INPUT} />
                        </Fld>

                        {/* Save address toggle (only for logged-in users) */}
                        {user && (
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSaveAddress(s => !s)}
                                    className="flex items-center gap-3 group w-fit"
                                >
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                                        style={{ background: saveAddress ? 'linear-gradient(135deg,#22d3ee,#a855f7)' : 'rgba(255,255,255,0.08)', border: `1px solid ${saveAddress ? 'transparent' : 'rgba(255,255,255,0.2)'}` }}>
                                        {saveAddress && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <span className="text-[12px] font-bold text-white/60 group-hover:text-white/90 transition-colors uppercase tracking-wide">
                                        Save this address to my account
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {saveAddress && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-3 overflow-hidden"
                                        >
                                            <label className={LABEL}>Address Label</label>
                                            <div className="flex gap-2">
                                                {['Home', 'Work', 'Other'].map(lbl => (
                                                    <button
                                                        key={lbl}
                                                        type="button"
                                                        onClick={() => setAddressLabel(lbl)}
                                                        className="px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wide transition-all"
                                                        style={{
                                                            background: addressLabel === lbl ? 'linear-gradient(135deg,#22d3ee,#a855f7)' : 'rgba(255,255,255,0.07)',
                                                            border: `1px solid ${addressLabel === lbl ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                                                            color: addressLabel === lbl ? '#fff' : 'rgba(255,255,255,0.5)',
                                                        }}
                                                    >{lbl}</button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pt-4">
                <NeonBtn onClick={handleNextStep1}>PROCEED TO DELIVERY <ArrowRight size={16} /></NeonBtn>
            </div>
        </div>
    );


    const Step2 = (
        <div className="space-y-6">
            <STitle icon={Truck} n={2}>Shipping Method</STitle>
            <MiniSummary formData={formData} onEdit={prev} />

            <div className="space-y-4 pt-2">
                <label onClick={() => setShippingMethod('standard')} className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all shadow-sm ${shippingMethod === 'standard' ? 'border border-cyan-500/50 bg-cyan-900/10' : 'border border-white/10 bg-[#0a0a0a] opacity-70 hover:opacity-100 hover:border-white/30'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${shippingMethod === 'standard' ? 'border-4 border-cyan-400 bg-[#111111]' : 'border border-gray-600'}`} />
                        <div>
                            <p className="text-white font-bold text-sm tracking-wide">Standard Delivery</p>
                            <p className="text-gray-400 text-xs mt-1">5–7 business days</p>
                        </div>
                    </div>
                    <span className={`font-bold text-xs px-3 py-1 rounded-full border tracking-widest ${shippingMethod === 'standard' ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/30' : 'text-gray-400 border-white/20'}`}>FREE</span>
                </label>

                <label onClick={() => setShippingMethod('express')} className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all shadow-sm ${shippingMethod === 'express' ? 'border border-pink-500/50 bg-pink-900/10' : 'border border-white/10 bg-[#0a0a0a] opacity-70 hover:opacity-100 hover:border-white/30'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${shippingMethod === 'express' ? 'border-4 border-pink-400 bg-[#111111]' : 'border border-gray-600'}`} />
                        <div>
                            <p className="text-white font-bold text-sm tracking-wide">Express Delivery</p>
                            <p className="text-gray-400 text-xs mt-1">1–2 business days</p>
                        </div>
                    </div>
                    <span className={`font-bold text-sm ${shippingMethod === 'express' ? 'text-pink-400' : 'text-gray-300'}`}>₹149</span>
                </label>
            </div>

            <div className="flex gap-4 pt-4">
                <GhostBtn onClick={prev}>GO BACK</GhostBtn>
                <NeonBtn onClick={next} flex2>PROCEED TO PAYMENT <Lock size={15} /></NeonBtn>
            </div>
        </div>
    );

    const Step3 = (
        <div className="space-y-6">
            <STitle icon={Lock} n={3}>Secure Payment</STitle>
            <MiniSummary formData={formData} onEdit={() => setStep(1)} showMethod />

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase bg-emerald-900/20 py-2.5 px-4 rounded-xl border border-emerald-500/20 w-fit">
                <ShieldCheck size={16} className="text-emerald-400" />
                256-BIT SSL ENCRYPTED
            </div>

            {/* Credit Card Box */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full border-4 border-cyan-400 bg-[#0a0a0a] flex-shrink-0" />
                        <span className="text-white font-bold text-sm flex items-center gap-3 tracking-wide uppercase">
                            <CreditCard size={18} className="text-cyan-400" /> CREDIT / DEBIT CARD
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <input type="text" placeholder="CARD NUMBER" maxLength={19} className={INPUT + " font-mono tracking-widest"} style={INPUT_STYLE} onFocus={e => Object.assign(e.target.style, INPUT_FOCUS_STYLE)} onBlur={e => Object.assign(e.target.style, INPUT_STYLE)} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM / YY" className={INPUT + " font-mono tracking-widest text-center"} style={INPUT_STYLE} onFocus={e => Object.assign(e.target.style, INPUT_FOCUS_STYLE)} onBlur={e => Object.assign(e.target.style, INPUT_STYLE)} />
                        <input type="text" placeholder="CVV" maxLength={4} className={INPUT + " font-mono tracking-widest text-center"} style={INPUT_STYLE} onFocus={e => Object.assign(e.target.style, INPUT_FOCUS_STYLE)} onBlur={e => Object.assign(e.target.style, INPUT_STYLE)} />
                    </div>
                    <input type="text" placeholder="NAME ON CARD" className={INPUT + " uppercase tracking-widest"} style={INPUT_STYLE} onFocus={e => Object.assign(e.target.style, INPUT_FOCUS_STYLE)} onBlur={e => Object.assign(e.target.style, INPUT_STYLE)} />
                </div>
            </div>

            {/* UPI Option */}
            <label className="flex items-center justify-between p-6 rounded-2xl cursor-pointer hover:opacity-90 transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0" />
                    <span className="text-white font-bold text-sm flex items-center gap-3 tracking-wide uppercase">
                        <Wallet size={18} className="text-gray-400" /> UPI / NET BANKING
                    </span>
                </div>
            </label>

            <div className="flex gap-4 pt-4">
                <GhostBtn onClick={prev}>BACK</GhostBtn>
                <NeonBtn flex2>
                    PAY ₹{finalTotal.toLocaleString('en-IN')} <Sparkles size={16} />
                </NeonBtn>
            </div>
        </div>
    );

    // ── Layout ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen pt-28 pb-24 px-4 md:px-8 font-sans relative overflow-hidden text-white selection:bg-cyan-500/30 bg-[#1A1A24]">

            {/* Ambient Glow Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[130px]" />
                <div className="absolute top-[20%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-500/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-pink-500/5 blur-[130px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <div className="max-w-[1240px] mx-auto relative z-10">

                {/* PAGE HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-8"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] border border-white/10 shadow-sm rounded-full mb-6 text-cyan-400">
                            <ShoppingBag size={14} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">CHECKOUT</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-3 text-white uppercase font-cyber">
                            Complete Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300">Purchase</span>
                        </h1>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-1 md:gap-2">
                        {STEPS.map((s, i) => {
                            const num = i + 1, active = step === num, done = step > num;
                            return (
                                <React.Fragment key={s.label}>
                                    <button onClick={() => done && setStep(num)}
                                        className={`flex flex-col items-center gap-2 transition-all group ${active ? '' : done ? 'cursor-pointer' : 'cursor-default opacity-50'}`}>

                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-white text-black shadow-[0_8px_20px_rgba(255,255,255,0.2)] scale-105' : done ? 'bg-[#111111] text-cyan-400 border border-cyan-500/30' : 'bg-transparent text-gray-500 border border-white/10'}`}>
                                            {done ? <CheckCircle2 size={20} className="text-emerald-400" /> : <s.icon size={18} />}
                                        </div>

                                        <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-white' : 'text-gray-500'}`}>
                                            {s.label}
                                        </span>
                                    </button>

                                    {i < STEPS.length - 1 && (
                                        <div className={`h-[2px] w-8 md:w-16 self-start mt-6 transition-all duration-500 rounded-full ${done ? 'bg-cyan-500' : 'bg-white/10'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">

                    {/* LEFT COLUMN: The Form */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]" style={CARD_STYLE}>
                            <AnimatePresence mode="wait">
                                <motion.div key={step}
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                                    {step === 1 && Step1}
                                    {step === 2 && Step2}
                                    {step === 3 && Step3}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="lg:col-span-5 sticky top-28">
                        <div className="rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]" style={CARD_STYLE}>

                            <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white tracking-wide uppercase">Your Bag</h3>
                                <div className="bg-white/5 text-gray-300 font-bold text-[11px] px-3 py-1.5 rounded-full border border-white/10 tracking-widest">
                                    {cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''}
                                </div>
                            </div>

                            {/* Cart Items List */}
                            <div className="space-y-5 max-h-[35vh] overflow-y-auto pr-2 mb-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {cartItems.map(item => {
                                    const price = parseInt(String(item.price).replace(/,/g, ''));
                                    return (
                                        <div key={item.cartItemId} className="flex gap-4 group">
                                            <div className="relative w-24 h-28 flex-shrink-0 bg-black border border-white/10 rounded-2xl overflow-hidden p-1 shadow-sm">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl opacity-95 transition-transform duration-500 group-hover:scale-105" onError={e => { e.target.style.display = 'none'; }} />
                                                <div className="absolute top-0 right-0 py-0.5 px-2 m-2 bg-white/90 text-black text-[10px] font-bold rounded-lg shadow-sm">
                                                    x{item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1 py-1 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-white text-[15px] font-bold tracking-wide leading-snug">{item.name}</p>
                                                    <p className="text-gray-400 text-[11px] uppercase tracking-widest mt-1">Size: {item.size}</p>
                                                </div>
                                                <div className="text-gray-200 text-[15px] font-black tracking-widest">
                                                    ₹{(price * item.quantity).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Promo Code Input */}
                            <div className="mb-8">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                    <Tag size={14} className="text-cyan-400" /> A GIFT FOR YOU
                                </p>

                                {appliedCoupon ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center justify-between bg-emerald-900/10 border border-emerald-500/20 rounded-2xl px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-500/10 p-2 rounded-full">
                                                <CheckCircle2 size={16} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-emerald-400 text-sm font-black tracking-widest uppercase">{appliedCoupon.code}</p>
                                                <p className="text-emerald-500/70 text-[10px] uppercase tracking-widest mt-0.5">{couponSuccess}</p>
                                            </div>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-emerald-500 hover:text-white transition-colors">
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input type="text" value={couponCode}
                                            onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                            onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                            placeholder="ENTER CODE"
                                            className="flex-1 text-white px-5 py-3.5 rounded-2xl text-[13px] font-bold tracking-widest uppercase outline-none transition-all placeholder:text-white/30"
                                            style={INPUT_STYLE}
                                            onFocus={e => Object.assign(e.target.style, INPUT_FOCUS_STYLE)}
                                            onBlur={e => Object.assign(e.target.style, INPUT_STYLE)}
                                        />
                                        <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                                            className="px-6 py-3.5 bg-white text-black text-[12px] font-black tracking-widest uppercase rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm">
                                            {couponLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'APPLY'}
                                        </button>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {couponError && (
                                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="text-pink-400 text-[11px] mt-3 font-bold uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                            <X size={12} className="bg-pink-400/10 rounded-full p-0.5" /> {couponError}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-4 text-sm p-6 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                <div className="flex justify-between text-gray-400">
                                    <span className="uppercase tracking-widest text-[12px] font-bold">SUBTOTAL</span>
                                    <span className="font-sans font-semibold tracking-wide text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span className="uppercase tracking-widest text-[12px] font-bold">SHIPPING</span>
                                    {shippingCost === 0 ? (
                                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-[12px]">FREE</span>
                                    ) : (
                                        <span className="font-sans font-semibold tracking-wide text-white">₹{shippingCost}</span>
                                    )}
                                </div>
                                {appliedCoupon && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                        className="flex justify-between text-emerald-400 border-t border-white/10 pt-4 mt-2">
                                        <span className="uppercase tracking-widest text-[12px] font-bold flex items-center gap-2">
                                            DISCOUNT ({appliedCoupon.code})
                                        </span>
                                        <span className="font-bold tracking-wide">−₹{discount.toLocaleString('en-IN')}</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Final Total */}
                            <div className="mt-6 pt-6 border-t border-white/10 flex items-end justify-between">
                                <span className="text-gray-400 text-[12px] font-bold uppercase tracking-widest">TOTAL</span>
                                <div className="text-right">
                                    {appliedCoupon && <p className="text-gray-500 text-[12px] line-through font-sans mb-1 tracking-widest font-semibold">₹{subtotal.toLocaleString('en-IN')}</p>}
                                    <span className="text-4xl font-black text-white tracking-tighter">
                                        ₹{finalTotal.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Micro-components ──────────────────────────────────────────────────────────

function STitle({ icon: Icon, n, children }) {
    return (
        <div className="flex items-center gap-4 mb-4 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-cyan-400" />
            </div>
            <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">STEP {n} OF 3</p>
                <h2 className="text-xl font-bold text-white tracking-wide">{children}</h2>
            </div>
        </div>
    );
}

function Fld({ l, children }) {
    return <div><label className={LABEL}>{l}</label>{React.cloneElement(children, {
        style: INPUT_STYLE,
        onFocus: e => { Object.assign(e.target.style, INPUT_FOCUS_STYLE); },
        onBlur: e => { Object.assign(e.target.style, INPUT_STYLE); }
    })}</div>;
}

function NeonBtn({ onClick, children, flex2 }) {
    return (
        <button onClick={onClick}
            className={`${flex2 ? 'flex-[2]' : 'w-full'} group relative overflow-hidden py-4 rounded-2xl text-white font-black text-[13px] flex items-center justify-center gap-3 uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98]`}
            style={{ background: 'linear-gradient(to right, #22d3ee, #a855f7, #ec4899)' }}>
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </button>
    );
}

function GhostBtn({ onClick, children }) {
    return (
        <button onClick={onClick}
            className="flex-1 py-4 rounded-2xl text-white/60 font-bold text-[12px] uppercase tracking-widest hover:text-white transition-all flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {children}
        </button>
    );
}

function MiniSummary({ formData, onEdit, showMethod }) {
    return (
        <div className="rounded-2xl p-5 space-y-4 mb-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">CONTACT PROFILE</p>
                    <p className="text-gray-200 font-semibold text-[15px] tracking-wide">{formData.email || '—'}</p>
                </div>
                <button onClick={onEdit} className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors border border-white/10 hover:border-white/30 bg-[#111111] rounded-xl px-4 py-2 shadow-sm">EDIT</button>
            </div>
            {formData.address && (
                <div className="border-t border-white/10 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">DELIVER TO</p>
                    <p className="text-gray-200 text-[15px] font-semibold tracking-wide">{formData.address}{formData.city ? `, ${formData.city}` : ''}</p>
                </div>
            )}
            {showMethod && (
                <div className="border-t border-white/10 pt-4 flex justify-between items-end">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">METHOD</p>
                        <p className="text-gray-200 text-[15px] tracking-wide font-bold">Standard Delivery</p>
                    </div>
                    <span className="text-cyan-400 font-bold text-[11px] tracking-widest border border-cyan-500/30 px-3 py-1 rounded-full bg-cyan-900/20 uppercase">FREE</span>
                </div>
            )}
        </div>
    );
}
