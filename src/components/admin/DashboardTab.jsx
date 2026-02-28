import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import {
    IndianRupee, ShoppingBag, Users, Package,
    TrendingUp, AlertCircle, Clock
} from 'lucide-react'

const fmtPrice = p => '₹' + Math.floor(p / 100).toLocaleString('en-IN')

export function DashboardTab() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [lowStock, setLowStock] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    async function fetchDashboardData() {
        setLoading(true)
        try {
            // 1. Fetch Orders & Revenue
            const { data: orders } = await supabase
                .from('orders')
                .select('id, total, status, created_at, first_name, last_name')
                .order('created_at', { ascending: false })

            const totalRev = (orders || []).reduce((sum, order) => sum + (order.total || 0), 0)
            const recent = (orders || []).slice(0, 5)

            // 2. Fetch Users count
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            // 3. Fetch Products & Low Stock
            const { data: products } = await supabase
                .from('products')
                .select('id, name, stock_quantity, track_stock, image')

            const lowStockItems = (products || [])
                .filter(p => p.track_stock && p.stock_quantity <= 5)
                .sort((a, b) => a.stock_quantity - b.stock_quantity)
                .slice(0, 5)

            setStats({
                totalRevenue: totalRev,
                totalOrders: orders?.length || 0,
                totalUsers: usersCount || 0,
                totalProducts: products?.length || 0
            })
            setRecentOrders(recent)
            setLowStock(lowStockItems)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const statCards = [
        { label: 'Total Revenue', value: fmtPrice(stats.totalRevenue), icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: '+12.5%' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+5.2%' },
        { label: 'Total Customers', value: stats.totalUsers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', trend: '+18.1%' },
        { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', trend: 'Active' },
    ]

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={`bg-white border ${s.border} rounded-2xl p-5 shadow-sm relative overflow-hidden`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
                                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                                <s.icon size={22} className={s.color} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <TrendingUp size={14} className={s.color} />
                            <span>{s.trend}</span>
                            <span className="text-slate-400 font-normal">vs last month</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders List */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={16} className="text-blue-500" /> Recent Orders
                        </h2>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No recent orders.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentOrders.map(order => (
                                <div key={order.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{order.first_name} {order.last_name}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800 text-sm mb-1">{fmtPrice(order.total)}</p>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                            order.status === 'shipped' ? 'bg-violet-50 text-violet-600' :
                                                order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-blue-50 text-blue-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Low Stock Alerts */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/30">
                        <h2 className="text-sm font-bold text-red-600 flex items-center gap-2">
                            <AlertCircle size={16} /> Low Stock Alerts
                        </h2>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {lowStock.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm h-full flex items-center justify-center">
                                All products are well stocked!
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {lowStock.map(item => (
                                    <div key={item.id} className="p-4 px-6 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-slate-400 truncate">ID #{item.id}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${item.stock_quantity === 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                {item.stock_quantity === 0 ? 'Out' : `${item.stock_quantity} left`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
