import React from 'react';
import { 
    Identity, 
    Avatar, 
    Name, 
    Address, 
    Badge 
} from '@coinbase/onchainkit/identity';

const AgentIdentity = ({ address, name, description, hireLink, memoryLink, cmsStyles = {} }) => {
    return (
        <div 
            className="p-8 rounded-3xl bg-black/60 backdrop-blur-2xl border border-neon-green/30 shadow-[0_0_50px_rgba(0,143,78,0.1)] transition-all duration-500 hover:border-neon-green/60 group h-full flex items-center justify-center"
            style={cmsStyles}
        >
            <Identity address={address} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-neon-green/20 rounded-full blur-2xl group-hover:bg-neon-green/30 transition-all duration-500" />
                    <Avatar className="w-28 h-28 border-2 border-neon-green/50 relative z-10" />
                </div>
                
                <Name className="text-3xl font-black tracking-tighter text-white mb-1 uppercase" />
                <Badge className="mb-4 bg-neon-green/10 text-neon-green border-neon-green/20" />
                
                <div className="py-1 px-3 rounded-full bg-neon-gold/10 border border-neon-gold/20 mb-6">
                    <Address className="text-neon-gold text-xs font-mono tracking-widest uppercase" />
                </div>
                
                <p className="text-gray-400 text-lg leading-tight max-w-xl mx-auto mb-8 font-medium italic">
                    "{description}"
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center w-full max-w-md">
                    <a 
                        href={hireLink || "#"} 
                        className="flex-1 min-w-[140px] px-8 py-3 bg-neon-green text-black font-black rounded-xl hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] active:scale-95 transition-all duration-300 uppercase tracking-tighter text-sm"
                    >
                        Hire the Agent
                    </a>
                    <a 
                        href={memoryLink || "#"} 
                        className="flex-1 min-w-[140px] px-8 py-3 border border-neon-green/30 text-neon-green font-black rounded-xl hover:bg-neon-green/10 hover:border-neon-green active:scale-95 transition-all duration-300 uppercase tracking-tighter text-sm"
                    >
                        View Memory
                    </a>
                </div>
            </Identity>
        </div>
    );
};

export default AgentIdentity;
