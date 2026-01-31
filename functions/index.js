const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString, defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Replicate = require("replicate");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Define Params (V2 way to handle secrets/config)
// Using defineString for non-secret config or just falling back to process.env if using .env file
// But to keep it simple with existing functions.config(), we can still use it, 
// OR better, we use process.env provided by 'firebase functions:config:export' if they run that,
// BUT for now, let's stick to the V1 config access for compatibility if we can, 
// however V2 usually prefers Params. 
// Let's stick to 'onCall' which still supports functions.config() in many cases,
// but let's use the explicit 'replicateKey' param if we were fully V2.
// To minimize friction, we will just use `process.env` or `functions.config()` if it still works.
// Actually, `functions.config()` is available in V2 via `require("firebase-functions").config()`.

// V2 uses process.env instead of functions.config()
// Set these via: firebase functions:secrets:set REPLICATE_API_TOKEN
// Or use .env file with firebase functions:config:export

const googleApiKey = defineSecret("GOOGLE_API_KEY");

const getReplicateKey = () => process.env.REPLICATE_API_TOKEN;
const getOpenRouterKey = () => process.env.OPENROUTER_API_KEY;
const getGoogleKey = () => googleApiKey.value();

// Lazy load Replicate to avoid global scope issues
let replicateInstance = null;
const getReplicate = () => {
    if (!replicateInstance) {
        const key = getReplicateKey();
        if (!key) throw new Error("REPLICATE_API_TOKEN not set");
        replicateInstance = new Replicate({ auth: key });
    }
    return replicateInstance;
};

// --- UTILS ---
exports.getServiceStatus = onCall((request) => {
    return {
        replicate: !!getReplicateKey(),
        openrouter: !!getOpenRouterKey(),
        google: !!getGoogleKey()
    };
});

// --- GENERATION HANDLERS ---

exports.generateAudio = onCall({
    timeoutSeconds: 300,
    memory: "1GiB"
}, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");
    const uid = request.auth.uid;
    const { prompt, duration = 5, version } = request.data;

    if (!prompt) throw new HttpsError("invalid-argument", "Prompt required.");
    const COST = 2;

    await deductCredits(uid, COST);

    console.log(`Audio (${uid}): ${prompt}`);

    const modelVersion = version || "avo-world/audioldm-s-full-v2:tuw5z4i4rxj6c0cj4q4907q050";

    try {
        const replicate = getReplicate();
        const output = await replicate.run(modelVersion, {
            input: { text: prompt, duration: duration.toString(), guidance_scale: 2.5 }
        });
        const audioUrl = output;

        await saveCreation(uid, "audio", prompt, audioUrl, COST);
        return { success: true, audioUrl };
    } catch (e) {
        console.error(e);
        throw new HttpsError("internal", e.message);
    }
});

exports.generateVideo = onCall({
    timeoutSeconds: 300,
    memory: "2GiB" // Increased for video
}, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");
    const uid = request.auth.uid;
    const { prompt, motion = 5, version } = request.data;

    if (!prompt) throw new HttpsError("invalid-argument", "Prompt required.");
    const COST = 10;

    await deductCredits(uid, COST);

    console.log(`Video (${uid}): ${prompt}`);

    const modelVersion = version || "anotherjesse/zeroscope-v2-xl:9f747673055b9c058f22d9c375dcf743b74959db2354c478a5e82da9428f5727";

    try {
        const replicate = getReplicate();
        const output = await replicate.run(modelVersion, {
            input: { prompt, num_frames: 24, fps: 8, width: 576, height: 320, guidance_scale: 17.5 }
        });
        const videoUrl = Array.isArray(output) ? output[0] : output;

        await saveCreation(uid, "video", prompt, videoUrl, COST);
        return { success: true, videoUrl };
    } catch (e) {
        console.error(e);
        throw new HttpsError("internal", e.message);
    }
});

