const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Replicate = require("replicate");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Initialize Replicate with API Key
const replicate = new Replicate({
    auth: functions.config().replicate?.key || "MOCK_KEY",
});

const getOpenRouterKey = () => functions.config().openrouter?.key;

// --- UTILS ---
exports.getServiceStatus = functions.https.onCall((data, context) => {
    return {
        replicate: !!functions.config().replicate?.key,
        openrouter: !!functions.config().openrouter?.key
    };
});

// --- GENERATION HANDLERS ---

exports.generateAudio = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
    const uid = context.auth.uid;
    // Allow version override
    const { prompt, duration = 5, version } = data;

    if (!prompt) throw new functions.https.HttpsError("invalid-argument", "Prompt required.");
    const COST = 2;

    await deductCredits(uid, COST);

    console.log(`Audio (${uid}): ${prompt}`);

    // Default to AudioLDM 2 if no version provided
    const modelVersion = version || "avo-world/audioldm-s-full-v2:tuw5z4i4rxj6c0cj4q4907q050";

    try {
        const output = await replicate.run(modelVersion, {
            input: { text: prompt, duration: duration.toString(), guidance_scale: 2.5 }
        });
        const audioUrl = output; // Replicate usually returns string or array

        await saveCreation(uid, "audio", prompt, audioUrl, COST);
        return { success: true, audioUrl };
    } catch (e) {
        console.error(e);
        throw new functions.https.HttpsError("internal", e.message);
    }
});

exports.generateVideo = functions.runWith({ timeoutSeconds: 300, memory: '1GB' }).https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
    const uid = context.auth.uid;
    const { prompt, motion = 5, version } = data;

    if (!prompt) throw new functions.https.HttpsError("invalid-argument", "Prompt required.");
    const COST = 10;

    await deductCredits(uid, COST);

    console.log(`Video (${uid}): ${prompt}`);

    // Default to Zeroscope
    const modelVersion = version || "anotherjesse/zeroscope-v2-xl:9f747673055b9c058f22d9c375dcf743b74959db2354c478a5e82da9428f5727";

    try {
        const output = await replicate.run(modelVersion, {
            input: { prompt, num_frames: 24, fps: 8, width: 576, height: 320, guidance_scale: 17.5 }
        });
        const videoUrl = Array.isArray(output) ? output[0] : output;

        await saveCreation(uid, "video", prompt, videoUrl, COST);
        return { success: true, videoUrl };
    } catch (e) {
        console.error(e);
        throw new functions.https.HttpsError("internal", e.message);
    }
});

exports.generateImage = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
    const uid = context.auth.uid;
    const { prompt, provider, modelId, version, aspectRatio = "1:1" } = data;

    if (!prompt) throw new functions.https.HttpsError("invalid-argument", "Prompt required.");
    const COST = provider === 'openrouter' ? 4 : 1;

    await deductCredits(uid, COST);

    console.log(`Image (${uid}) [${provider}]: ${prompt}`);
    let imageUrl = null;

    try {
        if (provider === 'replicate') {
            // Flux or SDXL
            const output = await replicate.run(version, {
                input: { prompt, aspect_ratio: aspectRatio, safety_tolerance: 5 } // Flux params
            });
            // Helper for flux result which is often ReadableStream or array
            imageUrl = Array.isArray(output) ? output[0] : output;
        } else if (provider === 'openrouter') {
            // DALL-E 3 via OpenRouter
            const key = getOpenRouterKey();
            if (!key) throw new functions.https.HttpsError("failed-precondition", "OpenRouter key missing.");

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
        }

        await saveCreation(uid, "image", prompt, imageUrl, COST);
        return { success: true, imageUrl };

    } catch (e) {
        console.error(e);
        throw new functions.https.HttpsError("internal", e.message);
    }
});

exports.generateText = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
    const uid = context.auth.uid;
    const { prompt, modelId } = data;

    const COST = 1;
    await deductCredits(uid, COST);

    try {
        const key = getOpenRouterKey();
        if (!key) throw new functions.https.HttpsError("failed-precondition", "OpenRouter key missing.");

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
        // Note: Maybe don't save every text chat to 'creations' unless user explicitly saves, 
        // but for now we follow the pattern.

        return { success: true, text };
    } catch (e) {
        console.error(e);
        throw new functions.https.HttpsError("internal", e.message);
    }
});

// --- HELPERS ---

async function deductCredits(uid, amount) {
    await db.runTransaction(async (t) => {
        const ref = db.collection("users").doc(uid);
        const doc = await t.get(ref);
        if (!doc.exists) throw new functions.https.HttpsError("not-found", "User not found.");
        const current = doc.data().credits || 0;
        if (current < amount) throw new functions.https.HttpsError("resource-exhausted", `Need ${amount} credits.`);
        t.update(ref, { credits: current - amount });
    });
}

async function saveCreation(uid, type, prompt, url, cost) {
    await db.collection("creations").add({
        userId: uid, type, prompt, url, cost,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}
