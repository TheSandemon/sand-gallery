import React, { useState } from 'react';
import { StudioProvider, useStudio } from '../context/StudioContext';
import StudioLayout from '../components/StudioLayout';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';
import { MODELS } from '../config/models';

// Wrapper to provide context
const StudioPage = () => (
    <StudioProvider>
        <StudioContent />
    </StudioProvider>
);

const StudioContent = () => {
    const { currentMode, params, updateParams, selectedModel, setSelectedModel, serviceStatus } = useStudio();
    const { user } = useAuth();

    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState('');
    const [resultData, setResultData] = useState(null); // { url, text, type }

    // Auto-select first available model when mode changes or status loads
    React.useEffect(() => {
        // Import dynamically if needed or just use the config if available
        import('../config/models').then(({ MODELS }) => {
            const modeModels = MODELS[currentMode] || [];
            if (modeModels.length > 0 && !selectedModel) {
                setSelectedModel(modeModels[0]);
            }
        });
    }, [currentMode, serviceStatus]);

    // --- HANDLERS ---

    const handleGenerate = async () => {
        if (!user) return alert("Please login first");
        if (!selectedModel) return alert("No model selected");

        const cost = selectedModel.cost;
        if ((user.credits || 0) < cost) return alert(`Insufficient credits (Need ${cost})`);

        // Mode specific validation
        if (currentMode === 'audio' && !params.audio?.prompt) return alert("Prompt required");
        if (currentMode === 'video' && !params.video?.prompt) return alert("Prompt required");
        if (currentMode === 'image' && !params.image?.prompt) return alert("Prompt required");
        if (currentMode === 'text' && !params.text?.prompt) return alert("Prompt required");

        setIsGenerating(true);
        setStatus(`Initializing ${selectedModel.name}...`);
        setResultData(null);

        try {
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../firebase');

            let functionName = '';
            let payload = {};

            // Build Payload
            if (currentMode === 'audio') {
                functionName = 'generateAudio';
                payload = { ...params.audio, version: selectedModel.version };
            } else if (currentMode === 'video') {
                functionName = 'generateVideo';
                payload = { ...params.video, version: selectedModel.version };
            } else if (currentMode === 'image') {
                functionName = 'generateImage';
                payload = {
                    ...params.image,
                    provider: selectedModel.provider,
                    modelId: selectedModel.modelId || selectedModel.id,
                    version: selectedModel.version
                };
            } else if (currentMode === 'text') {
                functionName = 'generateText';
                payload = {
                    ...params.text,
                    modelId: selectedModel.modelId
                };
            }

            const generateFn = httpsCallable(functions, functionName);
            setStatus('Generating...');

            const result = await generateFn(payload);
            const data = result.data;

            if (data.success) {
                setStatus('Success!');
                if (currentMode === 'audio') setResultData({ type: 'audio', url: data.audioUrl });
                if (currentMode === 'video') setResultData({ type: 'video', url: data.videoUrl });
                if (currentMode === 'image') setResultData({ type: 'image', url: data.imageUrl });
                if (currentMode === 'text') setResultData({ type: 'text', text: data.text });
            } else {
                throw new Error("Generation returned failure");
            }

        } catch (error) {
            console.error(error);
            setStatus("Error: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- UI HELPERS ---

    const renderModelSelector = () => {
        // We need the models list. Since we are inside component, let's load it synchronously or assume it's imported at top
        // Ideally pass it from context or import at file level. 
        // For this patch, I'll update the top of file to import MODELS.
        // Assuming MODELS is imported:
        const modeModels = MODELS[currentMode] || [];

        return (
            <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">MODEL</label>
                <select
                    className="w-full p-3 bg-[#111] border border-gray-800 text-white rounded-lg text-sm outline-none focus:border-neon-green"
                    value={selectedModel?.id || ''}
                    onChange={(e) => {
                        const m = modeModels.find(m => m.id === e.target.value);
                        setSelectedModel(m);
                    }}
                >
                    {modeModels.map(model => {
                        const isAvailable = serviceStatus[model.provider];
                        return (
                            <option key={model.id} value={model.id} disabled={!isAvailable} className={!isAvailable ? 'text-gray-600' : ''}>
                                {model.name} ({model.cost} Credits) {!isAvailable ? '[Missing Key]' : ''}
                            </option>
                        );
                    })}
                </select>
            </div>
        );
    };

    const renderControls = () => {
        return (
            <div className="flex flex-col gap-6">
                {renderModelSelector()}

                {/* PROMPTS */}
                <div>
                    <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">PROMPT</label>
                    <textarea
                        value={params[currentMode]?.prompt || ''}
                        onChange={e => updateParams(currentMode, { prompt: e.target.value })}
                        placeholder={`Describe your ${currentMode}...`}
                        rows={5}
                        className="w-full bg-[#111] border border-gray-800 text-white p-3 rounded-lg resize-none outline-none text-sm focus:border-neon-green transition-colors"
                    />
                </div>

                {/* SPECIFIC CONTROLS */}
                {currentMode === 'audio' && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">DURATION: {params.audio?.duration}s</label>
                        <input
                            type="range" min="1" max="30"
                            value={params.audio?.duration}
                            onChange={e => updateParams('audio', { duration: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-green"
                        />
                    </div>
                )}
                {currentMode === 'image' && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-2 font-bold tracking-wider">ASPECT RATIO</label>
                        <select
                            value={params.image?.aspectRatio}
                            onChange={e => updateParams('image', { aspectRatio: e.target.value })}
                            className="w-full p-2 bg-[#111] border border-gray-800 text-gray-400 rounded-md text-sm"
                        >
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                        </select>
                    </div>
                )}
            </div>
        );
    };

    const renderCanvas = () => {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#1a1a1a_1px,_transparent_1px)] bg-[size:20px_20px]">
                {resultData ? (
                    <div className="bg-black/90 border border-neon-green p-8 rounded-2xl text-center animate-fade-in shadow-[0_0_50px_rgba(0,143,78,0.2)] max-w-4xl max-h-[80vh] overflow-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-neon-green text-xl font-bold tracking-widest">SUCCESS</h3>
                            <button onClick={() => setResultData(null)} className="text-white hover:text-neon-green">✕</button>
                        </div>

                        {resultData.type === 'audio' && <audio controls src={resultData.url} autoPlay className="w-full min-w-[300px]" />}
                        {resultData.type === 'video' && <video controls src={resultData.url} autoPlay loop className="max-w-full rounded-lg border border-[#333]" />}
                        {resultData.type === 'image' && <img src={resultData.url} alt="Generated" className="max-w-full rounded-lg border border-[#333]" />}
                        {resultData.type === 'text' && <div className="text-left text-gray-200 whitespace-pre-wrap font-mono text-sm">{resultData.text}</div>}

                        <div className="mt-6 text-xs text-gray-500 uppercase tracking-widest">
                            Generated with {selectedModel?.name}
                        </div>
                    </div>
                ) : (
                    <div className="text-center opacity-30 select-none pointer-events-none">
                        {isGenerating ? (
                            <div className="flex flex-col items-center">
                                <Zap size={64} className="animate-pulse text-neon-green" />
                                <p className="mt-4 text-neon-green font-mono tracking-wider">{status}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center transform scale-90">
                                <h1 className="text-[8rem] leading-none font-black text-[#222]">STUDIO</h1>
                                <p className="text-gray-600 font-mono tracking-[0.5em] uppercase mt-4">Create with Intelligence</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <StudioLayout controls={renderControls()} onGenerate={handleGenerate}>
            {renderCanvas()}
        </StudioLayout>
    );
};

export default StudioPage;
