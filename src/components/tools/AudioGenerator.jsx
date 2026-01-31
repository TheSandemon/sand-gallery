import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AudioGenerator = () => {
    // Note: deducted on server side now! 
    const { user } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        if ((user.credits || 0) < 2) {
            alert("Not enough credits (2 required).");
            return;
        }

        setIsGenerating(true);
        setAudioUrl(null);
        setStatus('Initializing AudioLDM...');

        try {
            // Dynamically import to avoid import errors if firebase isn't fully set up
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../../firebase');

            const generateAudio = httpsCallable(functions, 'generateAudio');

            setStatus('Sending to Neural Cloud...');

            const result = await generateAudio({
                prompt: prompt,
                duration: parseInt(duration)
            });

            if (result.data.success) {
                setStatus('Audio Generated!');
                setAudioUrl(result.data.audioUrl);
            } else {
                throw new Error("Generation failed");
            }
        } catch (error) {
            console.error("Generation error:", error);
            setStatus('Error: ' + error.message);
            // alert("Failed to generate: " + error.message);
        } finally {
            setIsGenerating(false);
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
            <h2 style={{ margin: 0, color: 'var(--neon-gold)' }}>Audio Synthesis (Beta)</h2>

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

            {audioUrl && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,255,0,0.1)', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--neon-green)', fontSize: '0.9rem' }}>Result:</p>
                    <audio controls src={audioUrl} style={{ width: '100%' }} />
                </div>
            )}
        </div>
    );
};

export default AudioGenerator;
