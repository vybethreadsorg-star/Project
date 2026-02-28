import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { X, Check, Upload, Link, ChevronDown, AlertCircle } from 'lucide-react'

const PRESET_DESCRIPTIONS = [
    { label: 'Streetwear Hoodie', text: 'Premium quality heavyweight hoodie crafted for the urban explorer. Features a relaxed fit, kangaroo pocket, and bold graphic print. Perfect for layering.' },
    { label: 'Graphic Tee', text: 'Ultra-soft 100% cotton tee with a vibrant signature print. Lightweight, breathable fabric designed for everyday wear and maximum comfort.' },
    { label: 'Cargo Pants', text: 'Multi-pocket cargo pants built for style and utility. Relaxed tapered fit with adjustable drawstring waist. Durable ripstop fabric.' },
    { label: 'Bomber Jacket', text: 'Sleek satin-finish bomber with ribbed cuffs and hem. A versatile outerwear staple that transitions seamlessly from day to night.' },
    { label: 'Knitwear', text: 'Cozy knit construction with a modern relaxed silhouette. Soft yarn blend that keeps you warm without the bulk. Ideal for layering.' },
    { label: 'Custom', text: '' },
]

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', '28', '30', '32', '34', '36', '38']

const LABEL_OPTIONS = [
    { value: '', label: 'None' },
    { value: 'NEW', label: '🆕 NEW' },
    { value: 'HOT', label: '🔥 HOT' },
    { value: 'SALE', label: '🏷️ SALE' },
    { value: 'LIMITED', label: '⚡ LIMITED' },
    { value: 'BESTSELLER', label: '⭐ BESTSELLER' },
    { value: 'OUT OF STOCK', label: '🔴 OUT OF STOCK' },
    { value: 'STOCK LIMITED', label: '🟠 STOCK LIMITED' },
    { value: 'OTHER', label: '✍️ Other (Custom)' },
]

const LABEL_STYLES = {
    NEW: 'bg-emerald-500 text-white',
    HOT: 'bg-red-500 text-white',
    SALE: 'bg-pink-500 text-white',
    LIMITED: 'bg-amber-500 text-white',
    BESTSELLER: 'bg-violet-600 text-white',
    'OUT OF STOCK': 'bg-red-600 text-white',
    'STOCK LIMITED': 'bg-amber-600 text-white',
}

const DEFAULT_DELIVERY = 'Free express global shipping on all orders over $500. Returns accepted within 14 days of delivery provided the security tag remains intact.'
const DEFAULT_PAYMENT = 'We accept all major credit cards, Apple Pay, PayPal, and Klarna financing.'
const DEFAULT_GUARANTEE = 'Every item is verified by our team of luxury experts to ensure total authenticity before shipping.'
const DEFAULT_OFFERS = 'Automatically applied at checkout when using an eligible premium credit card.'

const INPUT = 'w-full bg-slate-50 border-[1.5px] border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-sm outline-none transition focus:border-pink-400 focus:bg-white placeholder:text-slate-400'
const LABEL = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

