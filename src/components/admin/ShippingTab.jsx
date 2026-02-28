import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Check, Truck, Zap, AlertCircle } from 'lucide-react'

const INPUT = 'w-full bg-slate-50 border-[1.5px] border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm outline-none transition focus:border-pink-400 focus:bg-white placeholder:text-slate-400'
const LABEL = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

// All values stored in RUPEES in state; converted to paise only when saving to DB
const DEFAULT = {
    standard_charge: 99,
    free_shipping_enabled: false,
    free_shipping_threshold: 0,
    express_enabled: false,
    express_charge: 199,
    refund_policy_text: 'Thank you for shopping with us.\n\nWe accept returns on all pristine items with tags attached within 14 days of receipt.\n\nPlease contact our concierge to initiate a return.',
    shipping_info_text: 'All domestic orders are shipped via premium couriers.\n\nStandard shipping takes 3-5 business days. Express takes 1-2 business days.',
    privacy_policy_text: 'Your privacy is important to us.\n\nWe encrypt all payment information and will never sell your personal data.'
}

export function ShippingTab() {
    const [form, setForm] = useState(null)   // rupee values
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        supabase.from('shipping_settings').select('*').eq('id', 1).single()
            .then(({ data }) => {
                if (data) {
                    // Convert paise → rupees for display
                    setForm({
                        standard_charge: Math.floor((data.standard_charge || 9900) / 100),
                        free_shipping_enabled: !!data.free_shipping_enabled,
                        free_shipping_threshold: Math.floor((data.free_shipping_threshold || 0) / 100),
                        express_enabled: !!data.express_enabled,
                        express_charge: Math.floor((data.express_charge || 19900) / 100),
                        refund_policy_text: data.refund_policy_text || DEFAULT.refund_policy_text,
                        shipping_info_text: data.shipping_info_text || DEFAULT.shipping_info_text,
                        privacy_policy_text: data.privacy_policy_text || DEFAULT.privacy_policy_text,
                    })
                } else {
                    setForm({ ...DEFAULT })
                }
            })
    }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        setError('')

        // Convert rupees → paise before saving
        const payload = {
            id: 1,
            standard_charge: Math.round(Number(form.standard_charge) * 100),
            free_shipping_enabled: form.free_shipping_enabled,
            free_shipping_threshold: Math.round(Number(form.free_shipping_threshold) * 100),
            express_enabled: form.express_enabled,
            express_charge: Math.round(Number(form.express_charge) * 100),
            refund_policy_text: form.refund_policy_text || '',
            shipping_info_text: form.shipping_info_text || '',
            privacy_policy_text: form.privacy_policy_text || '',
            updated_at: new Date().toISOString(),
        }

        const { error: err } = await supabase.from('shipping_settings').upsert(payload)
        setSaving(false)
        if (err) {
            setError(err.message || 'Save failed — check Supabase RLS policies.')
        } else {
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        }
    }

    if (!form) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="max-w-xl">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Shipping Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5">Configure delivery charges for all orders</p>
            </div>

            {error && (
                <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
                {/* Standard Shipping */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Truck size={18} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">Standard Delivery</p>
                            <p className="text-xs text-slate-400">Default shipping for all orders</p>
                        </div>
                    </div>

                    <div>
                        <label className={LABEL}>Standard Shipping Charge (₹)</label>
                        <input
                            type="number" min="0"
                            value={form.standard_charge}
                            onChange={e => set('standard_charge', e.target.value)}
                            className={INPUT}
                            placeholder="99"
                        />
                    </div>

                    {/* Free Shipping */}
                    <div className="border border-emerald-100 bg-emerald-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">Free Shipping</p>
                                <p className="text-xs text-slate-500 mt-0.5">Waive charges automatically</p>
                            </div>
                            <div
                                onClick={() => set('free_shipping_enabled', !form.free_shipping_enabled)}
                                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${form.free_shipping_enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.free_shipping_enabled ? 'left-6' : 'left-1'}`} />
                            </div>
                        </div>
                        {form.free_shipping_enabled && (
                            <div>
                                <label className={LABEL}>Free Shipping Above (₹) — 0 = always free</label>
                                <input
                                    type="number" min="0"
                                    value={form.free_shipping_threshold}
                                    onChange={e => set('free_shipping_threshold', e.target.value)}
                                    className={INPUT}
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Express Shipping */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                                <Zap size={18} className="text-violet-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Express Delivery</p>
                                <p className="text-xs text-slate-400">Faster delivery option</p>
                            </div>
                        </div>
                        <div
                            onClick={() => set('express_enabled', !form.express_enabled)}
                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${form.express_enabled ? 'bg-violet-500' : 'bg-slate-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.express_enabled ? 'left-6' : 'left-1'}`} />
                        </div>
                    </div>

                    {form.express_enabled ? (
                        <div>
                            <label className={LABEL}>Express Charge (₹)</label>
                            <input
                                type="number" min="0"
                                value={form.express_charge}
                                onChange={e => set('express_charge', e.target.value)}
                                className={INPUT}
                                placeholder="199"
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">Enable express shipping to set a charge.</p>
                    )}
                </div>

                {/* Global Refund Policy */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 mb-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div>
                            <p className="font-semibold text-slate-800">Global Refund Policy</p>
                            <p className="text-xs text-slate-400">Manage the text shown on the /refund-policy page</p>
                        </div>
                    </div>
                    <div>
                        <textarea
                            rows={5}
                            value={form.refund_policy_text}
                            onChange={e => set('refund_policy_text', e.target.value)}
                            className={INPUT + ' resize-none leading-relaxed'}
                            placeholder="Type your refund policy here..."
                        />
                    </div>
                </div>

                {/* Global Shipping Policy */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 mb-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div>
                            <p className="font-semibold text-slate-800">Global Shipping Info</p>
                            <p className="text-xs text-slate-400">Manage the text shown on the /shipping-info page</p>
                        </div>
                    </div>
                    <div>
                        <textarea
                            rows={5}
                            value={form.shipping_info_text}
                            onChange={e => set('shipping_info_text', e.target.value)}
                            className={INPUT + ' resize-none leading-relaxed'}
                            placeholder="Type your shipping information here..."
                        />
                    </div>
                </div>

                {/* Global Privacy Policy */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 mb-8">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div>
                            <p className="font-semibold text-slate-800">Global Privacy Policy</p>
                            <p className="text-xs text-slate-400">Manage the text shown on the /privacy-policy page</p>
                        </div>
                    </div>
                    <div>
                        <textarea
                            rows={5}
                            value={form.privacy_policy_text}
                            onChange={e => set('privacy_policy_text', e.target.value)}
                            className={INPUT + ' resize-none leading-relaxed'}
                            placeholder="Type your privacy policy here..."
                        />
                    </div>
                </div>

                <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-md shadow-pink-100 disabled:opacity-50">
                    {saving
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                        : saved
                            ? <><Check size={16} />Saved!</>
                            : <><Check size={16} />Save Settings</>}
                </button>
            </form>
        </div>
    )
}
