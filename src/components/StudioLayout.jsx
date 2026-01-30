import React from 'react';
import { useStudio } from '../context/StudioContext';
import { useAuth } from '../context/AuthContext';
import { Mic, Video, Image as ImageIcon, Music, Zap } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center py-6 px-2 cursor-pointer transition-all duration-200 
            ${isActive
                ? 'text-neon-green border-l-4 border-neon-green bg-gradient-to-r from-neon-green/10 to-transparent'
                : 'text-text-secondary border-l-4 border-transparent hover:text-white'
            }`}
    >
        <Icon size={24} />
        <span className="text-[0.65rem] mt-2 font-bold tracking-wider">{label}</span>
    </div>
);

const StudioLayout = ({ children, controls, onGenerate }) => {
    const { currentMode, setCurrentMode, getCost } = useStudio();
    const { user } = useAuth();
    const cost = getCost();

    return (
        <div className="grid grid-cols-[80px_1fr_300px] h-[calc(100vh-80px)] mt-[80px] bg-bg-dark overflow-hidden">
            {/* 1. Left Sidebar (Navigation) */}
            <div className="border-r border-gray-800 bg-[#050505] flex flex-col justify-between">
                <div>
                    <SidebarItem
                        icon={Mic}
                        label="AUDIO"
                        isActive={currentMode === 'audio'}
                        onClick={() => setCurrentMode('audio')}
                    />
                    <SidebarItem
                        icon={Video}
                        label="VIDEO"
                        isActive={currentMode === 'video'}
                        onClick={() => setCurrentMode('video')}
                    />
                    <SidebarItem
                        icon={ImageIcon}
                        label="IMAGE"
                        isActive={currentMode === 'image'}
                        onClick={() => setCurrentMode('image')}
                    />
                </div>

                {/* Credit Display */}
                <div className="p-4 text-center border-t border-gray-800 bg-black/40">
                    <div className="w-10 h-10 rounded-full border-2 border-neon-gold flex items-center justify-center mx-auto text-sm font-bold text-neon-gold mb-1">
                        {user ? user.credits : 0}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold tracking-widest">CREDITS</div>
                </div>
            </div>

            {/* 2. Main Canvas */}
            <div className="bg-[#111] relative overflow-hidden flex flex-col items-center justify-center">
                {children}
            </div>

            {/* 3. Right Sidebar (Controls) */}
            <div className="border-l border-gray-800 bg-[#050505] p-6 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="m-0 mb-6 text-sm text-text-secondary tracking-widest font-bold opacity-60">
                        CONTROLS
                    </h3>
                    {controls}
                </div>

                {/* Generate Button Area */}
                <div className="mt-auto pt-4 border-t border-gray-800">
                    <button
                        onClick={onGenerate}
                        className="w-full py-4 bg-neon-green text-black font-black text-base rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,143,78,0.3)]"
                    >
                        <Zap size={18} fill="black" />
                        GENERATE <span className="text-xs opacity-70">({cost} Credits)</span>
                    </button>
                    <div className="text-center text-gray-600 text-xs mt-2 font-mono">
                        Est. Time: {currentMode === 'video' ? '30s' : '5s'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioLayout;
