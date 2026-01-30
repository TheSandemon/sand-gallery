import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Pricing = () => {
    const { user, grantCredits } = useAuth();

    const handleBuy = async (amount, price) => {
        if (!user) {
            alert("Please sign in to purchase credits.");
            return;
        }

        const confirmed = window.confirm(`Mock Checkout: Purchase ${amount} credits for $${price}?`);
        if (confirmed) {
            // Mock server-side fulfillment
            const success = await grantCredits(user.uid, amount);
            if (success) {
                alert(`SUCCESS! Added ${amount} credits to your account.`);
            }
        }
    };

    const tiers = [
        { name: 'STARTER', credits: 100, price: 5, color: '#fff' },
        { name: 'PRO', credits: 500, price: 20, color: 'var(--neon-green)', bestValue: true },
        { name: 'WHALE', credits: 5000, price: 100, color: 'var(--neon-gold)' }
    ];

    return (
        <div style={{ paddingTop: '120px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                POWER <span style={{ color: 'var(--neon-gold)' }}>UP</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '4rem', fontSize: '1.2rem' }}>
                Secure instant credits to fuel your creation engine.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {tiers.map(tier => (
                    <div key={tier.name} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: `1px solid ${tier.bestValue ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}`,
                        position: 'relative',
                        transform: tier.bestValue ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: tier.bestValue ? '0 0 30px rgba(0, 143, 78, 0.2)' : 'none'
                    }}>
                        {tier.bestValue && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--neon-green)',
                                color: 'black',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                BEST VALUE
                            </div>
                        )}
                        <h2 style={{ color: tier.color, fontSize: '2rem', margin: '0 0 1rem 0' }}>{tier.name}</h2>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            {tier.credits} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>CREDITS</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>
                            ${tier.price}
                        </div>
                        <button
                            onClick={() => handleBuy(tier.credits, tier.price)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                background: tier.bestValue ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)',
                                color: tier.bestValue ? 'black' : 'white',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!tier.bestValue) e.target.style.background = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                if (!tier.bestValue) e.target.style.background = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            BUY NOW
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
