export const MODELS = {
    code: [
        { id: 'gemini-3-deep-think', name: 'Gemini 3 Deep Think', provider: 'google', cost: 2, tags: ['architecture', 'planning'] },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', modelId: 'anthropic/claude-3.5-sonnet', cost: 1, tags: ['coding', 'daily-driver'] },
        { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'openrouter', modelId: 'deepseek/deepseek-coder-v2', cost: 0.5, tags: ['offline', 'coding'] },
        { id: 'starcoder-2', name: 'StarCoder 2', provider: 'openrouter', modelId: 'bigcode/starcoder2', cost: 1, tags: ['completion', 'niche-langs'] }
    ],
    image: [
        { id: 'nano-banana', name: 'Nano Banana (Gemini 2.5 Flash)', provider: 'google', cost: 1, tags: ['consistency', 'fast'] },
        { id: 'midjourney-v7', name: 'Midjourney v7', provider: 'replicate', version: 'midjourney/v7-turbo', cost: 2, tags: ['art', 'vibes'] },
        { id: 'flux-pro', name: 'Flux Pro / Dev', provider: 'replicate', version: 'black-forest-labs/flux-pro', cost: 1, tags: ['realistic', 'text'] },
        { id: 'reve', name: 'Reve', provider: 'replicate', version: 'reve/visual-adherence', cost: 1, tags: ['prompt-adherence'] },
        { id: 'qwen-image-edit', name: 'Qwen Image Edit', provider: 'replicate', version: 'qwen/edit-v2', cost: 1, tags: ['editing', 'inpainting'] }
    ],
    video: [
        { id: 'sora-2', name: 'Sora 2', provider: 'openrouter', modelId: 'openai/sora-2', cost: 15, tags: ['physics', 'simulation'] },
        { id: 'veo-3', name: 'Veo 3', provider: 'google', cost: 12, tags: ['cinematic', '1080p'] },
        { id: 'wan-2-2', name: 'Wan 2.2', provider: 'replicate', version: 'wan-video/v2.2', cost: 8, tags: ['motion', 'high-fidelity'] },
        { id: 'kling-hailuo', name: 'Kling & Hailuo', provider: 'replicate', version: 'kling/hailuo-fast', cost: 8, tags: ['speed', 'human-motion'] },
        { id: 'luma-dream-machine', name: 'Luma Dream Machine', provider: 'replicate', version: 'luma/dream-machine', cost: 10, tags: ['keyframing'] }
    ],
    voice: [
        { id: 'elevenlabs-v3', name: 'ElevenLabs v3', provider: 'replicate', version: 'elevenlabs/v3-speech', cost: 2, tags: ['speech', 'narration'] },
        { id: 'playht-2', name: 'PlayHT 2.0', provider: 'replicate', version: 'playht/turbo', cost: 2, tags: ['conversational', 'fast'] }
    ],
    music: [
        { id: 'suno-v4', name: 'Suno v4', provider: 'replicate', version: 'suno-ai/v4-radio', cost: 5, tags: ['songs', 'structure'] },
        { id: 'udio', name: 'Udio', provider: 'replicate', version: 'udio/producer-tools', cost: 5, tags: ['remix', 'stems'] },
        { id: 'gemini-audio-lyria', name: 'Gemini Audio / Lyria', provider: 'google', cost: 3, tags: ['instrumental', 'exp'] }
    ],
    sound_effects: [
        { id: 'stable-audio', name: 'Stable Audio', provider: 'replicate', version: 'stability-ai/stable-audio-2', cost: 2, tags: ['sfx', 'ambient'] },
        { id: 'audioldm-2', name: 'AudioLDM 2', provider: 'replicate', version: 'audioldm/v2', cost: 2, tags: ['foley', 'textures'] }
    ],
    p3d: [
        { id: 'genie-3', name: 'Genie 3', provider: 'google', cost: 20, tags: ['world-model', 'interactive'] },
        { id: 'rodin-meshy', name: 'Rodin / Meshy', provider: 'replicate', version: 'rodin/meshy-v3', cost: 10, tags: ['image-to-3d', 'obj'] },
        { id: 'sam-3d', name: 'Sam 3D', provider: 'replicate', version: 'meta/sam-3d', cost: 5, tags: ['depth', 'shape'] }
    ]
};
