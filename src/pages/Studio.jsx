import React, { useState } from 'react';
import { StudioProvider, useStudio } from '../context/StudioContext';
import StudioLayout from '../components/StudioLayout';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

// Wrapper to provide context
const StudioPage = () => (
    <StudioProvider>
        <StudioContent />
    </StudioProvider>
);

const StudioContent = () => {
    const { currentMode, params, updateParams } = useStudio();
    const { user } = useAuth();

    // Local state for generation status (shared across tools for now)
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState('');
    const [resultUrl, setResultUrl] = useState(null);

    // --- LOGIC HANDLERS ---

    const handleGenerateAudio = async () => {
        const { prompt, duration } = params.audio || {};
        if (!prompt) return alert("Please enter a prompt");

        setIsGenerating(true);
        setStatus("Initializing AudioLDM...");
        setResultUrl(null);

        try {
            // Dynamically import to avoid import errors if firebase isn't fully set up
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../firebase');

            const generateAudio = httpsCallable(functions, 'generateAudio');

            setStatus('Sending to Neural Cloud...');

            const result = await generateAudio({
                prompt: prompt,
                duration: parseInt(duration)
            });

            if (result.data.success) {
                setStatus('Audio Generated!');
                setResultUrl(result.data.audioUrl);
            } else {
                throw new Error("Generation failed");
            }
        } catch (error) {
            console.error(error);
            setStatus("Error: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerate = () => {
        if (!user) return alert("Please login first");
        if ((user.credits || 0) < 2) return alert("Insufficient credits");

        if (currentMode === 'audio') handleGenerateAudio();
        else alert(`Generation for ${currentMode} is coming soon!`);
    };

    // --- UI RENDERERS ---

    const renderControls = () => {
        if (currentMode === 'audio') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>PROMPT</label>
                        <textarea
                            value={params.audio?.prompt}
                            onChange={e => updateParams('audio', { prompt: e.target.value })}
                            placeholder="A cyberpunk city rain ambience..."
                            rows={4}
                            style={{
                                width: '100%',
                                background: '#111',
                                border: '1px solid #333',
                                color: 'white',
                                padding: '10px',
                                borderRadius: '8px',
                                resize: 'none',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>DURATION: {params.audio?.duration}s</label>
                        <input
                            type="range"
                            min="1" max="10"
                            value={params.audio?.duration}
                            onChange={e => updateParams('audio', { duration: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--neon-green)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>VOICE ID</label>
                        <select
                            style={{ width: '100%', padding: '0.5rem', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                            disabled
                        >
                            <option>AudioLDM (Default)</option>
                        </select>
                    </div>
                </div>
            );
        }
        return <div style={{ color: '#666', fontStyle: 'italic' }}>Controls for {currentMode} coming soon...</div>;
    };

    const renderCanvas = () => {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'radial-gradient(circle at center, #1a1a1a 1px, transparent 1px)',
                backgroundSize: '20px 20px'

            }}>
                {/* Result Area */}
                {resultUrl ? (
                    <div style={{
                        background: 'rgba(0,20,0,0.8)',
                        border: '1px solid var(--neon-green)',
                        padding: '2rem',
                        borderRadius: '16px',
                        textAlign: 'center',
                        animation: 'fadeIn 0.5s'
                    }}>
                        <h3 style={{ marginTop: 0, color: 'var(--neon-green)' }}>SUCCESS</h3>
                        <audio controls src={resultUrl} autoPlay />
                        <div style={{ marginTop: '1rem' }}>
                            <button onClick={() => setResultUrl(null)} style={{ color: '#fff', textDecoration: 'underline', background: 'none' }}>
                                Generate Another
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', opacity: 0.3 }}>
                        {isGenerating ? (
                            <>
                                <Zap size={64} className="animate-pulse" style={{ animation: 'pulse 1s infinite' }} />
                                <p style={{ marginTop: '1rem' }}>{status}</p>
                            </>
                        ) : (
                            <>
                                <h1 style={{ fontSize: '4rem', margin: 0, fontWeight: '900', color: '#222' }}>STUDIO</h1>
                                <p>Select a mode and configure settings to generate.</p>
                            </>
                        )}
                    </div>
                )}

                <style>{`
                    @keyframes pulse {
                        0% { opacity: 0.5; transform: scale(0.95); }
                        50% { opacity: 1; transform: scale(1.05); }
                        100% { opacity: 0.5; transform: scale(0.95); }
                    }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; } }
                 `}</style>
            </div>
        );
    };

    return (
        <StudioLayout
            controls={renderControls()}
            onGenerate={handleGenerate}
        >
            {renderCanvas()}
        </StudioLayout>
    );
};

export default StudioPage;
