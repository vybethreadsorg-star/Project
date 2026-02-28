import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Type, Move, Trash2, Cpu, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function CustomDesigner() {
    const addItem = useCartStore((state) => state.addItem);
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState('HOODIE');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [customText, setCustomText] = useState('');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const fileInputRef = useRef(null);

    const products = {
        HOODIE: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=100&w=1000",
        TEE: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=100&w=1000"
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setUploadedImage(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddToCart = () => {
        addItem({
            id: Date.now(),
            name: `CUSTOM ${selectedProduct}`,
            price: selectedProduct === 'HOODIE' ? "5,999" : "3,499",
            category: "CUSTOM DESIGN",
            image: products[selectedProduct],
            custom: {
                image: uploadedImage,
                text: customText,
                textColor
            },
            size: 'M'
        }, user?.id);
        navigate('/cart');
    };

    return (
        <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto min-h-screen bg-[#050505] font-sans text-white">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative z-10">

                {/* Left Side: Designer Canvas */}
                <div className="flex-1 space-y-10">
                    <div className="relative aspect-square md:aspect-[4/5] bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden rounded-lg">
                        {/* THE PRODUCT MOCKUP */}
                        <img
                            src={products[selectedProduct]}
                            alt="Mockup"
                            className="w-full h-full object-cover opacity-90 mix-blend-lighten"
                        />

                        {/* DESIGN AREA (Limited Overlay) */}
                        <div className="absolute top-[25%] left-[25%] right-[25%] bottom-[35%] border border-dashed border-white/20 flex items-center justify-center pointer-events-none rounded-2xl">
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 tracking-widest uppercase bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Print Area</span>
                        </div>

                        {/* CUSTOM IMAGE OVERLAY */}
                        <AnimatePresence>
                            {uploadedImage && (
                                <motion.div
                                    drag
                                    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                                    className="absolute inset-x-0 inset-y-0 flex items-center justify-center cursor-move"
                                >
                                    <div className="relative w-40 h-40">
                                        <img src={uploadedImage} className="w-full h-full object-contain drop-shadow-2xl" alt="Custom Graphic" />
                                        <button
                                            onClick={() => setUploadedImage(null)}
                                            className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* CUSTOM TEXT OVERLAY */}
                        {customText && (
                            <motion.div
                                drag
                                className="absolute inset-x-0 inset-y-0 flex items-center justify-center cursor-move pointer-events-none"
                            >
                                <h3
                                    className="text-3xl font-bold drop-shadow-2xl pointer-events-auto mix-blend-difference"
                                    style={{ color: textColor }}
                                >
                                    {customText}
                                </h3>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setSelectedProduct('HOODIE')}
                            className={`flex-1 py-4 text-xs tracking-widest uppercase transition-all rounded-full ${selectedProduct === 'HOODIE' ? 'bg-white text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Heavy Hoodie
                        </button>
                        <button
                            onClick={() => setSelectedProduct('TEE')}
                            className={`flex-1 py-4 text-xs tracking-widest uppercase transition-all rounded-full ${selectedProduct === 'TEE' ? 'bg-white text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            Core Tee
                        </button>
                    </div>
                </div>

                {/* Right Side: Controls */}
                <div className="w-full lg:w-[450px]">
                    <div className="bg-[#0a0a0f] border border-indigo-500/20 rounded-[2rem] p-6 md:p-10 shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden group flex flex-col h-full">
                        {/* Subtle glow effect behind forms */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors duration-500 pointer-events-none" />
                        <div className="absolute inset-0 border-[2px] border-transparent bg-gradient-to-br from-indigo-500/20 via-purple-500/0 to-pink-500/20 rounded-[2rem] [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] pointer-events-none opacity-50" />

                        <div className="relative z-10 space-y-10">
                            <div className="mb-2 border-b border-white/10 pb-8">
                                <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2">
                                    Studio
                                </h1>
                                <p className="text-gray-400 text-sm">Design your own premium apparel.</p>
                            </div>

                            {/* Step 1: Upload */}
                            <div className="space-y-6">
                                <h3 className="text-sm tracking-wide flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">1</span> Add Artwork
                                </h3>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full aspect-[16/6] border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 transition-all flex flex-col items-center justify-center cursor-pointer group bg-black/40 rounded-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    <Upload className="text-indigo-500/50 group-hover:text-indigo-400 transition-colors mb-3" size={24} strokeWidth={1.5} />
                                    <p className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Upload Image</p>
                                    <p className="text-[10px] text-gray-500 mt-2">PNG or JPG up to 10MB</p>
                                </div>
                            </div>

                            {/* Step 2: Text */}
                            <div className="space-y-6">
                                <h3 className="text-sm tracking-wide flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">2</span> Add Typography
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter your text"
                                        value={customText}
                                        onChange={(e) => setCustomText(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:border-indigo-500/50 focus:bg-white/5 focus:outline-none transition-all placeholder:text-gray-500 focus:shadow-[0_0_15px_rgba(79,70,229,0.1)]"
                                    />
                                    <div className="flex gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
                                        {['#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#000000'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setTextColor(color)}
                                                className={`w-10 h-10 rounded-full border transition-all ${textColor === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-white/20 hover:scale-105 opacity-80 shadow-md'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Summary & Action */}
                            <div className="p-6 bg-black/40 border border-indigo-500/20 rounded-2xl space-y-6 mt-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                <div className="flex justify-between items-center text-sm tracking-wide">
                                    <span className="text-gray-400">Customization Fee</span>
                                    <span className="text-indigo-400 font-medium tracking-wide">Included</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Total Price</span>
                                    <span className="text-3xl font-bold tracking-tight">
                                        <span className="text-sm text-gray-500 mr-1 font-normal">INR</span>
                                        ₹{selectedProduct === 'HOODIE' ? "5,999" : "3,499"}
                                    </span>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <button
                                        className="w-full py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-colors rounded-full uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                        onClick={handleAddToCart}
                                    >
                                        Add to Bag
                                    </button>
                                    <div className="flex items-center justify-center gap-2 text-[11px] tracking-wide text-gray-500 mt-4 uppercase font-semibold">
                                        <ShieldCheck size={14} className="text-indigo-400" /> Created securely in-studio
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
