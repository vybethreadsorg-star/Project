import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useCartStore } from './useCartStore'

export const useAuthStore = create((set) => ({
    user: null,
    isAdmin: false,
    loading: true,

    setUser: (user) => set({ user, loading: false }),

    initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user ?? null
        set({ user, loading: false })

        // Fetch admin status on init
        if (user) {
            const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
            set({ isAdmin: !!data?.is_admin })
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const newUser = session?.user ?? null
            const currentUser = useAuthStore.getState().user

            // Only clear isAdmin if the user is actually logging out or changing accounts
            if (!newUser || (currentUser && currentUser.id !== newUser.id)) {
                set({ user: newUser, isAdmin: false })
            } else {
                set({ user: newUser })
            }

            if (newUser) {
                // Load cart only if it's a new sign in
                if (!currentUser || currentUser.id !== newUser.id) {
                    await useCartStore.getState().loadFromDb(newUser.id)
                }
                // Always ensure admin status is fresh, but without unmounting the UI in the meantime
                const { data } = await supabase.from('profiles').select('is_admin').eq('id', newUser.id).single()
                set({ isAdmin: !!data?.is_admin })
            } else {
                // User logged out — clear local cart
                useCartStore.getState().clearCart()
            }
        })

        return () => subscription.unsubscribe()
    },

    signOut: async () => {
        try { await supabase.auth.signOut() }
        catch (e) { console.error('Signout failed:', e) }
        finally { set({ user: null, isAdmin: false }) }
    },
}))

