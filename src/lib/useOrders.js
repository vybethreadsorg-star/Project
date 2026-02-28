import { supabase } from './supabase'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Returns a placeOrder function that:
 * 1. Inserts an order row
 * 2. Inserts order_items rows
 * 3. Returns the new order id on success
 */
export function useOrders() {
    const user = useAuthStore((state) => state.user)

    const placeOrder = async (formData, cartItems) => {
        const total = cartItems.reduce((acc, item) => {
            const price = parseInt(item.price.replace(/,/g, '')) * 100 // back to paise
            return acc + price * item.quantity
        }, 0)

        // Insert the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user?.id ?? null,
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                phone: formData.phone,
                total,
                status: 'pending',
            })
            .select('id')
            .single()

        if (orderError) throw new Error(orderError.message)

        // Insert the order items
        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            size: item.size,
            quantity: item.quantity,
            unit_price: parseInt(item.price.replace(/,/g, '')) * 100, // in paise
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) throw new Error(itemsError.message)

        return order.id
    }

    return { placeOrder }
}
