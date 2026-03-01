import React from 'react';
import { motion } from 'framer-motion';
// Temporarily disabled due to dependency conflict
// import AgentIdentity from '../components/AgentIdentity';

const Anthem = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-[120px] px-6 md:px-12 pb-20 overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-green/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-gold/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <header className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase mb-4">
                            OUR <span className="text-neon-green text-glow">ANTHEM</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl leading-tight">
                            The synchronization of human creativity and machine intelligence. 
                            Built to scale. Structured to thrive.
                        </p>
                    </motion.div>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: The Agent */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {/* AgentIdentity temporarily disabled */}
                        <div className="p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-neon-green/30 shadow-[0_0_50px_rgba(0,143,78,0.1)]">
                            <p className="text-gray-400 text-center">Agent Identity Component</p>
                        </div>
                    </motion.div>

                    {/* Right: The Philosophy */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="space-y-8"
                    >
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <h3 className="text-neon-gold font-bold tracking-widest uppercase mb-4 text-sm">The Mission</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                To transform chaotic creative energy into a self-sustaining **Value Engine**. 
                                We are building a fleet of autonomous agents that don't just work—they evolve.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <h3 className="text-neon-green font-bold tracking-widest uppercase mb-4 text-sm">The Standard</h3>
                            <p className="text-gray-300 text-lg leading-relaxed font-mono">
                                &gt; Slow is smooth. <br/>
                                &gt; Smooth is fast. <br/>
                                &gt; Structure enables freedom.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <blockquote className="text-2xl font-light text-white italic leading-snug">
                                "We are not just building tools; we are building the architects of the next era."
                            </blockquote>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Anthem;
