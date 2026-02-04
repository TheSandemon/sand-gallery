import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, Scissors, Zap, Award, Star, Activity } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, storage } from '../firebase';
import { onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";

const HolographicCard = ({ title, score, icon: Icon, color, delay, critique }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.6, type: "spring" }}
            className="relative group perspective-1000 z-10"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className={`
        relative overflow-hidden rounded-xl border border-white/10
        bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md
        p-6 flex flex-col items-center justify-center gap-4
        shadow-[0_0_15px_rgba(0,0,0,0.5)]
        hover:shadow-[0_0_25px_var(--neon-color)]
        transition-all duration-300 cursor-pointer
      `}
                style={{ '--neon-color': color }}
            >
                {/* Holographic Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-shine" />

                <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:border-[var(--neon-color)] transition-colors">
                    <Icon size={32} style={{ color: color }} />
                </div>

                <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">{title}</h3>
                    <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_var(--neon-color)]">
                        <span style={{ color: color }}>{score}</span>
                        <span className="text-lg text-gray-600 ml-1">/100</span>
                    </div>
                </div>

                {/* Expandable Critique Section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        // Stop propagation so clicking text doesn't toggle immediately if we want selectable text
                        // But usually desirable to toggle on card click. Let's keep card toggle for simplicity unless user selects text.
                        >
                            <div className="pt-4 border-t border-white/10 text-xs text-gray-300 leading-relaxed font-light text-left">
                                <p>{critique || "No specific feedback provided."}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chevron/Indicator */}
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="absolute top-4 right-4 text-white/20 group-hover:text-white/50"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </motion.div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
            </div>
        </motion.div>
    );
};

