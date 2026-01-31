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

    const handleGenerateVideo = async () => {
        const { prompt } = params.video || {};
        if (!prompt) return alert("Please enter a prompt for video");

        setIsGenerating(true);
        setStatus("Initializing Zeroscope...");
        setResultUrl(null);

        try {
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../firebase');

            const generateVideo = httpsCallable(functions, 'generateVideo');

            setStatus('Synthesizing Frames (this takes ~30s)...');

            const result = await generateVideo({
                prompt: prompt,
                motion: 5
            });

            if (result.data.success) {
                setStatus('Video Generated!');
                setResultUrl(result.data.videoUrl);
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

        const cost = currentMode === 'video' ? 10 : 2;
        if ((user.credits || 0) < cost) return alert(`Insufficient credits (Need ${cost})`);

        if (currentMode === 'audio') handleGenerateAudio();
        else if (currentMode === 'video') handleGenerateVideo();
        else alert(`Generation for ${currentMode} is coming soon!`);
    };

    // --- UI RENDERERS ---

    const renderControls = () => {
        if (currentMode === 'audio') {
            return (
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">PROMPT</label>
                        <textarea
                            value={params.audio?.prompt}
                            onChange={e => updateParams('audio', { prompt: e.target.value })}
                            placeholder="A cyberpunk city rain ambience..."
                            rows={4}
                            className="w-full bg-[#111] border border-gray-800 text-white p-3 rounded-lg resize-none outline-none text-sm focus:border-neon-green transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">DURATION: {params.audio?.duration}s</label>
                        <input
                            type="range"
                            min="1" max="10"
                            value={params.audio?.duration}
                            onChange={e => updateParams('audio', { duration: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-green"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">VOICE ID</label>
                        <select
                            className="w-full p-2 bg-[#111] border border-gray-800 text-gray-400 rounded-md text-sm"
                            disabled
                        >
                            <option>AudioLDM (Default)</option>
                        </select>
                    </div>
                </div>
            );
        }
        if (currentMode === 'video') {
            return (
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">VIDEO PROMPT</label>
                        <textarea
                            value={params.video?.prompt}
                            onChange={e => updateParams('video', { prompt: e.target.value })}
                            placeholder="A drone shot of a futuristic neon city..."
                            rows={4}
                            className="w-full bg-[#111] border border-gray-800 text-white p-3 rounded-lg resize-none outline-none text-sm focus:border-neon-green transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">MOTION BUCKET (5)</label>
                        <input
                            type="range"
                            min="1" max="10"
                            defaultValue="5"
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-green opacity-50 cursor-not-allowed"
                            disabled
                            title="Coming in v2"
                        />
                    </div>
                </div>
            );
        }
        return <div className="text-gray-600 italic text-sm">Controls for {currentMode} coming soon...</div>;
    };

    const renderCanvas = () => {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#1a1a1a_1px,_transparent_1px)] bg-[size:20px_20px]">
                {/* Result Area */}
                {resultUrl ? (
                    <div className="bg-black/80 border border-neon-green p-8 rounded-2xl text-center animate-fade-in shadow-[0_0_30px_rgba(0,143,78,0.2)]">
                        <h3 className="mt-0 text-neon-green text-xl font-bold tracking-widest mb-4">SUCCESS</h3>
                        {currentMode === 'video' ? (
                            <video controls src={resultUrl} autoPlay loop className="w-full max-w-lg rounded-lg border border-[#333]" />
                        ) : (
                            <audio controls src={resultUrl} autoPlay className="w-full max-w-md" />
                        )}
                        <div className="mt-4">
                            <button onClick={() => setResultUrl(null)} className="text-white underline hover:text-neon-green transition-colors text-sm">
                                Generate Another
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center opacity-30">
                        {isGenerating ? (
                            <div className="flex flex-col items-center">
                                <Zap size={64} className="animate-pulse text-neon-green" />
                                <p className="mt-4 text-neon-green font-mono">{status}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <h1 className="text-6xl m-0 font-black text-[#222]">STUDIO</h1>
                                <p className="text-gray-600 mt-2">Select a mode and configure settings to generate.</p>
                            </div>
                        )}
                    </div>
                )}
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