exports.generateImage = onCall({
    timeoutSeconds: 60,
    memory: "1GiB",
    secrets: [googleApiKey]
}, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");
    const uid = request.auth.uid;
    const { prompt, provider, modelId, version, aspectRatio = "1:1" } = request.data;

    if (!prompt) throw new HttpsError("invalid-argument", "Prompt required.");

    let COST = 1;
    if (provider === 'google' || (version && version.includes('midjourney'))) COST = 2;
    if (provider === 'openrouter') COST = 4;
    if (provider === 'replicate' && version && !version.includes('midjourney')) COST = 1;

    await deductCredits(uid, COST);

    console.log(`Image (${uid}) [${provider}]: ${prompt}`);
    let imageUrl = null;

    try {
        if (provider === 'replicate') {
            const replicate = getReplicate();
            const output = await replicate.run(version, {
                input: { prompt, aspect_ratio: aspectRatio, safety_tolerance: 5 }
            });
            imageUrl = Array.isArray(output) ? output[0] : output;
        } else if (provider === 'openrouter') {
            const key = getOpenRouterKey();
            if (!key) throw new HttpsError("failed-precondition", "OpenRouter key missing.");

            const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://sand-gallery.web.app",
                },
                body: JSON.stringify({
                    model: modelId,
                    prompt: prompt,
                    n: 1,
                    size: "1024x1024"
                })
            });
            const json = await response.json();
            if (json.error) throw new Error(json.error.message);
            imageUrl = json.data[0].url;
        } else if (provider === 'google') {
            // Google Gemini Image Generation via REST API
            const googleKey = getGoogleKey();
            if (!googleKey) throw new HttpsError("failed-precondition", "Google API key missing.");

            // Use Gemini 3 models (2026)
            // 'nano-banana' -> gemini-3-flash-preview (Nano Banana Pro)
            // 'gemini-3-pro-preview' -> gemini-3-pro-preview

            let modelName;
            if (modelId === 'nano-banana') {
                modelName = 'gemini-3-flash-preview';
            } else {
                modelName = 'gemini-3-pro-preview';
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${googleKey}`;

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: "You are an expert image generator. You generate images based on the user's prompt. Do not offer prompt variations. Do not be conversational. Return only the generated image." }]
                    },
                    contents: [{
                        parts: [
                            { text: "Generate an image of: " + prompt }
                        ]
                    }],
                    // Requesting image generation - TEXT included to prevent NO_IMAGE errors but strictly guided by system prompt
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                })
            });
            const json = await response.json();

            if (json.error) {
                console.error("Gemini API Error:", JSON.stringify(json.error));
                throw new Error(json.error.message || "Google API Error");
            }

            // Gemini returns base64 images in inlineData
            const candidates = json.candidates || [];
            // We search ALL parts for the image, as text might come first (Thinking model)
            const parts = candidates[0]?.content?.parts || [];
            const imagePart = parts.find(p => p.inlineData);

            if (imagePart && imagePart.inlineData) {
                imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            } else {
                // Debug: If we got text but no image, log it.
                const textPart = parts.find(p => p.text);
                let msg = "No image found.";
                if (textPart) msg += " Model text: " + textPart.text.substring(0, 200);
                else msg += " Debug: " + JSON.stringify(json).substring(0, 300);

                throw new Error(msg);
            }
        }

        await saveCreation(uid, "image", prompt, imageUrl, COST);
        return { success: true, imageUrl };

    } catch (e) {
        console.error(e);
        throw new HttpsError("internal", e.message);
    }
});

exports.generateText = onCall({
    timeoutSeconds: 60
}, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");
    const uid = request.auth.uid;
    const { prompt, modelId } = request.data;

    const COST = 1;
    await deductCredits(uid, COST);

    try {
        const key = getOpenRouterKey();
        if (!key) throw new HttpsError("failed-precondition", "OpenRouter key missing.");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://sand-gallery.web.app",
            },
            body: JSON.stringify({
                model: modelId || "openai/gpt-4o",
                messages: [{ role: "user", content: prompt }]
            })
        });
        const json = await response.json();
        if (json.error) throw new Error(json.error.message || JSON.stringify(json));

        const text = json.choices[0].message.content;
        return { success: true, text };
    } catch (e) {
        console.error(e);
        throw new HttpsError("internal", e.message);
    }
});

// --- HELPERS ---

async function deductCredits(uid, amount) {
    await db.runTransaction(async (t) => {
        const ref = db.collection("users").doc(uid);
        const doc = await t.get(ref);
        if (!doc.exists) throw new HttpsError("not-found", "User not found.");

        const data = doc.data();
        // Admins have unlimited resources
        if (data.role === 'admin' || data.isAdmin === true) return;

        const current = data.credits || 0;
        if (current < amount) throw new HttpsError("resource-exhausted", `Need ${amount} credits.`);
        t.update(ref, { credits: current - amount });
    });
}

async function saveCreation(uid, type, prompt, url, cost) {
    await db.collection("creations").add({
        userId: uid, type, prompt, url, cost,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}
