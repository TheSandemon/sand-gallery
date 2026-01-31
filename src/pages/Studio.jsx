import React, { useState, useEffect } from 'react';
import { StudioProvider, useStudio } from '../context/StudioContext';
import StudioLayout from '../components/StudioLayout';
import { useAuth } from '../context/AuthContext';
import {
    Zap, Sparkles, Film, Music, FileText,
    Search, Sliders, ArrowUp, Clock, Grid,
    MoreHorizontal, Smartphone, Monitor, Settings
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

    // Auto-select model logic
    useEffect(() => {
        import('../config/models').then(({ MODELS }) => {
            const modeModels = MODELS[currentMode] || [];
            if (modeModels.length > 0 && !selectedModel) {
                setSelectedModel(modeModels[0]);
            }
        });
    }, [currentMode, serviceStatus]);

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
            const map = { audio: 'generateAudio', video: 'generateVideo', image: 'generateImage', text: 'generateText' };
            const fnName = map[currentMode];

            let payload = { ...params[currentMode] };

            // Inject Model Specifics
            if (currentMode === 'image') {
                payload.provider = selectedModel.provider;
                payload.modelId = selectedModel.modelId || selectedModel.id;
                payload.version = selectedModel.version;
            } else if (currentMode === 'text') {
                payload.modelId = selectedModel.modelId;
            } else {
                payload.version = selectedModel.version;
            }

            const generateFn = httpsCallable(functions, fnName);
            const res = await generateFn(payload);
            const data = res.data;

            if (data.success) {
                if (currentMode === 'audio') setResultData({ type: 'audio', url: data.audioUrl });
                if (currentMode === 'video') setResultData({ type: 'video', url: data.videoUrl });
                if (currentMode === 'image') setResultData({ type: 'image', url: data.imageUrl });
                if (currentMode === 'text') setResultData({ type: 'text', text: data.text });
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
    const renderTopBar = () => (
        <div className={`flex items-center gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300 ${isMobile ? 'scale-90 origin-top' : ''}`}>
            {['all', 'image', 'video', 'audio'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                        ${activeTab === tab ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}
                    `}
                >
                    {tab}
                </button>
            ))}
            {!isMobile && <div className="h-4 w-px bg-white/20 mx-2" />}
            {!isMobile && (
                <>
                    <button className="p-2 text-gray-400 hover:text-white"><Search size={14} /></button>
                    <button className="p-2 text-gray-400 hover:text-white"><Grid size={14} /></button>
                </>
            )}
        </div>
    );

    // 2. Settings Drawer Content
    const renderSettings = () => {
        const modeModels = MODELS[currentMode] || [];
        return (
            <div className="p-6 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-white font-black tracking-widest text-lg">SETTINGS</h2>
                    <button onClick={() => setIsDrawerOpen(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
                </div>

                {/* Model Selector */}
                <div className="mb-8">
                    <label className="text-[10px] font-bold text-neon-green tracking-widest mb-3 block">ACTIVE MODEL</label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {modeModels.map(m => (
                            <div
                                key={m.id}
                                onClick={() => setSelectedModel(m)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel?.id === m.id ? 'border-neon-green bg-neon-green/10' : 'border-gray-800 bg-[#111] hover:border-gray-600'}`}
                            >
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
            currentMode === 'audio' ? "Describe a sound..." :
                currentMode === 'video' ? "Describe a scene..." :
                    currentMode === 'image' ? "Imagine an image..." : "Ask me anything...";

        return (
            <div className={`pointer-events-auto bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex gap-3 shadow-2xl transition-shadow duration-500 w-full
                ${isGenerating ? 'shadow-[#00ff9d]/20 border-[#00ff9d]/30' : ''}
                ${isMobile ? 'flex-col min-h-[250px]' : 'h-[200px] flex-row items-stretch'}
            `}>

                {/* Zone A: Mode Switcher (Left Column) */}
                <div className={`flex flex-col gap-2 p-1 bg-black/50 rounded-xl border border-white/5 ${isMobile ? 'h-16 flex-row w-full justify-between' : 'w-16 h-full justify-center'}`}>
                    {[
                        { id: 'image', icon: Sparkles, color: 'text-amber-400' },
                        { id: 'video', icon: Film, color: 'text-red-400' },
                        { id: 'audio', icon: Music, color: 'text-blue-400' },
                        { id: 'text', icon: FileText, color: 'text-green-400' }
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => setCurrentMode(m.id)}
                            className={`rounded-lg transition-all flex items-center justify-center flex-1
                                ${currentMode === m.id ? 'bg-white/10 ' + m.color : 'text-gray-600 hover:text-gray-400'}
                            `}
                        >
                            <m.icon size={isMobile ? 20 : 24} />
                        </button>
                    ))}
                </div>

                {/* Zone B: Input Field (Center - Red Box Area) */}
                <div className="flex-1 bg-black/40 rounded-xl border border-white/5 relative flex flex-col overflow-hidden group">

                    {/* Blue Box: Video Start/End Frames (Top Right Overlay) */}
                    {currentMode === 'video' && (
                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                            {['Start Frame', 'End Frame'].map((label, i) => (
                                <div key={i} className="w-24 h-16 rounded-lg border border-dashed border-white/20 bg-black/50 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all">
                                    <div className="text-white/20 mb-1"><Film size={12} /></div>
                                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <textarea
                        value={params[currentMode]?.prompt || ''}
                        onChange={e => updateParams(currentMode, { prompt: e.target.value })}
                        placeholder={placeholder}
                        className="w-full h-full bg-transparent text-white p-6 text-lg outline-none resize-none font-medium placeholder-gray-700 leading-relaxed custom-scrollbar"
                    />

                    <div className="absolute bottom-2 left-4 px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500 pointer-events-none">
                        PROMPT
                    </div>
                </div>

                {/* Zone C: Control Stack (Right Column - Green Box Area) */}
                <div className={`flex flex-col gap-2 ${isMobile ? 'w-full h-auto' : 'w-[240px] h-full'}`}>

                    {/* Top: Model & Params Settings */}
                    <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-3 flex flex-col gap-3">
                        {/* 1. Model Selector */}
                        <div
                            onClick={() => setIsDrawerOpen(true)}
                            className="flex-1 bg-[#111] rounded-lg border border-white/10 p-3 cursor-pointer hover:border-neon-green/50 transition-all flex flex-col justify-center relative group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase">MODEL</span>
                                <Settings size={12} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-sm font-bold text-white truncate">{selectedModel?.name || 'Select Model'}</div>
                            <div className="text-[10px] text-neon-green mt-1">{selectedModel?.provider || 'AI'}</div>
                        </div>

                        {/* 2. Key Params (Context Sensitive) */}
                        <div className="flex gap-2 h-12">
                            {currentMode === 'image' && (
                                <>
                                    <button
                                        className="flex-1 bg-[#111] rounded-lg border border-white/10 flex items-center justify-center text-xs font-mono text-gray-400 hover:text-white hover:border-white/30"
                                        onClick={() => updateParams('image', { aspectRatio: '16:9' })}
                                    >
                                        16:9
                                    </button>
                                    <button
                                        className="flex-1 bg-[#111] rounded-lg border border-white/10 flex items-center justify-center text-xs font-mono text-gray-400 hover:text-white hover:border-white/30"
                                        onClick={() => updateParams('image', { aspectRatio: '1:1' })}
                                    >
                                        1:1
                                    </button>
                                </>
                            )}
                            {currentMode === 'video' && (
                                <div className="flex-1 bg-[#111] rounded-lg border border-white/10 flex items-center justify-center px-4">
                                    <span className="text-[10px] text-gray-500 mr-2">SEC</span>
                                    <span className="text-white font-mono text-xs">5s</span>
                                </div>
                            )}
                            {currentMode === 'text' && (
                                <div className="flex-1 flex items-center justify-center text-[10px] text-gray-600">
                                    DEFAULT PARAMS
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom: Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`h-[70px] rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95
                            ${isGenerating ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-neon-green hover:shadow-[0_0_30px_rgba(0,255,100,0.3)]'}
                        `}
                    >
                        {isGenerating ? (
                            <div className="flex items-center gap-2">
                                <Zap size={16} className="animate-pulse" />
                                <span className="text-xs tracking-widest">THINKING</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <ArrowUp size={20} strokeWidth={3} />
                                    <span className="text-base font-black tracking-wider">CREATE</span>
                                </div>
                                <span className="text-[9px] uppercase font-bold tracking-widest mt-0.5 opacity-60">
                                    {selectedModel?.cost || 1} CREDITS
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    // 4. History Grid (Infinite Canvas)
    const renderHistory = () => {
        const items = resultData ? [resultData, ...history] : history;
        const filteredItems = activeTab === 'all' ? items : items.filter(item => item.type === activeTab);

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
                            <div key={item.id || i} className="group relative break-inside-avoid mb-4 rounded-xl overflow-hidden border border-white/10 bg-[#111] hover:border-emerald-500/50 transition-all">
                                {/* Content */}
                                {item.type === 'video' && <video src={item.url} autoPlay muted loop className="w-full" />}
                                {item.type === 'image' && <img src={item.url} className="w-full" />}
                                {item.type === 'audio' && (
                                    <div className="p-8 flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-black aspect-video">
                                        <Music size={48} className="text-blue-400 opacity-50" />
                                    </div>
                                )}
                                {item.type === 'text' && (
                                    <div className="p-6 text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-[300px] overflow-hidden">
                                        {item.text}
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                    <button className="p-2 bg-white rounded-full hover:scale-110 transition-transform"><ArrowUp size={16} /></button>
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
        <StudioLayout
            topBar={renderTopBar()}
            bottomDeck={renderBottomDeck()}
            settingsDrawer={renderSettings()}
            isDrawerOpen={isDrawerOpen}
        >
            {renderHistory()}
        </StudioLayout>
    );
};

export default StudioPage;
