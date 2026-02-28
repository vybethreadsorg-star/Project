import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, MapPin, CreditCard, Package, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'
import { supabase } from '../../lib/supabase'

// ─── Order step definitions ──────────────────────────────────────────────────
const ORDER_STEPS = [
    { key: 'placed', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'shipped', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

const STATUS_TO_STEP = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 }

// ─── Cart steps (no order yet) ───────────────────────────────────────────────
const CART_STEPS = [
    { key: 'bag', label: 'Items in Bag', icon: ShoppingBag },
    { key: 'address', label: 'Add Address', icon: MapPin },
    { key: 'payment', label: 'Pay & Order', icon: CreditCard },
]

// Helper: active step colour
const activeRing = 'rgba(103,232,249,0.4)'
const doneRing = 'rgba(52,211,153,0.4)'

function StepCircle({ icon: Icon, active, done, pulse }) {
    const bg = done
        ? 'linear-gradient(135deg,#34d399,#059669)'
        : active
            ? 'linear-gradient(135deg,#22d3ee,#a855f7,#ec4899)'
            : 'rgba(255,255,255,0.07)'

    return (
        <motion.div
            animate={pulse ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{
                background: bg,
                border: `2px solid ${done ? 'rgba(52,211,153,0.6)' : active ? activeRing : 'rgba(255,255,255,0.12)'}`,
                boxShadow: active ? '0 0 18px rgba(103,232,249,0.35)' : 'none',
            }}
        >
            <Icon size={15} className={done ? 'text-white' : active ? 'text-white' : 'text-white/30'} strokeWidth={2} />
        </motion.div>
    )
}

function Connector({ done }) {
    return (
        <div className="flex-1 h-[2px] mx-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
                className="h-full rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: done ? '100%' : '0%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(to right,#34d399,#22d3ee)' }}
            />
        </div>
    )
}

export function SubNavBar() {
    const { cartItems, openCart } = useCartStore()
    const user = useAuthStore((s) => s.user)
    const [orders, setOrders] = useState([])
    const [savedAddresses, setSavedAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [isScrolled, setIsScrolled] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0)

    useEffect(() => {
        const handleScroll = () => {
            // Keep the SubNavBar active until the user scrolls past the Hero and Stats Sections, 
            // into the Featured Collections section roughly +900px down.
            setIsScrolled(window.scrollY > 900)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (!user) { setOrders([]); setSavedAddresses([]); setLoading(false); return }
        setLoading(true)
        Promise.allSettled([
            supabase.from('orders')
                .select('id, status, total, created_at, order_items(product_name, quantity)')
                .eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
            supabase.from('user_addresses')
                .select('id').eq('user_id', user.id).limit(1)
        ]).then(([ordersResult, addrResult]) => {
            // Orders — always try to use data even if partial error
            const ordersData = ordersResult.status === 'fulfilled'
                ? (ordersResult.value?.data || [])
                : []
            setOrders(ordersData)

            // Addresses — gracefully ignore if table missing
            const addrData = addrResult.status === 'fulfilled'
                ? (addrResult.value?.data || [])
                : []
            setSavedAddresses(addrData)

            setLoading(false)
        }).catch(() => { setLoading(false) })
    }, [user])

    // Hide on checkout page or shop page (after all hooks)
    if (location.pathname === '/checkout' || location.pathname === '/shop') return null
    if (!user || loading) return null
    if (isScrolled) return null

    const isShop = location.pathname === '/shop'

    // ── Smart display priority logic ────────────────────────────────────────
    // 1️⃣ Active order (pending/confirmed/shipped) → show ORDER tracker
    // 2️⃣ Delivered orders + cart items → show CART bar
    // 3️⃣ Only cart items, no orders → show CHECKOUT steps
    // 4️⃣ Nothing → hide

    const activeOrder = orders.find(o => ['pending', 'confirmed', 'shipped'].includes(o.status))
    const deliveredOrders = orders.filter(o => o.status === 'delivered')
    const allDelivered = orders.length > 0 && orders.every(o => o.status === 'delivered')

    const showOrderTracker = !!activeOrder
    const showCartSteps = !activeOrder && cartCount > 0
    const showCartAfterDelivery = allDelivered && cartCount > 0

    if (!showOrderTracker && !showCartSteps && !showCartAfterDelivery) return null

    // ────────────────────────────────────────────────────────────────────────
    // ORDER TRACKER MODE
    // ────────────────────────────────────────────────────────────────────────
    if (showOrderTracker) {
        const stepIdx = STATUS_TO_STEP[activeOrder.status] ?? 0
        const itemLabel = activeOrder.order_items?.slice(0, 2).map(i => i.product_name).join(', ') || 'Your order'
        const moreCount = (activeOrder.order_items?.length || 0) - 2

        return (
            <BarWrapper compact={isShop}>
                {/* Label */}
                <div className="flex-shrink-0 mr-4 hidden sm:block">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Order Update</p>
                    <p className="text-[12px] font-bold text-white truncate max-w-[150px]">
                        {itemLabel}{moreCount > 0 ? ` +${moreCount}` : ''}
                    </p>
                </div>

                {/* Steps */}
                <div className="flex items-center flex-1 min-w-0">
                    {ORDER_STEPS.map((step, i) => (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <StepCircle
                                    icon={step.icon}
                                    active={i === stepIdx}
                                    done={i < stepIdx}
                                    pulse={i === stepIdx}
                                />
                                <span className={`text-[9px] md:text-[10px] font-bold tracking-wide whitespace-nowrap ${i === stepIdx ? 'text-cyan-300' : i < stepIdx ? 'text-emerald-400' : 'text-white/25'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < ORDER_STEPS.length - 1 && (
                                <Connector done={i < stepIdx} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Date */}
                <div className="flex-shrink-0 ml-4 hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(activeOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span
                        className="text-[11px] font-black mt-0.5"
                        style={{ background: 'linear-gradient(to right,#22d3ee,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                        ₹{Math.floor(activeOrder.total / 100).toLocaleString('en-IN')}
                    </span>
                </div>
            </BarWrapper>
        )
    }

    // ────────────────────────────────────────────────────────────────────────
    // CHECKOUT STEPS MODE (cart items, no orders yet)
    // ────────────────────────────────────────────────────────────────────────
    if (showCartSteps) {
        // 0 = bag active, 1 = address done + pay active
        const cartStep = savedAddresses.length > 0 ? 1 : 0

        return (
            <BarWrapper compact={isShop}>
                {/* Label */}
                <div className="flex-shrink-0 mr-4 hidden sm:block">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Your Bag</p>
                    <p className="text-[12px] font-bold text-white">{cartCount} item{cartCount > 1 ? 's' : ''} ready</p>
                </div>

                {/* Steps */}
                <div className="flex items-center flex-1 min-w-0">
                    {CART_STEPS.map((step, i) => (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <StepCircle icon={step.icon} active={i === cartStep} done={i < cartStep} pulse={i === cartStep} />
                                <span className={`text-[9px] md:text-[10px] font-bold tracking-wide whitespace-nowrap ${i === cartStep ? 'text-cyan-300' : i < cartStep ? 'text-emerald-400' : 'text-white/25'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < CART_STEPS.length - 1 && <Connector done={i < cartStep} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* CTA */}
                <button
                    onClick={() => navigate('/checkout')}
                    className="flex-shrink-0 ml-4 px-5 py-2 rounded-full text-white text-[11px] font-black uppercase tracking-widest transition-all hover:opacity-85 active:scale-[0.97] whitespace-nowrap"
                    style={{ background: 'linear-gradient(to right,#22d3ee,#a855f7,#ec4899)' }}
                >
                    {savedAddresses.length > 0 ? 'Pay Now →' : 'Checkout →'}
                </button>
            </BarWrapper>
        )
    }

    // ────────────────────────────────────────────────────────────────────────
    // CART AFTER DELIVERY MODE
    // ────────────────────────────────────────────────────────────────────────
    if (showCartAfterDelivery) {
        const cartStep = savedAddresses.length > 0 ? 1 : 0
        return (
            <BarWrapper compact={isShop}>
                <div className="flex-shrink-0 mr-4 hidden sm:block">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Order Delivered ✓</p>
                    <p className="text-[12px] font-bold text-white">{cartCount} new item{cartCount > 1 ? 's' : ''} ready to order</p>
                </div>

                <div className="flex items-center flex-1 min-w-0">
                    {CART_STEPS.map((step, i) => (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                <StepCircle icon={step.icon} active={i === cartStep} done={i < cartStep} pulse={i === cartStep} />
                                <span className={`text-[9px] md:text-[10px] font-bold tracking-wide whitespace-nowrap ${i === cartStep ? 'text-cyan-300' : i < cartStep ? 'text-emerald-400' : 'text-white/25'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < CART_STEPS.length - 1 && <Connector done={i < cartStep} />}
                        </React.Fragment>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/checkout')}
                    className="flex-shrink-0 ml-4 px-5 py-2 rounded-full text-white text-[11px] font-black uppercase tracking-widest transition-all hover:opacity-85 active:scale-[0.97] whitespace-nowrap"
                    style={{ background: 'linear-gradient(to right,#22d3ee,#a855f7,#ec4899)' }}
                >
                    {savedAddresses.length > 0 ? 'Pay Now →' : 'Order Again →'}
                </button>
            </BarWrapper>
        )
    }

    return null
}

// ─── Shared BarWrapper ───────────────────────────────────────────────────────
function BarWrapper({ children, compact }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed left-0 right-0 z-40 origin-top ${compact ? 'top-[75px] scale-90 sm:scale-75 md:scale-90 origin-top' : 'top-[88px]'}`}
            style={{
                background: 'rgba(15,15,22,0.92)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
        >
            <div className={`max-w-[1400px] mx-auto px-4 md:px-12 flex items-center ${compact ? 'py-1.5' : 'py-2.5'}`}>
                {children}
            </div>
        </motion.div>
    )
}
