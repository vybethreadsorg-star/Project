import { useState, useEffect } from 'react'
import { supabase } from './supabase'

/**
 * Fetches all active products from Supabase.
 * Returns products with price formatted as a display string (e.g. "4,999")
 * so existing ProductCard / Shop components work without changes.
 */
export function useProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false

        async function fetchProducts() {
            setLoading(true)
            setError(null)
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .order('id', { ascending: true })

                if (error) throw error
                if (!cancelled) {
                    // Convert price from paise to display string (e.g. 499900 → "4,999")
                    const formatted = (data || []).map((p) => ({
                        ...p,
                        price: Math.floor(p.price / 100).toLocaleString('en-IN'),
                    }))
                    setProducts(formatted)
                }
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchProducts()
        return () => { cancelled = true }
    }, [])

    return { products, loading, error }
}
