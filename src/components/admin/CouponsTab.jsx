import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, X, Check, Tag, AlertCircle } from 'lucide-react'

const INPUT = 'w-full bg-slate-50 border-[1.5px] border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm outline-none transition focus:border-pink-400 focus:bg-white placeholder:text-slate-400'
const LABEL = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5'
const EMPTY = { code: '', type: 'percent', value: '', min_order: '', max_uses: '', expires_at: '', is_active: true }

export function CouponsTab() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(null)

    useEffect(() => { fetchCoupons() }, [])

    async function fetchCoupons() {
        setLoading(true)
        const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
        setCoupons(data || [])
        setLoading(false)
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
    const openEdit = (c) => {
        setEditing(c)
        setForm({
            code: c.code, type: c.type, value: String(c.type === 'flat' ? Math.floor(c.value / 100) : c.value),
            min_order: c.min_order ? String(Math.floor(c.min_order / 100)) : '',
            max_uses: c.max_uses ? String(c.max_uses) : '',
            expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
            is_active: c.is_active,
        })
        setShowForm(true)
    }

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    async function handleSubmit(e) {
        e.preventDefault(); setSaving(true)
        const payload = {
            code: form.code.trim().toUpperCase(),
            type: form.type,
            value: form.type === 'flat' ? Math.round(parseFloat(form.value) * 100) : parseInt(form.value),
            min_order: form.min_order ? Math.round(parseFloat(form.min_order) * 100) : 0,
            max_uses: form.max_uses ? parseInt(form.max_uses) : null,
            expires_at: form.expires_at || null,
            is_active: form.is_active,
        }
        if (editing) await supabase.from('coupons').update(payload).eq('id', editing.id)
        else await supabase.from('coupons').insert(payload)
        setSaving(false); setShowForm(false); fetchCoupons()
    }

    async function handleDelete(id) {
        await supabase.from('coupons').delete().eq('id', id)
        setDeleting(null); fetchCoupons()
    }

    const toggleActive = (c) => {
        supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id)
        setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x))
    }

    const fmtValue = (c) => c.type === 'percent' ? `${c.value}% OFF` : `₹${Math.floor(c.value / 100)} OFF`

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Coupon Codes</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{coupons.length} coupons · {coupons.filter(c => c.is_active).length} active</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-pink-100 hover:opacity-90 active:scale-95 transition-all">
                    <Plus size={15} /> New Coupon
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : coupons.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400 shadow-sm">
                    <Tag size={32} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No coupons yet. Create your first one!</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {['Code', 'Discount', 'Min Order', 'Uses', 'Expires', 'Status', ''].map(h => (
                                    <th key={h} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {coupons.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs tracking-widest">{c.code}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`font-bold text-sm ${c.type === 'percent' ? 'text-violet-600' : 'text-emerald-600'}`}>{fmtValue(c)}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-600 text-xs">{c.min_order ? `₹${Math.floor(c.min_order / 100)}+` : 'No min'}</td>
                                    <td className="px-5 py-3.5 text-slate-600 text-xs">{c.uses_count} / {c.max_uses ?? '∞'}</td>
                                    <td className="px-5 py-3.5 text-slate-600 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}</td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => toggleActive(c)}
                                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${c.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"><Pencil size={13} /></button>
                                            <button onClick={() => setDeleting(c.id)} className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"><Trash2 size={13} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Coupon Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-pink-50">
                                <h3 className="font-bold text-slate-800">{editing ? 'Edit Coupon' : 'New Coupon Code'}</h3>
                                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-white rounded-lg transition-colors"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className={LABEL}>Coupon Code *</label>
                                    <input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                                        className={INPUT + ' font-mono tracking-widest font-bold'} placeholder="SUMMER20" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={LABEL}>Discount Type *</label>
                                        <select value={form.type} onChange={e => set('type', e.target.value)} className={INPUT}>
                                            <option value="percent">Percentage (%)</option>
                                            <option value="flat">Flat Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={LABEL}>{form.type === 'percent' ? 'Discount %' : 'Amount (₹)'} *</label>
                                        <input required type="number" min="1" max={form.type === 'percent' ? 100 : undefined}
                                            value={form.value} onChange={e => set('value', e.target.value)} className={INPUT}
                                            placeholder={form.type === 'percent' ? '20' : '200'} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={LABEL}>Min Order (₹)</label>
                                        <input type="number" min="0" value={form.min_order} onChange={e => set('min_order', e.target.value)} className={INPUT} placeholder="500 (optional)" />
                                    </div>
                                    <div>
                                        <label className={LABEL}>Max Uses</label>
                                        <input type="number" min="1" value={form.max_uses} onChange={e => set('max_uses', e.target.value)} className={INPUT} placeholder="Unlimited" />
                                    </div>
                                </div>
                                <div>
                                    <label className={LABEL}>Expiry Date</label>
                                    <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} className={INPUT} />
                                </div>
                                <div className="flex items-center gap-3 pt-1">
                                    <div onClick={() => set('is_active', !form.is_active)} className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Active (usable immediately)</span>
                                </div>
                                <button type="submit" disabled={saving}
                                    className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-pink-100">
                                    {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : <><Check size={16} />{editing ? 'Update' : 'Create Coupon'}</>}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete confirm */}
            <AnimatePresence>
                {deleting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl border border-slate-200">
                            <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
                            <h3 className="font-bold text-slate-800 mb-1">Delete Coupon?</h3>
                            <p className="text-slate-500 text-sm mb-5">This cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleting(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={() => handleDelete(deleting)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
