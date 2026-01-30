import React from 'react';
import { useStudio } from '../context/StudioContext';
import { useAuth } from '../context/AuthContext';
import { Mic, Video, Image as ImageIcon, Music, Zap } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1.5rem 0.5rem',
            cursor: 'pointer',
            color: isActive ? 'var(--neon-green)' : 'var(--text-secondary)',
            borderLeft: isActive ? '3px solid var(--neon-green)' : '3px solid transparent',
            background: isActive ? 'rgba(0, 143, 78, 0.1)' : 'transparent',
            transition: 'all 0.2s ease'
        }}
    >
        <Icon size={24} />
        <span style={{ fontSize: '0.7rem', marginTop: '0.5rem', fontWeight: 'bold' }}>{label}</span>
    </div>
);

const StudioLayout = ({ children, controls, onGenerate }) => {
    const { currentMode, setCurrentMode, getCost } = useStudio();
    const { user } = useAuth();
    const cost = getCost();

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 300px', // Fixed Sidebar, Flexible Canvas, Fixed Controls
            height: 'calc(100vh - 80px)', // Subtract Navbar height approx
            marginTop: '80px', // Push below Navbar
            background: '#0a0a0a',
            overflow: 'hidden'
        }}>
            {/* 1. Left Sidebar (Navigation) */}
            <div style={{
                borderRight: '1px solid #333',
                background: '#050505',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
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
                <div style={{
                    padding: '1rem',
                    textAlign: 'center',
                    borderTop: '1px solid #222'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '3px solid var(--neon-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: 'var(--neon-gold)'
                    }}>
                        {user ? user.credits : 0}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '0.3rem' }}>CREDITS</div>
                </div>
            </div>

            {/* 2. Main Canvas */}
            <div style={{
                background: '#111',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {children}
            </div>

            {/* 3. Right Sidebar (Controls) */}
            <div style={{
                borderLeft: '1px solid #333',
                background: '#050505',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <h3 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        letterSpacing: '1px'
                    }}>
                        CONTROLS
                    </h3>
                    {controls}
                </div>

                {/* Generate Button Area */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #222' }}>
                    <button
                        onClick={onGenerate}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--neon-green)',
                            color: '#000',
                            fontWeight: '900',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'transform 0.1s'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Zap size={18} fill="black" />
                        GENERATE <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({cost} Credits)</span>
                    </button>
                    <div style={{ textAlign: 'center', color: '#444', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                        Est. Time: {currentMode === 'video' ? '30s' : '5s'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioLayout;
