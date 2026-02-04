const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString, defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Replicate = require("replicate");
const cors = require("cors")({ origin: true });

/* eslint-disable no-unused-vars */

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
    let { prompt, provider, modelId, version, aspectRatio = "1:1" } = request.data;

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

            // Mapping to Snake Case for REST API
            const generationConfig = {
                response_modalities: ["TEXT", "IMAGE"],
                temperature: temperature || 0.4,
                top_p: topP || 0.95,
                top_k: topK || 32,
                candidate_count: candidateCount || 1,
            };

            // Add aspect_ratio to generationConfig (snake_case for REST API)
            // ERROR FIX: Raw REST API rejects 'aspect_ratio' in generationConfig.
            // We use PROMPT INJECTION (Pulse) instead for compatibility.
            if (aspectRatio && typeof aspectRatio === 'string') {
                // generationConfig.aspect_ratio = aspectRatio; // REMOVED causing 400 Error
                prompt = `[Aspect Ratio: ${aspectRatio}] ${prompt}`;
            }

            const bodyPayload = {
                system_instruction: {
                    parts: [{ text: "You are an expert image generator. Generate the image requested by the user. Do not use any tools. Do not output JSON. Directly generate the image." }]
                },
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig
            };

            // STRICT OVERRIDE for Nano Banana family (Gemini Image Models)
            // CRITICAL: REST API uses strict protobuf schema. Only valid fields allowed.
            // SDK abstractions like image_config/thinking_config do NOT work in raw REST.
            const isNanoBanana = modelId === 'nano-banana';
            const isNanoBananaPro = modelId === 'gemini-3-pro-image-preview';

            if (isNanoBanana || isNanoBananaPro) {
                // 1. Remove System Instructions (unsupported in strict image mode)
                delete bodyPayload.system_instruction;

                // 2. Disable Tools explicitly
                bodyPayload.tool_config = {
                    function_calling_config: { mode: "NONE" }
                };

                // 3. Remove ALL non-standard fields from generationConfig
                // REST API only allows: response_modalities (for image models)
                delete generationConfig.temperature;
                delete generationConfig.top_p;
                delete generationConfig.top_k;
                delete generationConfig.candidate_count;
                delete generationConfig.aspect_ratio; // Not valid in REST API

                // 4. Set response modality
                const { thinking, resolution } = request.data;
                const isThinking = isNanoBananaPro && thinking === 'On';

                if (isThinking) {
                    // TEXT+IMAGE for thinking mode to capture reasoning
                    generationConfig.response_modalities = ["TEXT", "IMAGE"];
                } else {
                    // Strict IMAGE only
                    generationConfig.response_modalities = ["IMAGE"];
                }

                // 5. Build enhanced prompt with all parameters (prompt injection)
                // Note: Aspect Ratio is already injected globally above.
                let promptParts = [];

                if (resolution === 'High (2K)') promptParts.push("[Resolution: 2K]");
                else if (resolution === 'Ultra (4K)') promptParts.push("[Resolution: 4K]");

                if (isThinking) promptParts.push("[Show your reasoning process]");

                // Construct final prompt
                if (promptParts.length > 0) {
                    prompt = promptParts.join(" ") + " " + prompt;
                }

                // Enhanced prompting for reliability
                bodyPayload.contents = [{
                    parts: [{ text: "Generate an image of: " + prompt }]
                }];
            }
            // Common Safety Logic
            // Nano Banana (Gemini 2.5 Flash) is extremely sensitive and requires BLOCK_NONE to function reliably.
            // We force BLOCK_NONE for Nano Banana regardless of UI setting to prevent "NO_IMAGE".
            if (modelId === 'nano-banana' || safetySettings === 'None (Creative)') {
                bodyPayload.safetySettings = [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ];
            } else {
                // Standard safety settings
                bodyPayload.safetySettings = [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                ];
            }


            // Grounding (Google Search) - inside provider block
            if (grounding === 'Enabled') {
                bodyPayload.tools = [{ google_search_retrieval: { dynamic_retrieval_config: { mode: "MODE_DYNAMIC", dynamic_threshold: 0.7 } } }];
            }

            // FETCH moved inside block to access apiUrl
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload)
            });
            const json = await response.json();

            if (json.error) {
                console.error("Gemini API Error:", JSON.stringify(json.error));
                // Return full error details to user for debugging
                throw new Error(JSON.stringify(json.error));
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
        // return { success: true, imageUrl }; // Removed early return to allow saving


        if (imageUrl) {
            console.log("Saving creation to Firestore/Storage...");
            // saveCreation handles Base64 upload for Google and direct URL for others
            await saveCreation(uid, 'image', prompt, imageUrl, COST);
        }

        return { success: true, imageUrl, _version: "v2026.02.02.3 - Save Logic Fixed" };

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

// exports.saveCreation = saveCreation; // verify usage first
async function saveCreation(uid, type, prompt, url, cost) {
    let finalUrl = url;

    // Check if url is a base64 string (data:image/...)
    if (url && url.startsWith('data:')) {
        try {
            const bucket = admin.storage().bucket("sand-gallery-lab.firebasestorage.app");
            console.log("Attempting upload to bucket:", bucket.name);

            const match = url.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
            if (!match) throw new Error("Invalid base64 Data URI format");
            const mimeType = match[1];

            const base64Data = url.split(',')[1];
            if (!base64Data) throw new Error("Invalid base64 data content");
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

// --- VIDEO ANALYSIS CRM ---

exports.analyzeVideo = onCall({
    timeoutSeconds: 540, // 9 minutes (max for Gen 2 is 60m, but 540s is safe for http)
    memory: "2GiB",
    secrets: [googleApiKey, googleApiKeyNt] // Using NT key for Gemini models just to be safe, or standard key
}, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");
    const uid = request.auth.uid;
    const { storagePath } = request.data;

    console.log(`Analyzing Video (${uid}): ${storagePath}`);

    // COST: 10 Credits for Deep Analysis
    await deductCredits(uid, 10);

    // Verify we use the Correct Bucket (must match frontend upload target)
    const bucket = admin.storage().bucket("sand-gallery-lab.firebasestorage.app");
    const file = bucket.file(storagePath);
    const fs = require('fs');
    const os = require('os');
    const path = require('path');

    const fileName = path.basename(storagePath);
    const tempFilePath = path.join(os.tmpdir(), fileName);

    try {
        // 1. Download to Temp
        await file.download({ destination: tempFilePath });
        console.log("File downloaded to:", tempFilePath);

        // 2. Upload to Google File API
        const uploadResult = await uploadToGemini(tempFilePath, "video/mp4");
        console.log("Uploaded to Gemini:", uploadResult.file.uri);

        // 3. Wait for processing (Video takes time)
        let fileState = uploadResult.file.state;
        let fileUri = uploadResult.file.uri;
        let fileNameResource = uploadResult.file.name;

        // Poll for processing
        let attempts = 0;
        while (fileState === "PROCESSING" && attempts < 30) {
            await new Promise(r => setTimeout(r, 2000));
            const check = await checkFileState(fileNameResource);
            fileState = check.state;
            console.log("Processing state:", fileState);
            attempts++;
        }

        if (fileState === "FAILED") throw new Error("Video processing failed by Google.");

        // 4. Call Gemini 3.0 Pro
        const analysis = await callGeminiAnalysis(fileUri);

        // 5. Cleanup Gemini File
        // (Optional: You can delete the file from Google to save space/privacy)
        // await deleteGeminiFile(fileNameResource); 

        // 6. Save to Firestore
        const analysisId = crypto.randomUUID();
        const analysisData = {
            analysisId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            model: "gemini-3.0-pro",
            storagePath,
            scores: analysis.scores,
            critique: analysis.critique,
            reasoning_trace: analysis.reasoning_trace
        };

        await db.collection("users").doc(uid).collection("video_analyses").doc(analysisId).set(analysisData);

        // Cleanup Temp
        fs.unlinkSync(tempFilePath);

        return { success: true, data: analysisData };

    } catch (e) {
        console.error(e);
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw new HttpsError("internal", e.message);
    }
});

// --- GOOGLE FILE API HELPERS (REST) ---

async function uploadToGemini(filePath, mimeType) {
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    const numBytes = stats.size;
    const key = getGoogleKeyNt(); // Use the NT key (Gemini 3 access)

    // 1. Initial Resumable Request
    const initRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${key}`, {
        method: "POST",
        headers: {
            "X-Goog-Upload-Protocol": "resumable",
            "X-Goog-Upload-Command": "start",
            "X-Goog-Upload-Header-Content-Length": numBytes,
            "X-Goog-Upload-Header-Content-Type": mimeType,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ file: { display_name: "CRM_Upload" } })
    });

    const uploadUrl = initRes.headers.get("x-goog-upload-url");
    if (!uploadUrl) throw new Error("Failed to get Google Upload URL");

    // 2. Upload Bytes
    const fileBuffer = fs.readFileSync(filePath); // Read fully into memory (Careful with large files > 2GB)

    // Perform the Upload and Capture Response (Single Step)
    const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            "Content-Length": numBytes,
            "X-Goog-Upload-Offset": "0",
            "X-Goog-Upload-Command": "upload, finalize"
        },
        body: fileBuffer
    });

    const responseText = await uploadRes.text();
    if (!uploadRes.ok) {
        throw new Error(`Google Upload Failed: ${uploadRes.status} ${uploadRes.statusText} - ${responseText}`);
    }

    try {
        return JSON.parse(responseText);
    } catch (e) {
        // Fallback: If success but not JSON, construct a mock object if possible, or throw
        // Sometimes the API returns the file metadata in JSON, sometimes it might be empty on success?
        // Actually, the 'finalize' command should return the File resource.
        console.warn("Google Upload returned non-JSON:", responseText);
        throw new Error(`Google Upload returned invalid JSON: ${responseText.substring(0, 100)}`);
    }
}

async function checkFileState(nameResource) {
    const key = getGoogleKeyNt();
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${nameResource}?key=${key}`);
    return await res.json();
}

async function callGeminiAnalysis(fileUri) {
    const key = getGoogleKeyNt();
    const model = 'gemini-2.0-flash'; // Fallback to Flash 2 for speed/reliability if 3.0 Pro is strictly preview/limited, 
    // BUT the prompt said "Gemini 3.0 Pro". 
    // Let's use 'gemini-1.5-pro' as the SAFE stable baseline that supports File API reliably, 
    // OR 'gemini-2.0-flash-exp' if available. 
    // Given the prompt "Gemini 3.0 Pro", we will try 'gemini-2.0-pro-exp' or similar if 3.0 isn't public. 
    // Actually, let's stick to 'gemini-1.5-pro' for GUARANTEED STABILITY with Video, 
    // or 'gemini-2.0-flash' which is "Nano Banana". 
    // User asked for "Gemini 3.0 Pro". If that doesn't exist in the API yet, we use the best available: 'gemini-1.5-pro-002'.
    // User correction: 'gemini-3-pro-preview' is the active ID
    const modelName = 'gemini-3-pro-preview';

    const body = {
        contents: [{
            parts: [
                { file_data: { mime_type: "video/mp4", file_uri: fileUri } },
                {
                    text: `
You are a master film editor and VFX supervisor. Analyze this video clip.
Provide a JSON response strictly following this schema:
{
  "scores": {
    "editing": 0-100,
    "fx": 0-100,
    "pacing": 0-100,
    "storytelling": 0-100,
    "quality": 0-100
  },
  "critique": {
    "editing_notes": "string",
    "fx_notes": "string",
    "pacing_notes": "string",
    "storytelling_notes": "string",
    "quality_notes": "string"
  },
  "reasoning_trace": "string explanation"
}

Return ONLY raw JSON. No markdown formatting.
` }
            ]
        }],
        generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.2
        }
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const json = await res.json();
    if (json.error) throw new Error(JSON.stringify(json.error));

    const text = json.candidates[0].content.parts[0].text;
    // Strip constraints just in case
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
}
