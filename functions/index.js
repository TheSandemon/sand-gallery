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
const googleApiKeyNt = defineSecret("GOOGLE_API_KEY_NT"); // For Nano Banana models
const replicateApiToken = defineSecret("REPLICATE_API_TOKEN");
const openRouterApiKey = defineSecret("OPENROUTER_API_KEY");

const getReplicateKey = () => replicateApiToken.value();
const getOpenRouterKey = () => openRouterApiKey.value();
const getGoogleKey = () => googleApiKey.value();
const getGoogleKeyNt = () => googleApiKeyNt.value();

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
exports.getServiceStatus = onCall({
    secrets: [replicateApiToken, openRouterApiKey, googleApiKey, googleApiKeyNt]
}, (request) => {
    return {
        replicate: !!getReplicateKey(),
        openrouter: !!getOpenRouterKey(),
        google: !!getGoogleKey(),
        googleNt: !!getGoogleKeyNt()
    };
});

// --- GENERATION HANDLERS ---
// ... (Audio and Video handlers remain same)

exports.generateImage = onCall({
    timeoutSeconds: 60,
    memory: "1GiB",
    secrets: [googleApiKey, googleApiKeyNt, replicateApiToken, openRouterApiKey]
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
            // ... (OpenRouter logic)
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

            // --- MODEL MAPPING DOCUMENTATION ---
            // "Nano Banana Pro" -> Model ID: 'gemini-3-pro-image-preview'
            // "Nano Banana"    -> Model ID: 'gemini-2.5-flash-image'
            // Both use the GOOGLE_API_KEY_NT secret.
            // -----------------------------------

            let modelName;
            let activeGoogleKey = getGoogleKey(); // Default to standard key for other Google models

            if (modelId === 'nano-banana') {
                // User specification: Nano Banana = gemini-2.5-flash-image
                modelName = 'gemini-2.5-flash-image';
                activeGoogleKey = getGoogleKeyNt();
            } else if (modelId === 'gemini-3-pro-image-preview') {
                // User specification: Nano Banana Pro = gemini-3-pro-image-preview
                modelName = 'gemini-3-pro-image-preview';
                activeGoogleKey = getGoogleKeyNt();
            } else {
                // Default fallback or other Gemini models (e.g. gemini-3-pro-preview)
                modelName = 'gemini-3-pro-preview';
            }

            if (!activeGoogleKey) throw new HttpsError("failed-precondition", "Google API key missing for this model.");

            const googleKey = activeGoogleKey;

            const { temperature, topP, topK, candidateCount, safetySettings, grounding } = request.data;

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${googleKey}`;

            const generationConfig = {
                responseModalities: ["TEXT", "IMAGE"],
                temperature: temperature || 0.4,
                topP: topP || 0.95,
                topK: topK || 32,
                candidateCount: candidateCount || 1,
            };

            const bodyPayload = {
                system_instruction: {
                    parts: [{ text: "You are an expert image generator. Generate the image requested by the user. Do not use any tools. Do not output JSON. Directly generate the image." }]
                },
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig
            };

            // STRICT OVERRIDE for Nano Banana (Gemini 2.5 Flash Image)
            // This model can hallucinate tool calls if not strictly controlled.
            if (modelId === 'nano-banana') {
                bodyPayload.system_instruction = {
                    parts: [{ text: "Generate the image. Do not use tools." }]
                };
                // Ensure toolConfig is explicitly disabling tools if possible, 
                // but for REST API simple system instruction is usually best.
                // We also remove safety settings to prevent false positives interfering.
                generationConfig.responseModalities = ["IMAGE"];
            }

            // Safety Settings
            if (safetySettings === 'None (Creative)') {
                bodyPayload.safetySettings = [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ];
            }

            // Grounding (Google Search)
            if (grounding === 'Enabled') {
                bodyPayload.tools = [{ google_search_retrieval: { dynamic_retrieval_config: { mode: "MODE_DYNAMIC", dynamic_threshold: 0.7 } } }];
            }

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload)
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
    timeoutSeconds: 60,
    secrets: [openRouterApiKey]
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
    let finalUrl = url;

    // Check if url is a base64 string (data:image/...)
    if (url && url.startsWith('data:')) {
        try {
            const bucket = admin.storage().bucket();
            console.log("Attempting upload to bucket:", bucket.name);

            const mimeType = url.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
            const base64Data = url.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileSize = buffer.length;

            // QUOTA CHECK: 50MB for free users
            const userRef = db.collection("users").doc(uid);
            const userSnap = await userRef.get();
            const userData = userSnap.data() || {};

            // Allow if admin or unlimited flag is set
            const isUnlimited = userData.role === 'admin' || userData.isAdmin === true || userData.unlimitedStorage === true;
            const currentUsage = userData.storageUsage || 0;
            const MAX_STORAGE = 50 * 1024 * 1024; // 50MB

            if (!isUnlimited && (currentUsage + fileSize > MAX_STORAGE)) {
                throw new Error(`Storage Quota Exceeded. Limit: 50MB. Used: ${(currentUsage / 1024 / 1024).toFixed(2)}MB. Upgrade for unlimited.`);
            }

            const timestamp = Date.now();
            const extension = mimeType.split('/')[1] || 'png';
            const filePath = `creations/${uid}/${timestamp}.${extension}`;
            const file = bucket.file(filePath);
            const uuid = crypto.randomUUID();

            await file.save(buffer, {
                metadata: {
                    contentType: mimeType,
                    metadata: {
                        firebaseStorageDownloadTokens: uuid
                    }
                }
            });

            // Construct public URL manually to avoid IAM 'signBlob' permission issues
            // Pattern: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?alt=media&token=<uuid>
            const encodedPath = encodeURIComponent(filePath);
            finalUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${uuid}`;

            // Update storage usage
            await userRef.update({
                storageUsage: admin.firestore.FieldValue.increment(fileSize)
            });

        } catch (error) {
            console.error("CRITICAL: Error uploading Base64 to Storage:", error);
            throw new Error("Failed to upload image to storage: " + error.message);
        }
    }

    // Safety check: If for some reason we still have a huge string, fail fast to avoid obscure Firestore errors
    if (finalUrl && finalUrl.length > 5000 && finalUrl.startsWith('data:')) {
        throw new Error("Image too large for database and storage upload failed.");
    }

    await db.collection("creations").add({
        userId: uid, type, prompt, url: finalUrl, cost,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}
