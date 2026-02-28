import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, X, User, ShoppingBag } from 'lucide-react'

const fmtPrice = p => '₹' + Math.floor(p / 100).toLocaleString('en-IN')

export function CustomersTab() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchCustomers()
    }, [])

    async function fetchCustomers() {
        setLoading(true)
        try {
            // 1. Fetch profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            // 2. Fetch orders to calculate Lifetime Value (LTV) and total orders per user
            const { data: orders } = await supabase
                .from('orders')
                .select('user_id, total, status')

            // 3. Merge data
            const enrichedCustomers = (profiles || []).map(profile => {
                const userOrders = (orders || []).filter(o => o.user_id === profile.id)
                // Assuming we only count completed/non-cancelled orders for LTV
                const lifetimeValue = userOrders.reduce((sum, o) => sum + (o.total || 0), 0)

                return {
                    ...profile,
                    total_orders: userOrders.length,
                    lifetime_value: lifetimeValue
                }
            })

            setCustomers(enrichedCustomers)
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const filtered = customers.filter(c =>
        (c.username && c.username.toLowerCase().includes(search.toLowerCase())) ||
        (c.full_name && c.full_name.toLowerCase().includes(search.toLowerCase())) ||
        (c.role && c.role.toLowerCase().includes(search.toLowerCase())) ||
        // If we had email in profile, we'd search it here. 
        // For now, depending on auth setup, profile might not expose email directly, but we search what we have.
        c.id.includes(search)
    )

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3 flex-1 max-w-sm">
                    <Search size={16} className="text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search customers by name or ID..."
                        className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {filtered.length} {filtered.length === 1 ? 'Customer' : 'Customers'}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm">
                    {search ? `No customers found for "${search}"` : 'No customers yet.'}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-left">Customer</th>
                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-left">Role</th>
                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-left">Joined</th>
                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Orders</th>
                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(customer => (
                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                {customer.avatar_url ? (
                                                    <img src={customer.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <User size={18} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    {customer.full_name || customer.username || 'Anonymous User'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate max-w-[180px]" title={customer.id}>
                                                    {customer.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${customer.role === 'admin'
                                                ? 'bg-purple-50 text-purple-600 border-purple-200'
                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                            {customer.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-slate-600">
                                            <ShoppingBag size={14} className={customer.total_orders > 0 ? 'text-blue-500' : 'text-slate-300'} />
                                            <span className="font-medium">{customer.total_orders}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                                        {fmtPrice(customer.lifetime_value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
