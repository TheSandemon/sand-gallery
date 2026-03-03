import React from 'react';
import { useAuth } from '../context/AuthContext';

const PricingGrid = ({ tiers = [] }) => {
    const { user, grantCredits } = useAuth();

    const handleBuy = async (amount, price) => {
        if (!user) {
            alert("Please sign in to purchase credits.");
            return;
        }

        const confirmed = window.confirm(`Purchase ${amount} credits for $${price}?`);
        if (confirmed) {
            const success = await grantCredits(user.uid, amount);
            if (success) {
                alert(`SUCCESS! Added ${amount} credits to your account.`);
            }
        }
    };

    // Default tiers if none provided
    const displayTiers = tiers && tiers.length > 0 ? tiers : [
        { name: 'STARTER', credits: 100, price: 5, color: '#fff' },
        { name: 'PRO', credits: 500, price: 20, color: 'var(--neon-green)', bestValue: true },
        { name: 'WHALE', credits: 5000, price: 100, color: 'var(--neon-gold)' }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            padding: '2rem 0',
            maxWidth: '1200px',
            margin: '0 auto',
        }}>
            {displayTiers.map((tier, index) => (
                <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '20px',
                    padding: '2rem',
                    border: `1px solid ${tier.bestValue ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}`,
                    position: 'relative',
                    transform: tier.bestValue ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: tier.bestValue ? '0 0 30px rgba(0, 143, 78, 0.2)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
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
                            transition: 'all 0.2s',
                            marginTop: 'auto',
                            border: 'none'
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
    );
};

const Pricing = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                    POWER <span className="text-neon-gold">UP</span>
                </h1>
                <p className="text-xl text-gray-400">
                    Secure instant credits to fuel your creation engine.
                </p>
            </div>

            {/* Pricing Grid */}
            <PricingGrid />

            {/* Info Section */}
            <div className="max-w-4xl mx-auto mt-20 text-center">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
                        <div className="text-3xl mb-2">⚡</div>
                        <h3 className="text-white font-bold mb-2">Instant Delivery</h3>
                        <p className="text-gray-500 text-sm">Credits are added immediately to your account</p>
                    </div>
                    <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
                        <div className="text-3xl mb-2">🔒</div>
                        <h3 className="text-white font-bold mb-2">Secure Payments</h3>
                        <p className="text-gray-500 text-sm">Powered by secure payment processing</p>
                    </div>
                    <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
                        <div className="text-3xl mb-2">💎</div>
                        <h3 className="text-white font-bold mb-2">Best Value</h3>
                        <p className="text-gray-500 text-sm">More credits per dollar with larger packs</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
