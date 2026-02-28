import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Ruler, CheckCircle2 } from 'lucide-react'

export function SizeGuide() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="min-h-screen bg-[#1A1A24] text-white pt-24 pb-20 selection:bg-pink-500/30 selection:text-pink-200">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            <main className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 text-pink-400 mb-4">
                        <Ruler size={24} />
                        <span className="font-bold tracking-widest text-sm uppercase">Measurement Reference</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                        Size <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">Guide</span>
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                        Our garments are designed with a modern, relaxed fit. Please refer to the charts below to find your perfect fit. For oversized looks, we recommend sizing up.
                    </p>
                </motion.div>

                {/* Sizing Tables */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="space-y-12"
                >
                    {/* Tops */}
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm overflow-x-auto">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 tracking-wide">
                            <span className="w-8 h-px bg-pink-500/50"></span> Tops & Outerwear
                        </h2>
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400 text-sm tracking-widest uppercase">
                                    <th className="py-4 px-4 font-medium">Size</th>
                                    <th className="py-4 px-4 font-medium">Chest (in)</th>
                                    <th className="py-4 px-4 font-medium">Waist (in)</th>
                                    <th className="py-4 px-4 font-medium">EU</th>
                                    <th className="py-4 px-4 font-medium">US</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium">
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">XS</td>
                                    <td className="py-4 px-4 text-gray-300">34-36</td>
                                    <td className="py-4 px-4 text-gray-300">28-30</td>
                                    <td className="py-4 px-4 text-gray-300">44</td>
                                    <td className="py-4 px-4 text-gray-300">34</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">S</td>
                                    <td className="py-4 px-4 text-gray-300">36-38</td>
                                    <td className="py-4 px-4 text-gray-300">30-32</td>
                                    <td className="py-4 px-4 text-gray-300">46</td>
                                    <td className="py-4 px-4 text-gray-300">36</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors bg-white/[0.02]">
                                    <td className="py-4 px-4 text-pink-400 font-bold flex items-center gap-2">M <span className="text-[9px] uppercase tracking-widest bg-pink-500/20 px-2 py-0.5 rounded-sm">Popular</span></td>
                                    <td className="py-4 px-4 text-gray-300">38-40</td>
                                    <td className="py-4 px-4 text-gray-300">32-34</td>
                                    <td className="py-4 px-4 text-gray-300">48</td>
                                    <td className="py-4 px-4 text-gray-300">38</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">L</td>
                                    <td className="py-4 px-4 text-gray-300">40-42</td>
                                    <td className="py-4 px-4 text-gray-300">34-36</td>
                                    <td className="py-4 px-4 text-gray-300">50</td>
                                    <td className="py-4 px-4 text-gray-300">40</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
                                    <td className="py-4 px-4 text-white">XL</td>
                                    <td className="py-4 px-4 text-gray-300">42-44</td>
                                    <td className="py-4 px-4 text-gray-300">36-38</td>
                                    <td className="py-4 px-4 text-gray-300">52</td>
                                    <td className="py-4 px-4 text-gray-300">42</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
                                    <td className="py-4 px-4 text-white">XXL</td>
                                    <td className="py-4 px-4 text-gray-300">44-46</td>
                                    <td className="py-4 px-4 text-gray-300">38-40</td>
                                    <td className="py-4 px-4 text-gray-300">54</td>
                                    <td className="py-4 px-4 text-gray-300">44</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">XXXL</td>
                                    <td className="py-4 px-4 text-gray-300">46-48</td>
                                    <td className="py-4 px-4 text-gray-300">40-42</td>
                                    <td className="py-4 px-4 text-gray-300">56</td>
                                    <td className="py-4 px-4 text-gray-300">46</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* Bottoms */}
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm overflow-x-auto">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 tracking-wide">
                            <span className="w-8 h-px bg-cyan-500/50"></span> Bottoms & Trousers
                        </h2>
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400 text-sm tracking-widest uppercase">
                                    <th className="py-4 px-4 font-medium">Size</th>
                                    <th className="py-4 px-4 font-medium">Waist (in)</th>
                                    <th className="py-4 px-4 font-medium">Inseam (in)</th>
                                    <th className="py-4 px-4 font-medium">EU</th>
                                    <th className="py-4 px-4 font-medium">US</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium">
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">28</td>
                                    <td className="py-4 px-4 text-gray-300">29.5</td>
                                    <td className="py-4 px-4 text-gray-300">31</td>
                                    <td className="py-4 px-4 text-gray-300">44</td>
                                    <td className="py-4 px-4 text-gray-300">28</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">30</td>
                                    <td className="py-4 px-4 text-gray-300">31.5</td>
                                    <td className="py-4 px-4 text-gray-300">31.5</td>
                                    <td className="py-4 px-4 text-gray-300">46</td>
                                    <td className="py-4 px-4 text-gray-300">30</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">32</td>
                                    <td className="py-4 px-4 text-gray-300">33.5</td>
                                    <td className="py-4 px-4 text-gray-300">32</td>
                                    <td className="py-4 px-4 text-gray-300">48</td>
                                    <td className="py-4 px-4 text-gray-300">32</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">34</td>
                                    <td className="py-4 px-4 text-gray-300">35.5</td>
                                    <td className="py-4 px-4 text-gray-300">32.5</td>
                                    <td className="py-4 px-4 text-gray-300">50</td>
                                    <td className="py-4 px-4 text-gray-300">34</td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-white">36</td>
                                    <td className="py-4 px-4 text-gray-300">37.5</td>
                                    <td className="py-4 px-4 text-gray-300">33</td>
                                    <td className="py-4 px-4 text-gray-300">52</td>
                                    <td className="py-4 px-4 text-gray-300">36</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </motion.div>

                {/* How to measure */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    <div className="bg-gradient-to-br from-pink-500/10 to-transparent p-8 rounded-3xl border border-pink-500/20">
                        <h3 className="text-xl font-bold mb-4 text-white tracking-wide">How to Measure</h3>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li className="flex gap-3">
                                <CheckCircle2 size={18} className="text-pink-400 shrink-0 mt-0.5" />
                                <div><strong className="text-white block mb-1">Chest</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</div>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 size={18} className="text-pink-400 shrink-0 mt-0.5" />
                                <div><strong className="text-white block mb-1">Waist</strong> Measure around the narrowest part (typically where your body bends side to side).</div>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle2 size={18} className="text-pink-400 shrink-0 mt-0.5" />
                                <div><strong className="text-white block mb-1">Inseam</strong> Measure from the top of your inner leg along the inside seam to the bottom of the leg.</div>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col justify-center items-start p-8">
                        <h3 className="text-xl font-bold mb-4 text-white tracking-wide">Still Unsure?</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Our team is happy to assist you in finding the perfect fit. Reach out to our dedicated styling department for personalized measurements and fit intent.
                        </p>
                        <Link to="/contact" className="text-sm font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 border-b-2 border-cyan-400 hover:border-cyan-300 pb-1 transition-colors">
                            Contact Support
                        </Link>
                    </div>
                </motion.div>

            </main>
        </div>
    )
}