const VideoAnalysis = ({ userId }) => {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, analyzing, complete, error
    const [analysisResult, setAnalysisResult] = useState(null);
    const [latestAnalysis, setLatestAnalysis] = useState(null);

    // New State for Parameters
    const [harshness, setHarshness] = useState('Normal');
    const [perspective, setPerspective] = useState('Overall');

    const fileInputRef = useRef(null);

    // Load latest analysis on mount
    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, "users", userId, "video_analyses"),
            orderBy("timestamp", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestAnalysis(snapshot.docs[0].data());
            }
        });

        return () => unsubscribe();
    }, [userId]);


    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.startsWith('video/')) {
            setFile(file);
            setUploadStatus('idle');
            setAnalysisResult(null);
        } else {
            alert("Please upload a valid video file.");
        }
    };

    const startAnalysis = async () => {
        if (!file || !userId) return;

        setUploadStatus('uploading');
        setUploadProgress(0);

        const timestamp = Date.now();
        const storagePath = `user_uploads/${userId}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload Error:", error);
                setUploadStatus('error');
            },
            async () => {
                setUploadStatus('analyzing');

                try {
                    const functions = getFunctions();
                    const analyzeVideo = httpsCallable(functions, 'analyzeVideo', { timeout: 300000 });

                    const result = await analyzeVideo({
                        storagePath,
                        harshness,
                        perspective
                    });

                    // FIX: Nested data check. Callable returns { data: { success: true, data: { ... } } } usually, 
                    // or just { data: { ... } }. My cloud function returns { success: true, data: ... }.
                    // trace: result.data -> { success: true, data: { analysisId... } }
                    // So we need result.data.data
                    if (result.data && result.data.data) {
                        setAnalysisResult(result.data.data);
                    } else if (result.data) {
                        // Fallback in case I changed structure
                        setAnalysisResult(result.data);
                    }

                    setUploadStatus('complete');
                } catch (error) {
                    console.error("Analysis Error:", error);
                    setUploadStatus('error');
                }
            }
        );
    };

    // Use either the just-completed result, OR if not available, show empty. 
    // ONLY show latestAnalysis if explicitly desired? User said "If no video is currently loaded, the scores should be '-'".
    // This implies we default to empty.
    const displayData = analysisResult || {};
    // Removed automatic fallback to 'latestAnalysis' to prevent showing old data on fresh load.

    return (
        <div className="w-full">
            {/* Header / Title Section */}
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-black mb-2 tracking-tighter text-white">
                    AI <span className="text-[var(--neon-gold)]">CRITIC</span>
                </h2>
                <p className="text-sm text-gray-400">
                    Upload a cut for Gemini 3.0 Pro analysis.
                </p>
            </div>

            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 items-stretch">
                {/* Dropzone */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col h-full"
                >
                    <div
                        className={`
                        flex-1 border-2 border-dashed rounded-2xl transition-all duration-300
                        flex flex-col items-center justify-center p-8 text-center cursor-pointer
                        bg-white/5 backdrop-blur-sm group min-h-[300px]
                        ${dragActive ? 'border-[var(--neon-green)] bg-[var(--neon-green)]/5' : 'border-white/10 hover:border-white/30'}
                    `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={handleChange}
                        />

                        <div className="w-16 h-16 mb-4 rounded-full bg-[var(--bg-dark)] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-xl">
                            {file ? <Film className="text-[var(--neon-gold)]" size={24} /> : <Upload className="text-gray-400" size={24} />}
                        </div>

                        {file ? (
                            <div>
                                <p className="text-lg font-bold text-white mb-1">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="mt-4 px-3 py-1 text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-lg font-bold text-white mb-2">Drag & Drop Video</p>
                                <p className="text-xs text-gray-400">or click to browse</p>
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    {file && (
                        <div className="mt-4">
                            {uploadStatus === 'idle' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Harshness Dropdown */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Harshness</label>
                                            <select
                                                value={harshness}
                                                onChange={(e) => setHarshness(e.target.value)}
                                                className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[var(--neon-green)] transition-colors"
                                            >
                                                <option value="Nice">Nice</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Harsh">Harsh</option>
                                                <option value="Roast">Roast</option>
                                            </select>
                                        </div>

                                        {/* Perspective Dropdown */}
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Perspective</label>
                                            <select
                                                value={perspective}
                                                onChange={(e) => setPerspective(e.target.value)}
                                                className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[var(--neon-green)] transition-colors"
                                            >
                                                <option value="Overall">Overall</option>
                                                <option value="Advertising">Advertising</option>
                                                <option value="AI">AI</option>
                                                <option value="Cinematic">Cinematic</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={startAnalysis}
                                        className="w-full py-3 bg-[var(--neon-green)] text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-[#00b060] transition-colors shadow-[0_0_20px_rgba(0,143,78,0.4)] hover:shadow-[0_0_30px_rgba(0,143,78,0.6)] active:scale-[0.98]"
                                    >
                                        Judge My Cut
                                    </button>
                                </div>
                            )}

                            {uploadStatus === 'uploading' && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between text-xs mb-1 text-gray-400">
                                        <span>Uploading...</span>
                                        <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-[var(--neon-green)]"
                                            style={{ width: `${uploadProgress}%` }}
                                            animate={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {uploadStatus === 'analyzing' && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-center gap-3 animate-pulse">
                                    <Activity className="text-[var(--neon-gold)] animate-spin" size={20} />
                                    <span className="text-[var(--neon-gold)] text-xs font-bold tracking-widest">ANALYZING...</span>
                                </div>
                            )}

                            {uploadStatus === 'error' && (
                                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 text-center">
                                    <p className="text-red-400 text-xs font-bold mb-2">UPLOAD FAILED</p>
                                    <p className="text-gray-400 text-[10px] mb-3">
                                        Check console for details. Common issues: Storage Rules, CORS, or File Size.
                                    </p>
                                    <button
                                        onClick={() => setUploadStatus('idle')}
                                        className="text-[10px] bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded transition-colors"
                                    >
                                        TRY AGAIN
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Holographic Dashboard */}
                <div className="flex flex-col gap-4">
                    {!displayData.scores ? (
                        <div className="h-full rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-gray-500 p-8 min-h-[400px]">
                            <Activity className="mb-4 opacity-20" size={32} />
                            <p className="text-sm">Ready to Judge.</p>
                            <p className="text-xs text-gray-600 mt-2">Upload a video to begin analysis.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                                <HolographicCard
                                    title="Editing"
                                    score={displayData.scores?.editing}
                                    critique={displayData.critique?.editing_notes}
                                    criteria="Cuts, Transitions, Flow, Continuity"
                                    icon={Scissors}
                                    color="#3b82f6" // Blue
                                    delay={0}
                                />
                                <HolographicCard
                                    title="Effects"
                                    score={displayData.scores?.fx}
                                    critique={displayData.critique?.fx_notes}
                                    criteria="VFX integration, Color Grading, Sound Design"
                                    icon={Zap}
                                    color="#a855f7" // Purple
                                    delay={1}
                                />
                                <HolographicCard
                                    title="Pacing"
                                    score={displayData.scores?.pacing}
                                    critique={displayData.critique?.pacing_notes}
                                    criteria="Rhythm, Speed, Engagement retention"
                                    icon={Activity}
                                    color="#ef4444" // Red
                                    delay={2}
                                />
                                <HolographicCard
                                    title="Story"
                                    score={displayData.scores?.storytelling}
                                    critique={displayData.critique?.storytelling_notes}
                                    criteria="Narrative Arc, Emotional Hook, Clarity"
                                    icon={Film}
                                    color="#f97316" // Orange
                                    delay={3}
                                />
                                <HolographicCard
                                    title="Quality"
                                    score={displayData.scores?.quality}
                                    critique={displayData.critique?.quality_notes}
                                    criteria="Resolution, Compression, Lighting, Audio Clarity"
                                    icon={Star}
                                    color="#008f4e" // Green (Neon)
                                    delay={4}
                                />
                                <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-xl border border-white/10 min-h-[200px] z-0">
                                    <div className="text-[10px] text-center text-gray-500 uppercase tracking-widest mb-1">Overall Grade</div>
                                    <div className="text-5xl font-black text-white mb-2">
                                        {displayData.scores ? Math.round((
                                            (displayData.scores?.editing || 0) +
                                            (displayData.scores?.fx || 0) +
                                            (displayData.scores?.pacing || 0) +
                                            (displayData.scores?.storytelling || 0) +
                                            (displayData.scores?.quality || 0)
                                        ) / 5) : '-'}
                                    </div>
                                    <div className="text-xs text-center text-gray-400">Average Score</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        </div >
    );
};

export default VideoAnalysis;
