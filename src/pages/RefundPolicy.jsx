import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function RefundPolicy() {
    const [policyText, setPolicyText] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchPolicy()
    }, [])

    async function fetchPolicy() {
        const { data } = await supabase.from('shipping_settings').select('refund_policy_text').eq('id', 1).single()
        if (data && data.refund_policy_text) {
            setPolicyText(data.refund_policy_text)
        } else {
            setPolicyText('Our refund policy is currently being updated. Please check back later or contact support.')
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-cyber-black flex items-center justify-center pt-24 pb-32">
                <div className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cyber-black text-white font-sans selection:bg-cyber-pink selection:text-white pt-32 pb-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-purple/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyber-cyan/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="max-w-[900px] mx-auto px-6 md:px-12 relative z-10">

                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] mb-4 text-cyber-cyan uppercase font-sans">Returns & Refunds</h1>
                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyber-pink to-transparent mx-auto opacity-70" />
                </div>

                {/* Content */}
                <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-xl backdrop-blur-md shadow-2xl">
                    <div className="prose prose-sm md:prose-base max-w-none text-gray-300 leading-relaxed font-sans font-medium tracking-wide whitespace-pre-wrap selection:bg-cyber-pink selection:text-white">
                        {policyText}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-16 text-center text-[11px] text-gray-500 uppercase tracking-widest font-sans font-bold flex items-center justify-center gap-3">
                    <div className="w-8 h-[1px] bg-white/10" />
                    <p>LAST UPDATED: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
                    <div className="w-8 h-[1px] bg-white/10" />
                </div>
            </div>
        </div>
    )
}
