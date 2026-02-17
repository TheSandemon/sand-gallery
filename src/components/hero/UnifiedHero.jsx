/**
 * Unified Hero Component
 * 
 * THE ONLY Hero component for Sand-Gallery.
 * Replaces the inline-styled abomination at src/components/Hero.jsx
 * 
 * CMS-driven with sensible defaults. All styling via Tailwind + CSS variables.
 * 
 * @example
 * <UnifiedHero 
 *   title="SAND.ATELIER"
 *   tagline="Creative Technologist × AI"
 *   subtitle="Building digital experiences that feel alive."
 *   ctaText="Explore Work"
 *   ctaLink="/studio"
 * />
 */

import React from 'react';
import { KineticTitle, MeshGradient, CTAButton, ScrollIndicator } from './index';

/**
 * Main UnifiedHero Component
 * 
 * @param {string} title - Main title text (default: "SAND.ATELIER")
 * @param {string} tagline - Tagline above title (default: "Creative Portfolio")
 * @param {string} subtitle - Description below title
 * @param {string} ctaText - CTA button text
 * @param {string} ctaLink - CTA button link
 * @param {boolean} showTagline - Show/hide tagline
 * @param {boolean} showScrollIndicator - Show scroll indicator
 */
const UnifiedHero = ({
    title = "SAND.ATELIER",
    tagline = "Creative Portfolio",
    subtitle = "Games, Apps, and Art from Sand",
    ctaText = "View Gallery",
    ctaLink = "/gallery",
    ctaSecondaryText = "About",
    ctaSecondaryLink = "/about",
    showTagline = true,
    showScrollIndicator = true,
}) => {
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
                {showTagline && (
                    <motion.div 
                        variants={taglineVariants}
                        initial="hidden"
                        animate="visible"
                        className="mb-6"
                    >
                        <span className="text-lg md:text-xl font-medium tracking-[0.3em] uppercase text-[var(--accent-primary)]">
                            {tagline.split('').map((char, i) => (
                                <motion.span key={i} variants={wordVariants} className="inline-block">
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </span>
                    </motion.div>
                )}

                {/* Main kinetic title */}
                <div className="mb-8">
                    <KineticTitle text={title} delay={0.2} />
                </div>

                {/* Description */}
                {subtitle && (
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="text-xl md:text-2xl text-[var(--text-dim)] mb-12 max-w-2xl mx-auto"
                    >
                        {subtitle}
                    </motion.p>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                    <CTAButton to={ctaLink} primary delay={1.4}>
                        {ctaText}
                    </CTAButton>
                    {ctaSecondaryText && ctaSecondaryLink && (
                        <CTAButton to={ctaSecondaryLink} delay={1.6}>
                            {ctaSecondaryText}
                        </CTAButton>
                    )}
                </div>

                {/* Scroll indicator */}
                {showScrollIndicator && (
                    <ScrollIndicator />
                )}
            </div>
        </section>
    );
};

export default UnifiedHero;
