import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import {
    Package, ShoppingBag, Star, Eye, EyeOff, Pencil, Trash2,
    LogOut, LayoutDashboard, ChevronDown, AlertTriangle,
    IndianRupee, Search, X, Tag, Truck, Plus, Users
} from 'lucide-react'
import { ProductForm } from '../components/admin/ProductForm'
import { CouponsTab } from '../components/admin/CouponsTab'
import { ShippingTab } from '../components/admin/ShippingTab'
import { DashboardTab } from '../components/admin/DashboardTab'
import { CustomersTab } from '../components/admin/CustomersTab'

const fmtPrice = p => '₹' + Math.floor(p / 100).toLocaleString('en-IN')
const STATUS_STYLES = {
    pending: 'text-amber-700  bg-amber-50    border-amber-200',
    confirmed: 'text-blue-700   bg-blue-50     border-blue-200',
    shipped: 'text-violet-700 bg-violet-50   border-violet-200',
    delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}

const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'shipping', label: 'Shipping', icon: Truck },
]

export function AdminPanel() {
    const { user, isAdmin, loading, signOut } = useAuthStore()
    const navigate = useNavigate()

    const [tab, setTab] = useState('dashboard')
    const [products, setProducts] = useState([])
    const [loadingProd, setLoadingProd] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProd, setEditingProd] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [orders, setOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [expandedOrder, setExpandedOrder] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (!user) { navigate('/admin/login'); return }
        if (isAdmin) fetchProducts()
    }, [user, isAdmin])

    useEffect(() => {
        // Set body background to slate-50 to prevent black overscroll/gaps
        document.body.style.backgroundColor = '#f8fafc'
        document.body.style.backgroundImage = 'none'
        return () => {
            document.body.style.backgroundColor = ''
            document.body.style.backgroundImage = ''
        }
    }, [])


    async function fetchProducts(force = false) {
        if (!force && products.length > 0) return
        setLoadingProd(true)
        const { data } = await supabase.from('products').select('*').order('id')
        setProducts(data || [])
        setLoadingProd(false)
    }
    async function fetchOrders() {
        if (orders.length) return
        setLoadingOrders(true)
        const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
        setOrders(data || [])
        setLoadingOrders(false)
    }
    async function deleteProduct(id) {
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) {
            console.error('Delete error:', error)
            alert('Failed to delete product: ' + error.message)
        }
        setDeleteConfirm(null); fetchProducts(true)
    }
    const toggleFeatured = p => supabase.from('products').update({ is_featured: !p.is_featured }).eq('id', p.id).then(() => fetchProducts(true))
    const toggleActive = p => supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id).then(() => fetchProducts(true))
    const updateStatus = (id, status) => {
        supabase.from('orders').update({ status }).eq('id', id)
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    }

    // ── Guards ──
    if (!user || loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
    if (!isAdmin) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-sm w-full mx-4 text-center">
                <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={26} className="text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h1>
                <p className="text-slate-500 text-sm mb-5">You don't have admin privileges.</p>
                <button onClick={() => navigate('/')} className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors">← Back to store</button>
            </div>
        </div>
    )

    const totalRevenue = orders.reduce((a, o) => a + o.total, 0)
    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col z-30 shadow-sm">
                <div className="px-5 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-md shadow-pink-200">
                            <LayoutDashboard size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">Admin Panel</p>
                            <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[120px]">{user.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Manage</p>
                    {NAV.map(item => (
                        <button key={item.id}
                            onClick={() => { setTab(item.id); if (item.id === 'orders') fetchOrders() }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === item.id ? 'bg-pink-50 text-pink-700 border border-pink-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                            <item.icon size={16} className={tab === item.id ? 'text-pink-500' : 'text-slate-400'} />
                            <span className="flex-1 text-left">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="px-3 py-4 border-t border-slate-100">
                    <button onClick={() => { signOut(); navigate('/') }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="ml-60 flex-1">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">{NAV.find(n => n.id === tab)?.label}</h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {tab === 'dashboard' ? 'Overview & Statistics'
                                : tab === 'products' ? `${products.length} products · ${products.filter(p => p.is_featured).length} featured`
                                    : tab === 'orders' ? `${orders.length} total orders`
                                        : tab === 'customers' ? 'Manage your registered users'
                                            : tab === 'coupons' ? 'Manage discount coupons'
                                                : 'Configure delivery charges'}
                        </p>
                    </div>
                    {tab === 'products' && (
                        <button onClick={() => { setEditingProd(null); setShowForm(true) }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-pink-200">
                            <Plus size={15} /> Add Product
                        </button>
                    )}
                </header>

                <div className="p-8">
                    {/* Stats — only on products/orders */}
                    {(tab === 'products' || tab === 'orders') && (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Products', value: products.length, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                                { label: 'Featured', value: products.filter(p => p.is_featured).length, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                                { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                                { label: 'Revenue', value: orders.length ? fmtPrice(totalRevenue) : '—', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                            ].map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className={`bg-white border ${s.border} rounded-2xl p-5 flex items-center justify-between shadow-sm`}>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                    </div>
                                    <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center`}>
                                        <s.icon size={20} className={s.color} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Dashboard Tab */}
                    {tab === 'dashboard' && <DashboardTab />}

                    {/* Products Tab */}
                    {tab === 'products' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                <Search size={14} className="text-slate-400 shrink-0" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none" />
                                {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>}
                            </div>
                            {loadingProd ? (
                                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50">
                                            {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Active', 'Actions'].map(h => (
                                                <th key={h} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <img src={p.image} alt={p.name} className="w-11 object-cover rounded-xl border border-slate-200 shrink-0" style={{ height: 52 }} />
                                                        <div>
                                                            <p className="font-semibold text-slate-800 truncate max-w-[170px]">{p.name}</p>
                                                            <p className="text-xs text-slate-400">ID #{p.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{p.category.split('|')[0].trim()}</span>
                                                </td>
                                                <td className="px-5 py-3.5"><span className="font-bold text-slate-800">{fmtPrice(p.price)}</span></td>
                                                <td className="px-5 py-3.5">
                                                    {p.track_stock ? (
                                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${p.stock_quantity === 0
                                                            ? 'bg-red-50 text-red-600 border-red-200'
                                                            : p.stock_quantity <= 5
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            }`}>
                                                            {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">∞</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <button onClick={() => toggleFeatured(p)} title={p.is_featured ? 'Remove from featured' : 'Add to featured'}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${p.is_featured ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-white border-slate-200 text-slate-300 hover:text-amber-400 hover:border-amber-200'}`}>
                                                        <Star size={14} fill={p.is_featured ? 'currentColor' : 'none'} />
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <button onClick={() => toggleActive(p)} title={p.is_active ? 'Hide product' : 'Show product'}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${p.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-emerald-500'}`}>
                                                        {p.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => { setEditingProd(p); setShowForm(true) }}
                                                            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"><Pencil size={13} /></button>
                                                        <button onClick={() => setDeleteConfirm(p.id)}
                                                            className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"><Trash2 size={13} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {!loadingProd && filtered.length === 0 && (
                                <div className="text-center py-16 text-slate-400 text-sm">{search ? `No results for "${search}"` : 'No products yet.'}</div>
                            )}
                        </div>
                    )}

                    {/* Orders Tab */}
                    {tab === 'orders' && (
                        <div className="space-y-3">
                            {loadingOrders ? (
                                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400 text-sm shadow-sm">No orders yet.</div>
                            ) : orders.map(order => (
                                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 cursor-pointer gap-3"
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${order.status === 'delivered' ? 'bg-emerald-400' : order.status === 'shipped' ? 'bg-violet-500' : order.status === 'confirmed' ? 'bg-blue-500' : 'bg-amber-400'}`} />
                                            <div>
                                                <p className="font-semibold text-slate-800">{order.first_name} {order.last_name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{order.email} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pl-7 sm:pl-0">
                                            <span className="font-bold text-slate-800">{fmtPrice(order.total)}</span>
                                            <select value={order.status} onClick={e => e.stopPropagation()} onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value) }}
                                                className={`text-xs font-semibold border px-3 py-1.5 rounded-lg cursor-pointer outline-none ${STATUS_STYLES[order.status] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                                                {['pending', 'confirmed', 'shipped', 'delivered'].map(s => (
                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedOrder === order.id && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Delivery Address</p>
                                                        <p className="text-sm text-slate-700 leading-relaxed">{order.address}<br />{order.city}, {order.state} – {order.pincode}<br />📞 {order.phone}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Items</p>
                                                        <div className="space-y-2">
                                                            {(order.order_items || []).map((item, i) => (
                                                                <div key={i} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                                                    <span className="text-slate-700">{item.product_name} <span className="text-slate-400">({item.size}) ×{item.quantity}</span></span>
                                                                    <span className="font-bold text-slate-800">{fmtPrice(item.unit_price * item.quantity)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Coupons Tab */}
                    {tab === 'coupons' && <CouponsTab />}

                    {/* Customers Tab */}
                    {tab === 'customers' && <CustomersTab />}

                    {/* Shipping Tab */}
                    {tab === 'shipping' && <ShippingTab />}
                </div>
            </main>

            {/* Product Add/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <ProductForm
                        editing={editingProd}
                        onClose={() => setShowForm(false)}
                        onSaved={() => { setShowForm(false); fetchProducts(true) }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200">
                            <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Product?</h3>
                            <p className="text-slate-500 text-sm mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={() => deleteProduct(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
