import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

const StudioSettings = ({
    isDrawerOpen,
    onCloseDrawer,
    currentMode,
    params,
    updateParams,
    selectedModel,
    setSelectedModel,
    modeModels = []
}) => {
    // Local State for "Save to Apply" pattern
    // We initialize this from the global params whenever the drawer opens or mode changes
    const [localParams, setLocalParams] = useState({});

    // Sync local params with global params when drawer opens or currentMode changes
    useEffect(() => {
        if (isDrawerOpen) {
            setLocalParams(params[currentMode] || {});
        }
    }, [isDrawerOpen, currentMode, params]);

    const handleLocalParamChange = (key, value) => {
        setLocalParams(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        // Commit changes to global state
        updateParams(currentMode, localParams);
        onCloseDrawer();
    };

    const handleCancel = () => {
        // Reset local params to global state (optional, but good practice) and close
        setLocalParams(params[currentMode] || {});
        onCloseDrawer();
    };

    return (
        <div className="p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-white font-black tracking-widest text-lg">SETTINGS</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-neon-green transition-colors"
                    >
                        Save
                    </button>
                </div>
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

            {/* Dynamic Model Parameters */}
            {selectedModel?.parameters && (
                <div className="space-y-6 border-t border-white/10 pt-6">
                    {selectedModel.parameters.map(param => (
                        <div key={param.id}>
                            <label className="text-[10px] font-bold text-gray-500 tracking-widest mb-2 block uppercase">{param.label}</label>

                            {param.type === 'select' && (
                                <div className="grid grid-cols-3 gap-2">
                                    {param.options.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => handleLocalParamChange(param.id, opt)}
                                            className={`p-2 border rounded text-xs transition-colors
                                                ${(localParams[param.id] || param.default) === opt
                                                    ? 'border-white text-white bg-white/10'
                                                    : 'border-gray-800 text-gray-500 hover:border-gray-600'}`
                                            }
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {param.type === 'slider' && (
                                <div className="px-1">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>{param.min}</span>
                                        <span className="text-neon-green font-mono">{localParams[param.id] || param.default}</span>
                                        <span>{param.max}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={param.min}
                                        max={param.max}
                                        step={param.step}
                                        value={localParams[param.id] || param.default}
                                        onChange={e => handleLocalParamChange(param.id, parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-800 appearance-none rounded-lg accent-neon-green cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Fallback for Legacy Video Parameters (if not in model def) */}
            {currentMode === 'video' && !selectedModel?.parameters?.find(p => p.id === 'motion') && (
                <div className="space-y-6 mt-6 border-t border-white/10 pt-6">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 tracking-widest mb-2 block">MOTION BUCKET ({localParams.motion || 5})</label>
                        <input
                            type="range" min="1" max="10"
                            value={localParams.motion || 5}
                            onChange={e => handleLocalParamChange('motion', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-800 appearance-none rounded-lg accent-neon-green"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudioSettings;
