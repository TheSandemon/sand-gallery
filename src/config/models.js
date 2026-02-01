export const MODELS = {
    code: [
        { id: 'gemini-3-deep-think', name: 'Gemini 3 Deep Think', provider: 'google', available: false, cost: 2, tags: ['architecture', 'planning'] },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', modelId: 'anthropic/claude-3.5-sonnet', available: false, cost: 1, tags: ['coding', 'daily-driver'] },
        { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', provider: 'openrouter', modelId: 'deepseek/deepseek-coder-v2', available: false, cost: 0.5, tags: ['offline', 'coding'] },
        { id: 'starcoder-2', name: 'StarCoder 2', provider: 'openrouter', modelId: 'bigcode/starcoder2', available: false, cost: 1, tags: ['completion', 'niche-langs'] }
    ],
    image: [
        {
            id: 'gemini-3-pro-image-preview',
            name: 'Nano Banana Pro',
            provider: 'google',
            available: true,
            cost: 2,
            tags: ['next-gen', 'visionary', 'gemini-3-pro'],
            parameters: [
                {
                    id: 'aspectRatio',
                    label: 'Aspect Ratio',
                    type: 'select',
                    options: ['1:1', '16:9', '9:16', '3:2', '2:3'],
                    default: '1:1'
                },
                {
                    id: 'safetySettings',
                    label: 'Safety Filter',
                    type: 'select',
                    options: ['Standard', 'None (Creative)'],
                    default: 'Standard'
                }
            ]
        },
        {
            id: 'nano-banana',
            name: 'Nano Banana',
            provider: 'google',
            available: true,
            cost: 1,
            tags: ['fast', 'gemini-2.5-flash'],
            parameters: [
                {
                    id: 'aspectRatio',
                    label: 'Aspect Ratio',
                    type: 'select',
                    options: ['1:1', '16:9', '9:16', '3:2', '2:3'],
                    default: '1:1'
                },
                {
                    id: 'safetySettings',
                    label: 'Safety Filter',
                    type: 'select',
                    options: ['Standard', 'None (Creative)'],
                    default: 'Standard'
                }
            ]
        },
        { id: 'midjourney-v7', name: 'Midjourney v7', provider: 'replicate', version: 'midjourney/v7-turbo', available: false, cost: 2, tags: ['art', 'vibes'] },
        { id: 'flux-pro', name: 'Flux Pro / Dev', provider: 'replicate', version: 'black-forest-labs/flux-pro', available: false, cost: 1, tags: ['realistic', 'text'] },
        { id: 'reve', name: 'Reve', provider: 'replicate', version: 'reve/visual-adherence', available: false, cost: 1, tags: ['prompt-adherence'] },
        { id: 'qwen-image-edit', name: 'Qwen Image Edit', provider: 'replicate', version: 'qwen/edit-v2', available: false, cost: 1, tags: ['editing', 'inpainting'] }
    ],
    video: [
        { id: 'sora-2', name: 'Sora 2', provider: 'openrouter', modelId: 'openai/sora-2', available: false, cost: 15, tags: ['physics', 'simulation'] },
        { id: 'veo-3', name: 'Veo 3', provider: 'google', available: false, cost: 12, tags: ['cinematic', '1080p'] },
        { id: 'wan-2-2', name: 'Wan 2.2', provider: 'replicate', version: 'wan-video/v2.2', available: false, cost: 8, tags: ['motion', 'high-fidelity'] },
        { id: 'kling-hailuo', name: 'Kling & Hailuo', provider: 'replicate', version: 'kling/hailuo-fast', available: false, cost: 8, tags: ['speed', 'human-motion'] },
        { id: 'zeroscope', name: 'Zeroscope V2', provider: 'replicate', version: 'anotherjesse/zeroscope-v2-xl', available: false, cost: 10, tags: ['720p', 'default'] },
        { id: 'luma-dream-machine', name: 'Luma Dream Machine', provider: 'replicate', version: 'luma/dream-machine', available: false, cost: 10, tags: ['keyframing'] }
    ],
    voice: [
        { id: 'elevenlabs-v3', name: 'ElevenLabs v3', provider: 'replicate', version: 'elevenlabs/v3-speech', available: false, cost: 2, tags: ['speech', 'narration'] },
        { id: 'playht-2', name: 'PlayHT 2.0', provider: 'replicate', version: 'playht/turbo', available: false, cost: 2, tags: ['conversational', 'fast'] }
    ],
    music: [
        { id: 'suno-v4', name: 'Suno v4', provider: 'replicate', version: 'suno-ai/v4-radio', available: false, cost: 5, tags: ['songs', 'structure'] },
        { id: 'udio', name: 'Udio', provider: 'replicate', version: 'udio/producer-tools', available: false, cost: 5, tags: ['remix', 'stems'] },
        { id: 'gemini-audio-lyria', name: 'Gemini Audio / Lyria', provider: 'google', available: false, cost: 3, tags: ['instrumental', 'exp'] }
    ],
    sound_effects: [
        { id: 'audioldm-2', name: 'AudioLDM 2', provider: 'replicate', version: 'avo-world/audioldm-s-full-v2:tuw5z4i4rxj6c0cj4q4907q050', available: false, cost: 2, tags: ['foley', 'default'] },
        { id: 'stable-audio', name: 'Stable Audio', provider: 'replicate', version: 'stability-ai/stable-audio-2', available: false, cost: 2, tags: ['sfx', 'ambient'] }
    ],
    p3d: [
        { id: 'genie-3', name: 'Genie 3', provider: 'google', available: false, cost: 20, tags: ['world-model', 'interactive'] },
        { id: 'rodin-meshy', name: 'Rodin / Meshy', provider: 'replicate', version: 'rodin/meshy-v3', available: false, cost: 10, tags: ['image-to-3d', 'obj'] },
        { id: 'sam-3d', name: 'Sam 3D', provider: 'replicate', version: 'meta/sam-3d', available: false, cost: 5, tags: ['depth', 'shape'] }
    ]
};