export function ProductForm({ editing, onClose, onSaved }) {

    // Determine the initial label dropdown value
    let initialLabelSelect = ''
    let initialLabelCustom = ''
    if (editing?.label) {
        if (LABEL_OPTIONS.some(o => o.value === editing.label)) {
            initialLabelSelect = editing.label
        } else {
            initialLabelSelect = 'OTHER'
            initialLabelCustom = editing.label
        }
    }

    const EMPTY = {
        name: '', price: '', mrp: '', category: '', image: '', description: '',
        is_active: true, is_featured: false, sizes: [], labelSelect: '', labelCustom: '',
        track_stock: false, stock_quantity: '',
        delivery_info: DEFAULT_DELIVERY, payment_options: DEFAULT_PAYMENT,
        authenticity_guarantee: DEFAULT_GUARANTEE, special_offers: DEFAULT_OFFERS
    }

    const initial = editing ? {
        name: editing.name,
        price: String(Math.floor(editing.price / 100)),
        mrp: editing.mrp ? String(Math.floor(editing.mrp / 100)) : '',
        category: editing.category,
        image: editing.image,
        description: editing.description || '',
        is_active: editing.is_active,
        is_featured: editing.is_featured,
        sizes: editing.sizes || [],
        labelSelect: initialLabelSelect,
        labelCustom: initialLabelCustom,
        track_stock: editing.track_stock || false,
        stock_quantity: editing.stock_quantity != null ? String(editing.stock_quantity) : '',
        delivery_info: editing.delivery_info || DEFAULT_DELIVERY,
        payment_options: editing.payment_options || DEFAULT_PAYMENT,
        authenticity_guarantee: editing.authenticity_guarantee || DEFAULT_GUARANTEE,
        special_offers: editing.special_offers || DEFAULT_OFFERS,
    } : EMPTY

    const [form, setForm] = useState(initial)
    const [imageMode, setImageMode] = useState('url')
    const [uploading, setUploading] = useState(false)
    const [uploadPreview, setUploadPreview] = useState(editing?.image || '')
    const [descPreset, setDescPreset] = useState('Custom')
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const fileRef = useRef()

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const toggleSize = (size) => {
        set('sizes', form.sizes.includes(size)
            ? form.sizes.filter(s => s !== size)
            : [...form.sizes, size])
    }

    async function handleFileUpload(e) {
        const file = e.target.files[0]
        if (!file) return
        setUploading(true)
        const ext = file.name.split('.').pop()
        const path = `products/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
        if (error) { setSaveError('Image upload failed: ' + error.message); setUploading(false); return }
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
        setUploadPreview(publicUrl)
        set('image', publicUrl)
        setUploading(false)
    }

    function handlePreset(lbl) {
        setDescPreset(lbl)
        const found = PRESET_DESCRIPTIONS.find(d => d.label === lbl)
        if (found && lbl !== 'Custom') set('description', found.text)
    }

    async function handleSubmit(e) {
        if (e && e.preventDefault) e.preventDefault()
        setSaving(true)
        setSaveError('')

        try {
            const finalLabel = form.labelSelect === 'OTHER' ? form.labelCustom.toUpperCase() : form.labelSelect

            // Core payload (columns that definitely exist)
            const corePayload = {
                name: (form.name || '').trim(),
                price: Math.round(parseFloat(form.price || 0) * 100),
                mrp: form.mrp ? Math.round(parseFloat(form.mrp) * 100) : null,
                category: (form.category || '').trim(),
                image: (form.image || '').trim(),
                description: (form.description || '').trim(),
                is_active: form.is_active,
                is_featured: form.is_featured,
                sizes: form.sizes,
                label: finalLabel || null,
            }

            if (!corePayload.name || !corePayload.category || !corePayload.price || !corePayload.image) {
                setSaving(false)
                setSaveError('Please fill out all required fields (Name, Category, Price, Image).')
                return
            }

            let error, savedId

            console.log("PAYLOAD BEING SENT TO SUPA:", corePayload);

            if (editing) {
                ; ({ error } = await supabase.from('products').update(corePayload).eq('id', editing.id))
                savedId = editing.id
            } else {
                const { data, error: insertErr } = await supabase.from('products').insert(corePayload).select('id').single()
                console.log("INSERT RESULT:", { data, insertErr });
                error = insertErr
                savedId = data?.id
            }

            if (error) {
                console.error("SUPABASE SAVE ERROR:", error);
                setSaving(false);
                setSaveError(error.message || 'Save failed — check Supabase RLS policies.');
                return
            }

            // Try to save stock & accordion fields separately 
            if (savedId) {
                const extraPayload = {
                    track_stock: form.track_stock,
                    stock_quantity: form.track_stock && form.stock_quantity !== '' ? parseInt(form.stock_quantity) : null,
                    delivery_info: form.delivery_info,
                    payment_options: form.payment_options,
                    authenticity_guarantee: form.authenticity_guarantee,
                    special_offers: form.special_offers,
                }
                const { error: extraErr } = await supabase.from('products').update(extraPayload).eq('id', savedId)
                if (extraErr) {
                    console.log(extraErr)
                }
            }

            setSaving(false)
            onSaved()
        } catch (err) {
            console.error('Save crash:', err)
            setSaving(false)
            setSaveError('An unexpected error occurred: ' + (err.message || String(err)))
        }
    }

    const appendText = (field, text) => {
        const current = form[field] || ''
        const newText = current.trim() ? `${current.trim()} ${text}` : text
        set(field, newText)
    }

    const QuickLinks = ({ field }) => (
        <div className="flex flex-wrap gap-2 mt-2">
            {['Refund Policy', 'Return Policy', 'Shipping Policy', 'Size Guide'].map(link => (
                <button
                    key={link}
                    type="button"
                    onClick={() => appendText(field, link)}
                    className="text-[10px] bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-100 px-2 py-1 rounded-md transition-colors font-semibold uppercase tracking-wider"
                >
                    + {link}
                </button>
            ))}
        </div>
    )

    const previewUrl = imageMode === 'upload' ? uploadPreview : form.image
    const displayLabel = form.labelSelect === 'OTHER' ? form.labelCustom.toUpperCase() : form.labelSelect

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-7 py-4 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-violet-50 shrink-0">
                    <h3 className="font-bold text-slate-800">{editing ? 'Edit Product' : 'Add New Product'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-white rounded-lg transition-colors"><X size={18} /></button>
                </div>

                {/* Error */}
                {saveError && (
                    <div className="mx-6 mt-4 shrink-0 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{saveError}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row overflow-hidden flex-1">

                    {/* LEFT COLUMN: MAIN FORM */}
                    <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5 border-r border-slate-100">

                        {/* Name + Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL}>Product Name *</label>
                                <input required value={form.name} onChange={e => set('name', e.target.value)} className={INPUT} placeholder="NEON GLITCH HOODIE" />
                            </div>
                            <div>
                                <label className={LABEL}>Category *</label>
                                <input required value={form.category} onChange={e => set('category', e.target.value)} className={INPUT} placeholder="HOODIE | V2.0" />
                            </div>
                        </div>

                        {/* MRP + Offer Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL}>MRP / Original (₹)</label>
                                <input type="number" min="1" value={form.mrp} onChange={e => set('mrp', e.target.value)} className={INPUT} placeholder="5999 (optional)" />
                                <p className="text-[10px] text-slate-400 mt-1">Crossed out visually</p>
                            </div>
                            <div>
                                <label className={LABEL}>Offer Price (₹) *</label>
                                <input required type="number" min="1" value={form.price} onChange={e => set('price', e.target.value)} className={INPUT} placeholder="4999" />
                                <p className="text-[10px] text-slate-400 mt-1">Final selling price</p>
                            </div>
                        </div>

                        {/* Badge Controls */}
                        <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/50">
                            <label className={LABEL}>Badge / Label</label>
                            <div className="grid grid-cols-2 gap-4">
                                <select value={form.labelSelect} onChange={e => set('labelSelect', e.target.value)} className={INPUT}>
                                    {LABEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                {form.labelSelect === 'OTHER' && (
                                    <input
                                        type="text"
                                        value={form.labelCustom}
                                        onChange={e => set('labelCustom', e.target.value)}
                                        className={INPUT}
                                        placeholder="e.g. COLLAB"
                                        autoFocus
                                    />
                                )}
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={LABEL}>Product Image *</label>
                                <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs font-semibold">
                                    {['url', 'upload'].map(m => (
                                        <button key={m} type="button" onClick={() => setImageMode(m)}
                                            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${imageMode === m ? 'bg-pink-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                            {m === 'url' ? <Link size={12} /> : <Upload size={12} />}
                                            {m === 'url' ? 'URL' : 'Upload'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {imageMode === 'url' ? (
                                <input required={imageMode === 'url'} value={form.image} onChange={e => set('image', e.target.value)} className={INPUT} placeholder="https://…" />
                            ) : (
                                <div>
                                    <input type="file" ref={fileRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-7 flex flex-col items-center gap-2 text-sm text-slate-400 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 transition-all disabled:opacity-50">
                                        {uploading
                                            ? <><div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />Uploading…</>
                                            : <><Upload size={20} />Click to upload<span className="text-xs">PNG, JPG, WEBP</span></>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={LABEL}>Main Description</label>
                                <div className="relative">
                                    <select value={descPreset} onChange={e => handlePreset(e.target.value)}
                                        className="text-[10px] border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 outline-none cursor-pointer appearance-none pr-5">
                                        {PRESET_DESCRIPTIONS.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
                                    </select>
                                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <textarea rows={3} value={form.description} onChange={e => { set('description', e.target.value); setDescPreset('Custom') }}
                                className={INPUT + ' resize-none'} placeholder="General product description..." />
                            <QuickLinks field="description" />
                        </div>

                        {/* Accordion Configurations */}
                        <div className="border-t border-slate-200 pt-5 space-y-4">
                            <h4 className="text-sm font-bold text-slate-800">Details Accordions</h4>
                            <p className="text-[11px] text-slate-500">Customize the text that appears in the dropdown accordions for this specific product.</p>

                            <div>
                                <label className={LABEL}>Delivery & Return Timeline</label>
                                <textarea rows={2} value={form.delivery_info} onChange={e => set('delivery_info', e.target.value)} className={INPUT + ' resize-none'} />
                                <QuickLinks field="delivery_info" />
                            </div>
                            <div>
                                <label className={LABEL}>Payment Options</label>
                                <textarea rows={2} value={form.payment_options} onChange={e => set('payment_options', e.target.value)} className={INPUT + ' resize-none'} />
                                <QuickLinks field="payment_options" />
                            </div>
                            <div>
                                <label className={LABEL}>Authenticity Guarantee</label>
                                <textarea rows={2} value={form.authenticity_guarantee} onChange={e => set('authenticity_guarantee', e.target.value)} className={INPUT + ' resize-none'} />
                                <QuickLinks field="authenticity_guarantee" />
                            </div>
                            <div>
                                <label className={LABEL}>Special Offers & Discounts</label>
                                <textarea rows={2} value={form.special_offers} onChange={e => set('special_offers', e.target.value)} className={INPUT + ' resize-none'} />
                                <QuickLinks field="special_offers" />
                            </div>
                        </div>

                        {/* Stock Management */}
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Stock Management</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Track inventory for this product</p>
                                </div>
                                <div onClick={() => set('track_stock', !form.track_stock)} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${form.track_stock ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all ${form.track_stock ? 'left-6' : 'left-1'}`} />
                                </div>
                            </div>
                            {form.track_stock && (
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className={LABEL}>Quantity in Stock</label>
                                        <input type="number" min="0" value={form.stock_quantity}
                                            onChange={e => set('stock_quantity', e.target.value)}
                                            className={INPUT} placeholder="e.g. 50" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className={LABEL}>Available Sizes</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {SIZE_OPTIONS.map(size => (
                                    <button key={size} type="button" onClick={() => toggleSize(size)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${form.sizes.includes(size)
                                            ? 'bg-black border-black text-white shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black'
                                            }`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-8 pt-1">
                            {[
                                { key: 'is_featured', label: 'Featured in Carousel', on: 'bg-amber-400' },
                                { key: 'is_active', label: 'Active / Visible', on: 'bg-emerald-500' },
                            ].map(t => (
                                <div key={t.key} className="flex items-center gap-3">
                                    <div onClick={() => set(t.key, !form[t.key])} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${form[t.key] ? t.on : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all ${form[t.key] ? 'left-6' : 'left-1'}`} />
                                    </div>
                                    <p className="text-xs font-medium text-slate-700">{t.label}</p>
                                </div>
                            ))}
                        </div>
                    </form>

                    {/* RIGHT COLUMN: PREVIEW + SAVE */}
                    <div className="w-full md:w-80 bg-slate-50 flex flex-col">
                        <div className="flex-1 p-6 overflow-y-auto hidden md:block">
                            <label className={LABEL}>Storefront Card Preview</label>
                            <div className="bg-white rounded-[16px] shadow-sm p-4 w-full aspect-[4/5] flex flex-col border border-slate-200 relative mb-4 pointer-events-none mt-2">
                                <div className="relative aspect-[4/5] mb-4 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                                            <Upload size={24} className="mb-2 opacity-50" />
                                            <span className="text-[10px] uppercase tracking-widest">No Image</span>
                                        </div>
                                    )}

                                    {displayLabel && (
                                        <div className="absolute top-3 left-3 z-20">
                                            <span className={`text-[9px] font-bold px-2 py-1 rounded-[4px] shadow tracking-widest uppercase ${LABEL_STYLES[displayLabel] || 'bg-black text-white'}`}>
                                                {displayLabel}
                                            </span>
                                        </div>
                                    )}

                                </div>
                                <div className="flex flex-col space-y-1 px-1">
                                    <span className="text-[10px] text-gray-400 font-sans font-bold tracking-widest uppercase truncate">{form.category || 'CATEGORY'}</span>
                                    <h3 className="text-[13px] font-sans font-bold tracking-tight text-gray-900 leading-tight truncate">{form.name || 'Product Name'}</h3>
                                    <p className="text-[15px] font-bold text-gray-900 font-sans leading-tight mt-1">₹{form.price || '0'}</p>

                                    {/* Simulated Accordions */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col space-y-1.5 opacity-50">
                                        {['Delivery & Returns', 'Payment Options', 'Guarantee'].map(title => (
                                            <div key={title} className="flex items-center justify-between py-1 px-1 border-b border-slate-50">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
                                                <ChevronDown size={10} className="text-slate-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest mt-1">Storefront layout simulation</p>
                        </div>

                        <div className="p-6 bg-white border-t border-slate-200">
                            <button onClick={handleSubmit} disabled={saving}
                                className="w-full py-4 bg-black text-white text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : <><Check size={16} />{editing ? 'Update Product' : 'Save Product'}</>}
                            </button>
                        </div>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    )
}
