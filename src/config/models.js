export const MODELS = {
    audio: [
        { id: 'audioldm-2', name: 'AudioLDM 2', provider: 'replicate', cost: 2, version: "avo-world/audioldm-s-full-v2:tuw5z4i4rxj6c0cj4q4907q050" },
        { id: 'musicgen', name: 'MusicGen (Meta)', provider: 'replicate', cost: 4, version: "meta/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906" }
    ],
    video: [
        { id: 'zeroscope', name: 'Zeroscope v2', provider: 'replicate', cost: 10, version: "anotherjesse/zeroscope-v2-xl:9f747673055b9c058f22d9c375dcf743b74959db2354c478a5e82da9428f5727" },
        { id: 'svd', name: 'Stable Video Diffusion', provider: 'replicate', cost: 12, version: "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816f3af3d23eff23b7933eed403137dd25492" }
    ],
    image: [
        { id: 'flux-pro', name: 'Flux Pro (Blackwell)', provider: 'replicate', cost: 1, version: "black-forest-labs/flux-pro" }, // Flux Pro is often an API endpoint not a version hash on Replicate
        { id: 'sdxl', name: 'SDXL 1.0', provider: 'replicate', cost: 1, version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b71595725206630" },
        { id: 'dall-e-3', name: 'DALL-E 3', provider: 'openrouter', cost: 4, modelId: "openai/dall-e-3" }
    ],
    text: [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openrouter', cost: 1, modelId: "openai/gpt-4o" },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', cost: 1, modelId: "anthropic/claude-3.5-sonnet" },
        { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'openrouter', cost: 0.5, modelId: "meta-llama/llama-3-70b-instruct" },
        { id: 'gemini-pro', name: 'Gemini Pro 1.5', provider: 'openrouter', cost: 0.5, modelId: "google/gemini-pro-1.5" }
    ]
};
