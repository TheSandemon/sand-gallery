import React from 'react';

/**
 * Hero Component - Main landing banner
 * Supports dynamic props from CMS with sensible defaults.
 * Accepts isEditor prop for WYSIWYG editing mode.
 */
const Hero = ({
    titleLine1 = 'CREATIVE',
    titleLine2 = 'TECHNOLOGIST',
    titleLine3 = '× AI',
    subtitle = 'Bridging the gap between human imagination and machine intelligence. Building digital experiences that feel alive.',
    ctaText = 'Explore Work',
    ctaLink = '/studio',
    cmsStyles = {},
    isEditor = false,
}) => {
    const styles = {
        section: {
            height: isEditor ? '100%' : '100vh',
            minHeight: isEditor ? 'auto' : undefined,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: isEditor ? '1rem' : '0 2rem',
            position: 'relative',
            zIndex: 1,
            ...cmsStyles,
        },
        title: {
            fontSize: isEditor ? 'clamp(1.5rem, 4vw, 2.5rem)' : 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: isEditor ? '0.75rem' : '1.5rem',
            color: 'var(--text-primary)',
            textShadow: '0 0 20px rgba(0, 143, 78, 0.3)',
        },
        highlight: {
            color: 'transparent',
            WebkitTextStroke: isEditor ? '1px var(--neon-green)' : '2px var(--neon-green)',
        },
        subtitle: {
            fontSize: isEditor ? '0.75rem' : 'clamp(1rem, 2vw, 1.5rem)',
            color: 'var(--text-secondary)',
            maxWidth: isEditor ? '90%' : '600px',
            margin: isEditor ? '0 auto 1rem' : '0 auto 3rem',
            lineHeight: '1.4',
            overflow: isEditor ? 'hidden' : undefined,
            textOverflow: isEditor ? 'ellipsis' : undefined,
            display: isEditor ? '-webkit-box' : undefined,
            WebkitLineClamp: isEditor ? 2 : undefined,
            WebkitBoxOrient: isEditor ? 'vertical' : undefined,
        },
        cta: {
            padding: isEditor ? '0.5rem 1.5rem' : '1rem 3rem',
            fontSize: isEditor ? '0.75rem' : '1rem',
            fontWeight: '700',
            color: 'var(--bg-dark)',
            backgroundColor: 'var(--neon-green)',
            borderRadius: '50px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(0, 143, 78, 0.4)',
            border: 'none',
            cursor: 'pointer',
        },
    };

    const handleClick = () => {
        if (ctaLink) {
            window.location.href = ctaLink;
        }
    };

    return (
        <section style={styles.section}>
            <h1 style={styles.title}>
                {titleLine1}<br />
                <span style={styles.highlight}>{titleLine2}</span><br />
                <span style={{ color: 'var(--neon-gold)' }}>{titleLine3}</span>
            </h1>
            <p style={styles.subtitle}>
                {subtitle}
            </p>
            <button
                style={styles.cta}
                onClick={handleClick}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--text-primary)';
                    e.target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--neon-green)';
                    e.target.style.boxShadow = '0 0 20px rgba(0, 143, 78, 0.4)';
                }}
            >
                {ctaText}
            </button>
        </section>
    );
};

export default Hero;
