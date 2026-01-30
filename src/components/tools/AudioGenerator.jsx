import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AudioGenerator = () => {
    const { deductCredits } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        const cost = 2; // Cost per generation

        if (await deductCredits(cost)) {
            setIsGenerating(true);
            setStatus('Initializing AudioLDM...');

            // Mock Generation Process
            setTimeout(() => {
                setStatus('Diffusing audio waveforms...');
                setTimeout(() => {
                    setStatus('Finalizing output...');
                    setTimeout(() => {
                        setIsGenerating(false);
                        setStatus('Audio Generated! (Mock Success)');
                        // Future: Handle actual audio file result here
                    }, 1500);
                }, 1500);
            }, 1000);
        }
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(199, 155, 55, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <h2 style={{ margin: 0, color: 'var(--neon-gold)' }}>Audio Synthesis</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Prompt</label>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the sound (e.g., 'Cyberpunk city ambience')"
                    style={{
                        padding: '12px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none'
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Duration: {duration}s</label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--neon-green)' }}
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                style={{
                    padding: '12px',
                    background: isGenerating ? '#333' : 'var(--neon-green)',
                    color: isGenerating ? '#888' : 'black',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    marginTop: '8px',
                    cursor: isGenerating ? 'default' : 'pointer'
                }}
            >
                {isGenerating ? status : `Generate (2 Credits)`}
            </button>
        </div>
    );
};

export default AudioGenerator;
