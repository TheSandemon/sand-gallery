import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';
import PageLoader from '../components/PageLoader';

/**
 * Kinetic Typography Component
 * Staggers letter animation for "SAND.ATELIER"
 */
const KineticTitle = ({ text = "SAND.ATELIER", delay = 0 }) => {
    const letters = text.split('');
    
    return (
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none font-[family-name:var(--font-display)]">
            {letters.map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 100, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ 
                        delay: delay + index * 0.05,
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 200,
                        damping: 15
                    }}
                    className="inline-block"
                    style={{ perspective: 1000 }}
                >
                    {letter === '.' ? <span className="text-[var(--accent-primary)]">.</span> : letter}
                </motion.span>
            ))}
        </h1>
    );
};

/**
 * Animated Mesh Gradient Background
 */
const MeshGradient = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-main)] via-[var(--bg-elevated)] to-[var(--bg-main)]" />
            
            {/* Animated orbs */}
            <motion.div 
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--accent-primary)]/20 rounded-full blur-[120px]" 
            />
            <motion.div 
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--accent-secondary)]/15 rounded-full blur-[100px]" 
            />
            <motion.div 
                animate={{
                    x: [0, 50, 0],
                    y: [0, 80, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)]/10 rounded-full blur-[150px]" 
            />
            
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDQgMEw0MCAwIiBzdHJva2U9InJnYmEoMTYzLDIzNCwyNTYsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        </div>
    );
};

/**
 * CTA Button with micro-interactions
 */
const CTAButton = ({ to, children, primary = false, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
    >
        <Link 
            to={to}
            className={`relative px-10 py-5 font-semibold text-lg tracking-wide rounded-xl overflow-hidden group ${
                primary 
                    ? 'bg-[var(--accent-primary)] text-white' 
                    : 'border-2 border-[var(--text-primary)]/20 text-[var(--text-primary)]'
            }`}
        >
            {/* Hover glow effect */}
            <span className={`absolute inset-0 transition-opacity duration-300 ${
                primary 
                    ? 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-0 group-hover:opacity-100' 
                    : 'bg-[var(--text-primary)]/5 opacity-0 group-hover:opacity-100'
            }`} />
            
            {/* Scale animation on hover */}
            <motion.span 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative z-10 inline-block"
            >
                {children}
            </motion.span>
            
            {/* Shimmer effect */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </Link>
    </motion.div>
);

/**
 * Fallback Hero - Kinetic Typography + Mesh Gradient
 */
const FallbackHero = () => {
    const taglineVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.8 }
        }
    };

    const wordVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' }
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <MeshGradient />
            
            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                {/* Tagline with staggered words */}
                <motion.div 
                    variants={taglineVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-6"
                >
                    <span className="text-lg md:text-xl font-medium tracking-[0.3em] uppercase text-[var(--accent-primary)]">
                        {"Creative Portfolio".split('').map((char, i) => (
                            <motion.span key={i} variants={wordVariants} className="inline-block">
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        ))}
                    </span>
                </motion.div>

                {/* Main kinetic title */}
                <div className="mb-8">
                    <KineticTitle text="SAND.ATELIER" delay={0.2} />
                </div>

                {/* Description */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="text-xl md:text-2xl text-[var(--text-dim)] mb-12 max-w-2xl mx-auto"
                >
                    Games, Apps, and Art from Sand
                </motion.p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                    <CTAButton to="/gallery" primary delay={1.4}>
                        View Gallery
                    </CTAButton>
                    <CTAButton to="/about" delay={1.6}>
                        About
                    </CTAButton>
                </div>

                {/* Scroll indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-10 rounded-full border-2 border-[var(--text-dim)]/30 flex justify-center pt-2"
                    >
                        <motion.div className="w-1 h-2 bg-[var(--text-dim)]/50 rounded-full" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

const Home = () => {
    const { data, loading } = usePageContent('home', { realtime: false });

    if (loading) {
        return <PageLoader variant="hero" />;
    }

    const hasContent = data && data.sections && data.sections.length > 0;

    return (
        <main>
            {hasContent ? (
                <DynamicRenderer sections={data.sections} />
            ) : (
                <FallbackHero />
            )}
        </main>
    );
};

export default Home;
