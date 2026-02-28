import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export function FeaturedCarousel({ products }) {
    const addItem = useCartStore((state) => state.addItem);
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    const N = products.length;
    // We duplicate the products array 9 times to create an extremely long scroll space.
    // This allows the user to swipe extremely fast multiple times without hitting a wall.
    const multiplier = 9;
    const displayProducts = Array(multiplier).fill(products).flat().map((p, index) => ({
        ...p,
        uniqueIndex: `prod-${p.id}-${index}`
    }));

    // Start clearly in the exact middle set
    const middleSetStart = Math.floor(multiplier / 2) * N;

    const [activeIndex, setActiveIndex] = useState(middleSetStart);
    const activeIndexRef = useRef(middleSetStart);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const scrollCenter = container.scrollLeft + container.clientWidth / 2;

        const children = Array.from(container.children).filter(child => child.hasAttribute('data-carousel-item'));
        if (children.length === 0) return;

        let minDistance = Infinity;
        let newActiveIndex = activeIndexRef.current;

        const mobile = window.innerWidth < 640;
        const itemWidth = mobile ? 260 : 320;

        children.forEach((child, index) => {
            const childCenter = child.offsetLeft + child.offsetWidth / 2;
            const distance = Math.abs(scrollCenter - childCenter);

            const maxDistance = itemWidth;
            let ratio = Math.min(distance / maxDistance, 1);

            const scale = 1 - (ratio * 0.15);
            const opacity = 1 - (ratio * 0.6);
            const blur = ratio * 4;
            const zIndex = 50 - Math.round(ratio * 10);

            const transformWrapper = child.querySelector('.transform-wrapper');
            if (transformWrapper) {
                transformWrapper.style.transform = `scale(${scale})`;
                transformWrapper.style.opacity = distance > maxDistance * 2 ? 0 : opacity;
                transformWrapper.style.zIndex = zIndex;
            }

            const blurTarget = child.querySelector('.blur-target');
            if (blurTarget) {
                blurTarget.style.filter = `blur(${blur}px)`;
            }

            const btn = child.querySelector('.add-to-bag-btn');
            if (btn) {
                const btnRatio = Math.min(distance / (maxDistance * 0.5), 1);
                btn.style.opacity = 1 - btnRatio;
                btn.style.transform = `translateY(${btnRatio * 16}px) scale(${1 - btnRatio * 0.05})`;
                btn.style.pointerEvents = btnRatio < 0.5 ? 'auto' : 'none';
            }

            // Immediately set visual active state classes based on scroll distance
            const innerCard = child.querySelector('.inner-card');
            if (innerCard) {
                if (distance < maxDistance * 0.5) {
                    innerCard.classList.add('bg-neon-gradient', 'shadow-[0_20px_40px_rgba(0,0,0,0.15)]');
                    innerCard.classList.remove('bg-transparent', 'hover:bg-white/5');
                    innerCard.style.transform = 'translateY(-8px)';
                    innerCard.style.cursor = 'default';
                } else {
                    innerCard.classList.remove('bg-neon-gradient', 'shadow-[0_20px_40px_rgba(0,0,0,0.15)]');
                    innerCard.classList.add('bg-transparent', 'hover:bg-white/5');
                    innerCard.style.transform = 'none';
                    innerCard.style.cursor = 'pointer';
                }
            }

            if (distance < minDistance) {
                minDistance = distance;
                newActiveIndex = index;
            }
        });

        if (newActiveIndex !== activeIndexRef.current) {
            activeIndexRef.current = newActiveIndex;
            setActiveIndex(newActiveIndex); // For pagination dots
        }
    }, []);

    // Initial position jump exactly to the middle block
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!scrollRef.current || hasInitialized.current || N === 0) return;
        const container = scrollRef.current;
        const target = container.children[middleSetStart];

        if (target) {
            container.style.scrollBehavior = 'auto'; // Disable smooth scroll for instant jump
            const scrollLeft = target.offsetLeft - container.clientWidth / 2 + target.offsetWidth / 2;
            container.scrollLeft = scrollLeft;

            onScroll(); // Apply initial active styles

            // Re-enable smooth native scroll on next frame
            requestAnimationFrame(() => {
                container.style.scrollBehavior = 'smooth';
                hasInitialized.current = true;
            });
        }
    }, [middleSetStart, onScroll, N]);

    // Infinite loop trick: Jump back to middle when hitting the edges (when scroll stops)
    useEffect(() => {
        const container = scrollRef.current;
        if (!container || N === 0) return;

        let scrollTimeout;

        const handleScroll = () => {
            onScroll();

            clearTimeout(scrollTimeout);
            // 150ms timeout to detect when the momentum scrolling has completely stopped
            scrollTimeout = setTimeout(() => {
                handleScrollEnd();
            }, 150);
        };

        const handleScrollEnd = () => {
            if (!container) return;
            const currentActive = activeIndexRef.current;

            // If user scrolled way into the first 3 sets or the last 3 sets
            // jump them completely invisibly back to the safe middle set
            if (currentActive < 3 * N || currentActive >= (multiplier - 3) * N) {
                const realIndex = currentActive % N;
                const targetIndex = middleSetStart + realIndex;

                const target = container.children[targetIndex];
                if (target) {
                    container.style.scrollBehavior = 'auto';
                    const newScrollLeft = target.offsetLeft - container.clientWidth / 2 + target.offsetWidth / 2;
                    container.scrollLeft = newScrollLeft;

                    onScroll();

                    requestAnimationFrame(() => {
                        container.style.scrollBehavior = 'smooth';
                    });
                }
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [onScroll, N, middleSetStart, multiplier]);

    const scrollTo = (realIndex) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const currentIndex = activeIndexRef.current;

        // Find the absolute closest instance of this actual product index
        let closestIndex = realIndex;
        let minDiff = Infinity;
        for (let block = 0; block < multiplier; block++) {
            const idx = block * N + realIndex;
            const diff = Math.abs(idx - currentIndex);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = idx;
            }
        }

        const target = container.children[closestIndex];
        if (target) {
            const scrollLeft = target.offsetLeft - container.clientWidth / 2 + target.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    const handleCardClick = (index) => {
        if (activeIndexRef.current !== index) {
            if (!scrollRef.current) return;
            const container = scrollRef.current;
            const target = container.children[index];
            if (target) {
                const scrollLeft = target.offsetLeft - container.clientWidth / 2 + target.offsetWidth / 2;
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        } else {
            navigate('/shop');
        }
    };

    const isMobile = windowWidth < 640;
    const itemWidth = isMobile ? 260 : 320;
    const itemHeight = isMobile ? 400 : 460;
    const overlap = isMobile ? -40 : -50;

    // Convert total index to real product index (0 to N-1)
    const activeDotIndex = activeIndex % N;

    return (
        <div className="relative w-full h-[550px] md:h-[600px] flex justify-center items-center overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Native Scroll Container */}
            <div
                ref={scrollRef}
                className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-20"
                style={{
                    paddingLeft: `calc(50vw - ${itemWidth / 2}px)`,
                    paddingRight: `calc(50vw - ${itemWidth / 2}px)`,
                }}
            >
                {displayProducts.map((product, i) => (
                    <div
                        key={product.uniqueIndex}
                        data-carousel-item
                        className="shrink-0 snap-center relative outline-none"
                        style={{
                            width: `${itemWidth}px`,
                            height: `${itemHeight}px`,
                            marginLeft: i === 0 ? '0' : `${overlap}px`,
                        }}
                    >
                        {/* High Performance CSS Transforms Container */}
                        <div className="transform-wrapper w-full h-full relative will-change-transform">
                            {/* Card Content & Active Styling */}
                            <div
                                className="inner-card w-full h-full rounded-[24px] p-[2px] transition-[background,box-shadow,transform] duration-300"
                                onClick={() => handleCardClick(i)}
                            >
                                <div className="blur-target bg-[#FAFAFA] w-full h-full rounded-[22px] flex flex-col p-5 md:p-6 overflow-hidden">
                                    <div className="w-full h-[55%] relative mb-5 overflow-hidden rounded-[16px] bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            draggable={false}
                                            onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#f3f4f6'; }}
                                        />
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm shadow-sm text-gray-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">
                                            NEW
                                        </div>
                                    </div>

                                    <div className="flex flex-col flex-1 pb-1 text-left">
                                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1.5">
                                            {product.category.split('|')[0]}
                                        </span>
                                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight leading-tight mb-auto font-sans">
                                            {product.name}
                                        </h3>

                                        <div className="flex justify-between items-end mt-4">
                                            <p className="text-lg md:text-xl font-bold text-gray-900 font-sans">
                                                ₹{product.price}
                                            </p>

                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addItem(product, user?.id);
                                                }}
                                                className="add-to-bag-btn bg-[#050505] text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-colors"
                                            >
                                                Add to Bag
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* True Pagination Controls */}
            {N > 0 && (
                <div className="absolute bottom-6 flex gap-3 z-30 pointer-events-auto">
                    {products.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`transition-all duration-300 rounded-full ${i === activeDotIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
