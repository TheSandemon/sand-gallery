import React, { useState, useEffect } from 'react';
import { StudioProvider, useStudio } from '../context/StudioContext';
import StudioLayout from '../components/StudioLayout';
import MediaViewer from '../components/MediaViewer';
import { useAuth } from '../context/AuthContext';
import {
    Zap, Sparkles, Film, Music, FileText,
    Search, Sliders, ArrowUp, Clock, Grid, Mic, Volume2,
    MoreHorizontal, Smartphone, Monitor, Settings, Play
} from 'lucide-react';
import { MODELS } from '../config/models';
import { useDeviceState } from '../hooks/useDeviceState';

const StudioPage = () => (
    <StudioProvider>
        <StudioContent />
    </StudioProvider>
);

const StudioContent = () => {
    const { currentMode, setCurrentMode, params, updateParams, selectedModel, setSelectedModel, serviceStatus } = useStudio();
    const { user } = useAuth();

    // UI State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [status, setStatus] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [history, setHistory] = useState([]);
    const [viewerItem, setViewerItem] = useState(null);

    // Auto-select model logic - Prefer first AVAILABLE model
    useEffect(() => {
        const modeModels = MODELS[currentMode] || [];
        const availableModels = modeModels.filter(m => m.available);
        if (availableModels.length > 0) {
            setSelectedModel(availableModels[0]);
        } else {
            // Do NOT fallback to unavailable models. Leave as null to trigger "UNAVAILABLE" UI.
            setSelectedModel(null);
        }
    }, [currentMode]);

    // History Subscription
    useEffect(() => {
        if (!user) return;
        let unsubscribe = () => { };

        const setup = async () => {
            const { getFirestore, collection, query, where, orderBy, onSnapshot } = await import('firebase/firestore');
            const { app } = await import('../firebase');
            const db = getFirestore(app);

            const q = query(
                collection(db, 'creations'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHistory(data);
            }, (error) => {
                console.error("Firestore History Error:", error);
                setStatus("History Error: " + error.code);
            });
        };
        setup();
        return () => unsubscribe();
    }, [user]);

    // --- LOGIC: Generation ---
    const handleGenerate = async () => {
        if (!user) return alert("Please login first");
        if (!selectedModel) return alert("Select a model first");

        setIsGenerating(true);
        setStatus("Thinking...");
        setResultData(null);

        try {
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../firebase');

            // Map modes to functions
            const map = {
                voice: 'generateAudio',
                music: 'generateAudio',
                sound_effects: 'generateAudio',
                video: 'generateVideo',
                image: 'generateImage'
            };
            const fnName = map[currentMode];

            let payload = { ...params[currentMode] };

            // Inject Model Specifics
            if (currentMode === 'image') {
                payload.provider = selectedModel.provider;
                payload.modelId = selectedModel.modelId || selectedModel.id;
                payload.version = selectedModel.version;
            } else {
                // For all other modes (video, voice, music, sfx), we typically send version/provider/modelId
                // The backend handles parsing based on mode + model
                payload.version = selectedModel.version;
                payload.provider = selectedModel.provider;
                payload.modelId = selectedModel.modelId || selectedModel.id;
                // Add explicit 'type' for audio clarity if backend needs it (though it likely infers from model)
                if (['voice', 'music', 'sound_effects'].includes(currentMode)) {
                    payload.audioType = currentMode;
                }
            }

            const generateFn = httpsCallable(functions, fnName);
            const res = await generateFn(payload);
            const data = res.data;

            if (data.success) {
                if (['voice', 'music', 'sound_effects'].includes(currentMode)) setResultData({ type: 'audio', url: data.audioUrl, subType: currentMode });
                if (currentMode === 'video') setResultData({ type: 'video', url: data.videoUrl });
                if (currentMode === 'image') setResultData({ type: 'image', url: data.imageUrl });
                setStatus("Complete");
            } else {
                throw new Error("Failed");
            }
        } catch (e) {
            console.error(e);
            setStatus("Error: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- UI COMPONENTS ---

    const { isMobile, isPortrait } = useDeviceState();

    // 1. Top Filter Deck
    const renderTopBar = () => {
        if (isMobile) {
            return (
                <div className="w-full overflow-x-auto no-scrollbar py-2 px-1">
                    <div className="flex items-center gap-3 w-max mx-auto">
                        {['all', 'image', 'video', 'voice', 'music', 'sfx'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab === 'sfx' ? 'sound_effects' : tab)}
                                className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                                    ${activeTab === (tab === 'sfx' ? 'sound_effects' : tab)
                                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                        : 'bg-black/40 text-gray-500 border-white/10 backdrop-blur-md hover:text-white hover:border-white/20 hover:bg-white/5'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-4">
                {/* History Label */}
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">HISTORY</span>

                <div className="flex items-center gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300">
                    {['all', 'image', 'video', 'voice', 'music', 'sfx'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab === 'sfx' ? 'sound_effects' : tab)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                ${activeTab === (tab === 'sfx' ? 'sound_effects' : tab) ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="h-4 w-px bg-white/20 mx-2" />
                    <button className="p-2 text-gray-400 hover:text-white"><Search size={14} /></button>
                    <button className="p-2 text-gray-400 hover:text-white"><Grid size={14} /></button>
                </div>
            </div>
        );
    };

    // 2. Settings Drawer Content
    const renderSettings = () => {
        const modeModels = MODELS[currentMode] || [];
        return (
            <div className="p-6 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-white font-black tracking-widest text-lg">SETTINGS</h2>
                    <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-lg transition-colors">✕</button>
                </div>

                {/* Model Selector */}
                <div className="mb-8">
                    <label className="text-[10px] font-bold text-neon-green tracking-widest mb-3 block">ACTIVE MODEL</label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {modeModels.map(m => (
                            <div
                                key={m.id}
                                onClick={() => m.available && setSelectedModel(m)}
                                className={`p-3 rounded-lg border transition-all relative
                                    ${!m.available
                                        ? 'opacity-50 cursor-not-allowed border-gray-800 bg-[#0a0a0a]'
                                        : selectedModel?.id === m.id
                                            ? 'cursor-pointer border-neon-green bg-neon-green/10'
                                            : 'cursor-pointer border-gray-800 bg-[#111] hover:border-gray-600'
                                    }`}
                            >
                                {!m.available && (
                                    <span className="absolute top-2 right-2 text-[8px] uppercase font-bold tracking-wider text-yellow-600 bg-yellow-600/10 px-2 py-0.5 rounded">
                                        Soon
                                    </span>
                                )}
                                <div className="text-white text-sm font-bold">{m.name}</div>
                                <div className="text-xs text-gray-500 flex justify-between mt-1">
                                    <span>{m.provider}</span>
                                    <span>{m.cost}¢</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mode Specific Sliders */}
                {currentMode === 'image' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 tracking-widest mb-2 block">ASPECT RATIO</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['1:1', '16:9', '9:16'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => updateParams('image', { aspectRatio: r })}
                                        className={`p-2 border rounded text-xs ${params.image?.aspectRatio === r ? 'border-white text-white' : 'border-gray-800 text-gray-500'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentMode === 'video' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 tracking-widest mb-2 block">MOTION BUCKET ({params.video?.motion || 5})</label>
                            <input
                                type="range" min="1" max="10"
                                value={params.video?.motion || 5}
                                onChange={e => updateParams('video', { motion: parseInt(e.target.value) })}
                                className="w-full h-1 bg-gray-800 appearance-none rounded-lg accent-neon-green"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // 3. Command Deck
    const renderBottomDeck = () => {
        const placeholder =
            currentMode === 'video' ? "Describe a scene..." :
                currentMode === 'image' ? "Imagine an image..." :
                    currentMode === 'voice' ? "What should I say?" :
                        currentMode === 'music' ? "Describe a song..." :
                            currentMode === 'sound_effects' ? "Describe a sound..." : "Create something...";

        const MODES = [
            { id: 'image', icon: Sparkles, label: 'Image', color: 'text-amber-400' },
            { id: 'video', icon: Film, label: 'Video', color: 'text-red-400' },
            { id: 'voice', icon: Mic, label: 'Voice', color: 'text-purple-400' },
            { id: 'music', icon: Music, label: 'Music', color: 'text-blue-400' },
            { id: 'sound_effects', icon: Volume2, label: 'SFX', color: 'text-orange-400' }
        ];

        // --- MOBILE LAYOUTS ---
        if (isMobile) {
            // landscape mobile (compact bottom bar)
            if (!isPortrait) {
                return (
                    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 p-2 flex gap-2 items-center z-50">
                        {/* Compact Mode Switcher */}
                        <div className="flex bg-white/5 rounded-lg p-1">
                            {MODES.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setCurrentMode(m.id)}
                                    className={`p-2 rounded-md ${currentMode === m.id ? 'bg-white/20 text-white' : 'text-gray-500'}`}
                                >
                                    <m.icon size={16} />
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            value={params[currentMode]?.prompt || ''}
                            onChange={e => updateParams(currentMode, { prompt: e.target.value })}
                            placeholder={placeholder}
                            className="flex-1 bg-transparent text-white border-b border-white/10 focus:border-neon-green outline-none px-2 py-1 text-sm transition-colors"
                        />

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedModel}
                            className={`h-9 px-4 rounded-lg font-bold text-xs flex items-center gap-2 whitespace-nowrap
                                ${isGenerating || !selectedModel ? 'bg-gray-800 text-gray-500' : 'bg-white text-black'}
                             `}
                        >
                            {isGenerating ? <Zap size={14} className="animate-pulse" /> : "CREATE"}
                        </button>
                    </div>
                );
            }

            // PORTRAIT MOBILE (Expanded Bottom Sheet)
            return (
                <div className="w-full bg-[#050505] border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-safe pt-2 flex flex-col gap-4 relative isolate z-50">
                    {/* Visual Handle */}<div className="w-12 h-1 bg-white/10 rounded-full mx-auto" />

                    {/* Mode Scroll */}
                    <div className="px-4">
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 mask-gradient-sides">
                            {MODES.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setCurrentMode(m.id)}
                                    className={`flex flex-col items-center gap-2 min-w-[64px] transition-all duration-300
                                        ${currentMode === m.id ? 'opacity-100 scale-105' : 'opacity-40 grayscale scale-95'}
                                    `}
                                >
                                    <div className={`p-4 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group
                                        ${currentMode === m.id ? 'bg-[#1a1a1a]' : 'bg-[#0a0a0a]'}
                                    `}>
                                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br from-transparent to-white/10`} />
                                        <m.icon size={24} className={m.color} />
                                    </div>
                                    <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="px-4">
                        <div className="bg-[#111] rounded-2xl border border-white/10 p-4 focus-within:border-white/30 focus-within:bg-[#161616] transition-all relative">
                            {/* Video Frame Dropzones (Mini) */}
                            {currentMode === 'video' && (
                                <div className="flex gap-2 mb-2 overflow-x-auto">
                                    {['Start', 'End'].map((label, i) => (
                                        <div key={i} className="min-w-[60px] h-10 rounded border border-dashed border-white/10 flex items-center justify-center bg-black/20">
                                            <span className="text-[8px] text-gray-500">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <textarea
                                value={params[currentMode]?.prompt || ''}
                                onChange={e => updateParams(currentMode, { prompt: e.target.value })}
                                placeholder={placeholder}
                                className="w-full bg-transparent text-white text-base outline-none resize-none h-20 placeholder-gray-600 leading-normal"
                            />

                            {status && (
                                <div className="absolute right-2 bottom-2 text-[10px] font-mono text-neon-green bg-black/50 px-2 py-1 rounded">
                                    {status}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="px-4 pb-4 flex gap-3 h-14">
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className={`flex-1 bg-[#111] rounded-xl border border-white/10 px-4 flex flex-col justify-center transition-all active:scale-95
                                ${!selectedModel ? 'border-red-500/30 bg-red-500/5' : ''}
                            `}
                        >
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mb-0.5">Model</span>
                            <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-bold text-white truncate max-w-[100px]">{selectedModel?.name || 'Select'}</span>
                                <Settings size={14} className="text-gray-600" />
                            </div>
                        </button>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedModel}
                            className={`flex-[2] rounded-xl font-black text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95
                                ${isGenerating || !selectedModel
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-gray-200'}
                            `}
                        >
                            {isGenerating ? <Zap size={18} className="animate-pulse" /> : "CREATE"}
                        </button>
                    </div>
                </div>
            );
        }

        // --- DESKTOP LAYOUT ---
        return (
            <div className={`pointer-events-auto bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex gap-3 shadow-2xl transition-shadow duration-500 w-full
                ${isGenerating ? 'shadow-[#00ff9d]/20 border-[#00ff9d]/30' : ''}
                h-[160px] flex-row items-stretch
            `}>

                {/* Zone A: Mode Switcher (Legacy Desktop) */}
                <div className="w-32 h-full justify-center flex flex-col gap-1 p-1 bg-black/50 rounded-xl border border-white/5">
                    {MODES.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setCurrentMode(m.id)}
                            className={`rounded-lg transition-all flex items-center flex-1 flex-row justify-start gap-3 px-3 w-full
                                ${currentMode === m.id ? 'bg-white/10 ' + m.color : 'text-gray-600 hover:text-gray-400'}
                            `}
                        >
                            <m.icon size={18} />
                            <span className="font-bold tracking-wide text-[10px]">{m.label}</span>
                        </button>
                    ))}
                </div>

                {/* Zone B: Input + Actions */}
                <div className="flex-1 flex flex-col gap-2">
                    {/* Top Row: Input Area */}
                    <div className="flex-1 bg-black/40 rounded-xl border border-white/5 relative flex flex-col overflow-hidden">
                        {/* Video Frame Dropzones */}
                        {currentMode === 'video' && (
                            <div className="absolute top-2 right-2 flex gap-2 z-10">
                                {['Start', 'End'].map((label, i) => (
                                    <div key={i} className="w-20 h-14 rounded-lg border border-dashed border-white/20 bg-black/50 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all">
                                        <Film size={10} className="text-white/20 mb-0.5" />
                                        <span className="text-[8px] font-mono text-gray-500 uppercase">{label} Frame</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <textarea
                            value={params[currentMode]?.prompt || ''}
                            onChange={e => updateParams(currentMode, { prompt: e.target.value })}
                            placeholder={placeholder}
                            className="w-full h-full bg-transparent text-white p-4 text-base outline-none resize-none font-medium placeholder-gray-700 leading-relaxed custom-scrollbar"
                        />
                        {/* Status / Error Toast */}
                        {status && (
                            <div className={`absolute top-2 right-2 max-w-[90%] max-h-[80px] overflow-y-auto custom-scrollbar px-3 py-2 rounded-lg text-xs font-bold backdrop-blur-md shadow-lg z-50 transition-all
                                ${status.startsWith('Error') || status.includes('DEBUG')
                                    ? 'bg-red-950/90 text-red-200 border border-red-500/50 select-text cursor-text'
                                    : 'bg-black/60 text-emerald-400 border border-emerald-500/30 pointer-events-none'}
                            `}>
                                {status.startsWith('DEBUG') ? <code className="font-mono text-[10px] block break-all">{status}</code> : status}
                            </div>
                        )}
                    </div>

                    {/* Bottom Row: Model Selector + CREATE Button */}
                    <div className="flex gap-2 h-14">
                        {/* Model Selector */}
                        <div
                            onClick={() => setIsDrawerOpen(true)}
                            className={`flex-1 bg-black/40 rounded-xl border border-white/5 px-4 flex items-center justify-between cursor-pointer transition-all group
                                ${!selectedModel ? 'opacity-50 hover:bg-red-500/5 hover:border-red-500/20' : 'hover:border-neon-green/30'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`text-[9px] font-bold tracking-widest uppercase shrink-0 ${!selectedModel ? 'text-red-400' : 'text-gray-600'}`}>
                                    {!selectedModel ? 'UNAVAILABLE' : 'MODEL'}
                                </span>
                                <span className={`text-sm font-bold truncate ${!selectedModel ? 'text-gray-500 italic' : 'text-white'}`}>
                                    {selectedModel?.name || 'No models available'}
                                </span>
                                {selectedModel && <span className="text-[10px] text-neon-green shrink-0">{selectedModel?.provider}</span>}
                            </div>
                            <Settings size={14} className="text-gray-600 group-hover:text-white transition-colors shrink-0" />
                        </div>

                        {/* CREATE Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedModel}
                            className={`w-40 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95
                                ${isGenerating || !selectedModel ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' : 'bg-white text-black hover:bg-neon-green hover:shadow-[0_0_30px_rgba(0,255,100,0.3)]'}
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <Zap size={16} className="animate-pulse" />
                                    <span className="text-xs tracking-widest">THINKING</span>
                                </>
                            ) : (
                                <>
                                    <ArrowUp size={18} strokeWidth={3} />
                                    <span className="text-sm font-black tracking-wide">CREATE</span>
                                    {selectedModel && <span className="text-[9px] opacity-60">{selectedModel.cost}¢</span>}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 4. History Grid (Infinite Canvas)
    const renderHistory = () => {
        const items = resultData ? [resultData, ...history] : history;
        // Filter based on activeTab, handling 'voice', 'music', 'sound_effects' mapping to 'audio' type in DB
        const filteredItems = activeTab === 'all'
            ? items
            : activeTab === 'voice' || activeTab === 'music' || activeTab === 'sound_effects'
                ? items.filter(item => item.type === 'audio' && item.subType === activeTab)
                : items.filter(item => item.type === activeTab);

        const formatDate = (timestamp) => {
            if (!timestamp) return '';
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        return (
            <div className="w-full h-full p-8 overflow-y-auto pb-[200px] custom-scrollbar">
                {filteredItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none select-none">
                        <h1 className="text-[15vw] font-black text-[#1a1a1a] leading-none">CREATE</h1>
                        <p className="font-mono text-neon-green tracking-[1em] text-sm">THE INFINITE CANVAS</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
                        {filteredItems.map((item, i) => (
                            <div
                                key={item.id || i}
                                onClick={() => setViewerItem(item)}
                                className="group relative break-inside-avoid rounded-xl overflow-hidden border border-white/10 bg-[#111] hover:border-emerald-500/50 transition-all cursor-pointer"
                            >
                                {/* Media Thumbnail */}
                                {item.type === 'video' && (
                                    <div className="relative aspect-video bg-black">
                                        <video src={item.url} muted className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center border border-white/20">
                                                <Play size={20} className="text-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-mono">
                                            0:{item.duration || '03'}
                                        </div>
                                    </div>
                                )}
                                {item.type === 'image' && (
                                    <div className="aspect-square bg-black">
                                        <img src={item.url} alt="Generated" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                {item.type === 'audio' && (
                                    <div className="aspect-video bg-gradient-to-br from-blue-900/30 to-purple-900/20 flex items-center justify-center relative">
                                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                            <Music size={28} className="text-blue-400" />
                                        </div>
                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-mono">
                                            {item.subType || 'audio'}
                                        </div>
                                    </div>
                                )}

                                {/* Card Footer */}
                                <div className="p-3 border-t border-white/5">
                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.prompt || 'Untitled'}</p>
                                    <div className="flex items-center justify-between mt-2 text-[10px] text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {formatDate(item.createdAt)}
                                        </span>
                                        <span>{item.cost || 1}¢</span>
                                    </div>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                    <button className="p-2 bg-white rounded-full hover:scale-110 transition-transform"><Play size={16} /></button>
                                    <button className="p-2 bg-[#222] text-white rounded-full hover:scale-110 transition-transform"><MoreHorizontal size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <StudioLayout
                topBar={renderTopBar()}
                bottomDeck={renderBottomDeck()}
                settingsDrawer={renderSettings()}
                isDrawerOpen={isDrawerOpen}
                onCloseDrawer={() => setIsDrawerOpen(false)}
            >
                {renderHistory()}
            </StudioLayout>
            {viewerItem && <MediaViewer item={viewerItem} onClose={() => setViewerItem(null)} />}
        </>
    );
};

export default StudioPage;

