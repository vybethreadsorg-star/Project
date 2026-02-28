import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { SubNavBar } from './components/layout/SubNavBar'
import { CartDrawer } from './components/cart/CartDrawer'
import { ScrollToTop } from './components/utils/ScrollToTop'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductDetails } from './pages/ProductDetails'
import { Auth } from './pages/Auth'
import { Checkout } from './pages/Checkout'
import { CustomDesigner } from './pages/CustomDesigner'
import { Cart } from './pages/Cart'
import { AdminPanel } from './pages/AdminPanel'
import { AdminLogin } from './pages/AdminLogin'
import { RefundPolicy } from './pages/RefundPolicy'
import { ShippingInfo } from './pages/ShippingInfo'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { SizeGuide } from './pages/SizeGuide'
import { useAuthStore } from './store/useAuthStore'

function ProtectedAdminRoute({ children }) {
    const user = useAuthStore((s) => s.user)
    const loading = useAuthStore((s) => s.loading)
    if (loading) return null
    return user ? children : <Navigate to="/admin/login" replace />
}

function ProtectedRoute({ children }) {
    const user = useAuthStore((s) => s.user)
    const loading = useAuthStore((s) => s.loading)
    if (loading) return null
    return user ? children : <Navigate to="/auth" replace />
}

function App() {
    const initialize = useAuthStore((s) => s.initialize)

    useEffect(() => {
        const unsub = initialize()
        return () => { if (typeof unsub?.then === 'function') unsub.then(fn => fn?.()) }
    }, [])

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Routes>
                {/* ── Admin routes — full screen, no Navbar/Footer ── */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                    <ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute>
                } />

                {/* ── Store routes — with Navbar & Footer ── */}
                <Route path="/*" element={
                    <div className="min-h-screen bg-cyber-black">
                        <Navbar />
                        <SubNavBar />
                        <CartDrawer />
                        <main>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/shop" element={<Shop />} />
                                <Route path="/product/:id" element={<ProductDetails />} />
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/refund-policy" element={<RefundPolicy />} />
                                <Route path="/shipping-info" element={<ShippingInfo />} />
                                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                <Route path="/size-guide" element={<SizeGuide />} />
                                <Route path="/customize" element={<CustomDesigner />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={
                                    <ProtectedRoute><Checkout /></ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                } />
            </Routes>
        </Router>
    )
}

export default App
