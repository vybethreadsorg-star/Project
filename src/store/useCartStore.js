import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: [],
            isOpen: false,
            appliedCoupon: null,
            discount: 0,

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            // ── DB Sync ──────────────────────────────────────────────────────
            loadFromDb: async (userId) => {
                if (!userId) return
                const { data, error } = await supabase
                    .from('cart_items')
                    .select('*')
                    .eq('user_id', userId)
                if (error) { console.error('Cart load error:', error); return }
                if (data && data.length > 0) {
                    const items = data.map(row => ({
                        id: row.product_id,
                        name: row.name,
                        price: row.price,
                        image: row.image,
                        category: row.category,
                        size: row.size,
                        quantity: row.quantity,
                        cartItemId: row.cart_item_id,
                    }))
                    set({ cartItems: items })
                }
            },

            _upsertItem: async (item) => {
                const { data: { session } } = await supabase.auth.getSession()
                const userId = session?.user?.id
                if (!userId) return

                await supabase.from('cart_items').upsert({
                    user_id: userId,
                    product_id: String(item.id),
                    name: item.name,
                    price: item.price,
                    image: item.image || null,
                    category: item.category || null,
                    size: item.size,
                    quantity: item.quantity,
                    cart_item_id: item.cartItemId,
                }, { onConflict: 'user_id,cart_item_id' })
            },

            _deleteItem: async (cartItemId) => {
                const { data: { session } } = await supabase.auth.getSession()
                const userId = session?.user?.id
                if (!userId) return

                await supabase.from('cart_items')
                    .delete()
                    .eq('user_id', userId)
                    .eq('cart_item_id', cartItemId)
            },

            clearFromDb: async (userId) => {
                if (!userId) return
                await supabase.from('cart_items').delete().eq('user_id', userId)
            },

            // ── Cart Actions ─────────────────────────────────────────────────
            addItem: (product) => set((state) => {
                const size = product.size || 'M'
                const cartItemId = `${product.id}-${size}`
                const existingItem = state.cartItems.find(i => i.cartItemId === cartItemId)

                let newItems
                if (existingItem) {
                    newItems = state.cartItems.map(i =>
                        i.cartItemId === cartItemId
                            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
                            : i
                    )
                } else {
                    newItems = [...state.cartItems, { ...product, size, cartItemId, quantity: product.quantity || 1 }]
                }

                // Sync to DB
                const updatedItem = newItems.find(i => i.cartItemId === cartItemId)
                get()._upsertItem(updatedItem)

                return { cartItems: newItems, isOpen: true }
            }),

            removeItem: (cartItemId) => set((state) => {
                get()._deleteItem(cartItemId)
                return { cartItems: state.cartItems.filter(i => i.cartItemId !== cartItemId) }
            }),

            updateQuantity: (cartItemId, quantity) => set((state) => {
                const newItems = state.cartItems.map(i =>
                    i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, quantity) } : i
                )
                const updatedItem = newItems.find(i => i.cartItemId === cartItemId)
                get()._upsertItem(updatedItem)
                return { cartItems: newItems }
            }),

            clearCart: () => set({ cartItems: [], appliedCoupon: null, discount: 0 }),

            applyCoupon: (coupon, discountAmount) => set({ appliedCoupon: coupon, discount: discountAmount }),
            removeCoupon: () => set({ appliedCoupon: null, discount: 0 }),
        }),
        {
            name: 'clothing-cart',
            partialize: (state) => ({ cartItems: state.cartItems, appliedCoupon: state.appliedCoupon, discount: state.discount }),
        }
    )
)
