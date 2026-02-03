import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, Scissors, Zap, Award, Star, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";

const HolographicCard = ({ title, score, icon: Icon, color, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.6, type: "spring" }}
            className="relative group perspective-1000"
        >
            <div className={`
        relative overflow-hidden rounded-xl border border-white/10
        bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md
        p-6 flex flex-col items-center justify-center gap-4
        shadow-[0_0_15px_rgba(0,0,0,0.5)]
        hover:shadow-[0_0_25px_var(--neon-color)]
        transition-all duration-300
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

                {/* Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
            </div>
        </motion.div>
    );
};

const CRM = () => {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, analyzing, complete, error
    const [analysisResult, setAnalysisResult] = useState(null);
    const [latestAnalysis, setLatestAnalysis] = useState(null);

    const auth = getAuth();
    const fileInputRef = useRef(null);

    // Load latest analysis on mount
    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, "users", auth.currentUser.uid, "video_analyses"),
            orderBy("timestamp", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestAnalysis(snapshot.docs[0].data());
            }
        });

        return () => unsubscribe();
    }, [auth.currentUser]);


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
        if (!file || !auth.currentUser) return;

        setUploadStatus('uploading');
        setUploadProgress(0);

        const storage = getStorage();
        const timestamp = Date.now();
        const storagePath = `user_uploads/${auth.currentUser.uid}/${timestamp}_${file.name}`;
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
                    // Increase timeout for long Gemini 1.5/3.0 processing
                    // Note: Client-side timeout config might need to be set in initialization if default 60s is too short
                    const analyzeVideo = httpsCallable(functions, 'analyzeVideo', { timeout: 300000 });

                    const result = await analyzeVideo({ storagePath });
                    setAnalysisResult(result.data);
                    setUploadStatus('complete');
                } catch (error) {
                    console.error("Analysis Error:", error);
                    setUploadStatus('error');
                }
            }
        );
    };

    // Use either the just-completed result or the latest from DB
    const displayData = analysisResult || latestAnalysis;

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] pt-[120px] pb-24 px-4 sm:px-6 lg:px-8 text-white font-sans overflow-hidden">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--neon-green)] opacity-[0.03] blur-[128px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--neon-gold)] opacity-[0.03] blur-[128px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        AI <span className="text-[var(--neon-gold)]">CRITIC</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Upload your cut. Get a brutal, professional analysis from Gemini 3.0 Pro.
                        Improve your Edit, FX, and Storytelling.
                    </p>
                </div>

                {/* Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-stretch">
                    {/* Dropzone */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full"
                    >
                        <div
                            className={`
                        flex-1 border-2 border-dashed rounded-2xl transition-all duration-300
                        flex flex-col items-center justify-center p-12 text-center cursor-pointer
                        bg-white/5 backdrop-blur-sm group
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

                            <div className="w-20 h-20 mb-6 rounded-full bg-[var(--bg-dark)] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-xl">
                                {file ? <Film className="text-[var(--neon-gold)]" size={32} /> : <Upload className="text-gray-400" size={32} />}
                            </div>

                            {file ? (
                                <div>
                                    <p className="text-xl font-bold text-white mb-2">{file.name}</p>
                                    <p className="text-sm text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="mt-4 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xl font-bold text-white mb-2">Drag & Drop Video</p>
                                    <p className="text-sm text-gray-400">or click to browse</p>
                                    <p className="text-xs text-gray-600 mt-4 uppercase tracking-widest">Supports MP4, MOV, WEBM</p>
                                </div>
                            )}
                        </div>

                        {/* Status Bar */}
                        {file && (
                            <div className="mt-6">
                                {uploadStatus === 'idle' && (
                                    <button
                                        onClick={startAnalysis}
                                        className="w-full py-4 bg-[var(--neon-green)] text-black font-black text-lg uppercase tracking-widest rounded-xl hover:bg-[#00b060] transition-colors shadow-[0_0_20px_rgba(0,143,78,0.4)] hover:shadow-[0_0_30px_rgba(0,143,78,0.6)] active:scale-[0.98]"
                                    >
                                        Judge My Cut
                                    </button>
                                )}

                                {uploadStatus === 'uploading' && (
                                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                        <div className="flex justify-between text-sm mb-2 text-gray-400">
                                            <span>Uploading to Secure Storage...</span>
                                            <span>{Math.round(uploadProgress)}%</span>
                                        </div>
                                        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-[var(--neon-green)]"
                                                style={{ width: `${uploadProgress}%` }}
                                                animate={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {uploadStatus === 'analyzing' && (
                                    <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex items-center justify-center gap-4 animate-pulse">
                                        <Activity className="text-[var(--neon-gold)] animate-spin" />
                                        <span className="text-[var(--neon-gold)] font-bold tracking-widest">GEMINI 3.0 PRO IS ANALYZING...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Holographic Dashboard */}
                    <div className="flex flex-col gap-6">
                        {!displayData ? (
                            <div className="h-full rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-gray-500 p-12">
                                <Activity className="mb-4 opacity-20" size={48} />
                                <p>No analysis data yet.</p>
                                <p className="text-sm opacity-50">Upload a video to see your skills.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <HolographicCard
                                        title="Editing"
                                        score={displayData.scores?.editing || 0}
                                        icon={Scissors}
                                        color="#3b82f6" // Blue
                                        delay={0}
                                    />
                                    <HolographicCard
                                        title="Effects"
                                        score={displayData.scores?.fx || 0}
                                        icon={Zap}
                                        color="#a855f7" // Purple
                                        delay={1}
                                    />
                                    <HolographicCard
                                        title="Pacing"
                                        score={displayData.scores?.pacing || 0}
                                        icon={Activity}
                                        color="#ef4444" // Red
                                        delay={2}
                                    />
                                    <HolographicCard
                                        title="Story"
                                        score={displayData.scores?.storytelling || 0}
                                        icon={Film}
                                        color="#f97316" // Orange
                                        delay={3}
                                    />
                                    <HolographicCard
                                        title="Quality"
                                        score={displayData.scores?.quality || 0}
                                        icon={Star}
                                        color="#008f4e" // Green (Neon)
                                        delay={4}
                                    />
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <div className="text-xs text-center text-gray-500 uppercase tracking-widest mb-2">Overall Grade</div>
                                        <div className="text-5xl font-black text-white">
                                            {Math.round((
                                                (displayData.scores?.editing || 0) +
                                                (displayData.scores?.fx || 0) +
                                                (displayData.scores?.pacing || 0) +
                                                (displayData.scores?.storytelling || 0) +
                                                (displayData.scores?.quality || 0)
                                            ) / 5)}
                                        </div>
                                    </div>
                                </div>

                                {/* Critical Feedback Stream */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden relative"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--neon-gold)]" />
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Award className="text-[var(--neon-gold)]" size={20} />
                                        CRITICAL ANALYSIS
                                    </h3>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {displayData.critique && Object.entries(displayData.critique).map(([key, value]) => (
                                            <div key={key} className="p-4 rounded-lg bg-white/5 border border-white/5">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">
                                                    {key.replace('_', ' ')}
                                                </h4>
                                                <p className="text-sm text-gray-200 leading-relaxed font-light">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}

                                        {displayData.reasoning_trace && (
                                            <div className="mt-6 pt-6 border-t border-white/10">
                                                <h4 className="text-xs font-bold text-[var(--neon-green)] uppercase mb-2">AI Reasoning Trace</h4>
                                                <p className="text-xs text-gray-500 font-mono leading-relaxed">
                                                    {displayData.reasoning_trace}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRM;
