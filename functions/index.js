const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
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
const openClawApiKey = defineSecret("OPENCLAW_API_KEY");

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

// --- OPENCLAW GATEWAY (SECURE API) ---
// Define GitHub Token Secret
const githubToken = defineSecret("GITHUB_TOKEN");

exports.openClawGateway = onRequest({
    secrets: [openClawApiKey, googleApiKey, googleApiKeyNt, githubToken],
    timeoutSeconds: 60,
    memory: "1GiB",
    cors: true
}, async (req, res) => {
    // 1. Auth Check - Strict API Key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== openClawApiKey.value()) {
        res.status(403).json({ error: "Unauthorized: Invalid API Key" });
        return;
    }

    const { command, data } = req.body;

    try {
        let result;

        // Lazy load Octokit to ensure it's only initialized when needed
        const { Octokit } = require("@octokit/rest");

        if (command === 'system_status') {
            result = {
                status: 'online',
                timestamp: Date.now()
            };
        } else if (command === 'chat') {
            // Text-Only Chat Interface
            // Defaults to Gemini 3.0 Pro (Preview)
            const prompt = data.prompt;
            const modelId = data.modelId || 'gemini-3-pro-preview';

            if (!prompt) throw new Error("Prompt is required for chat.");

            // Call Gemini 3.0 Pro (or specific model)
            // We reuse Google REST API logic but simplified for text-only
            const googleKey = getGoogleKeyNt(); // Use NT key for newer models
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${googleKey}`;

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        top_p: 0.95,
                        top_k: 40,
                        candidate_count: 1
                    }
                })
            });

            const json = await response.json();

            if (json.error) {
                throw new Error(JSON.stringify(json.error));
            }

            const candidates = json.candidates || [];
            const text = candidates[0]?.content?.parts?.[0]?.text || "No response generated.";

            result = { text, model: modelId };

        } else if (command === 'list_projects') {
            // GitHub Project Discovery
            if (!githubToken.value()) throw new Error("GITHUB_TOKEN secret is not set.");

            const octokit = new Octokit({ auth: githubToken.value() });
            // List repos for the authenticated user
            const repos = await octokit.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 10,
                type: 'owner' // Only repos owned by the user
            });

            result = {
                projects: repos.data.map(r => ({
                    name: r.name,
                    full_name: r.full_name,
                    description: r.description,
                    url: r.html_url
                }))
            };

        } else if (command === 'dispatch_task') {
            // Task Dispatch via Issue Creation
            const { repo, title, instruction } = data;
            if (!repo || !title || !instruction) throw new Error("Missing required fields: repo, title, instruction.");
            if (!githubToken.value()) throw new Error("GITHUB_TOKEN secret is not set.");
            const octokit = new Octokit({ auth: githubToken.value() });

            // Expecting data: { repo: "owner/repo", title: "...", instruction: "..." }
            const repoFull = data.repo || "TheSandemon/sand-gallery";
            const [owner, dispatchRepo] = repoFull.split('/');

            const issue = await octokit.issues.create({
                owner,
                repo: dispatchRepo,
                title: data.title + " (Automated)",
                body: `${data.instruction}\n\n*Dispatched via OpenClaw Gateway*`,
                labels: ['automated']
            });

            result = {
                success: true,
                issue_number: issue.data.number,
                issue_url: issue.data.html_url,
                message: "Task dispatched successfully."
            };

        } else if (command === 'update_task') {
            // Task Update (Retry/Edit Issue)
            if (!githubToken.value()) throw new Error("GITHUB_TOKEN secret is not set.");
            const octokit = new Octokit({ auth: githubToken.value() });

            // Expecting data: { repo: "owner/repo", issue_number: 123, body: "...", labels: ["automated"] }
            if (!data.issue_number) throw new Error("issue_number is required to update a task.");

            const repoFull = data.repo || "TheSandemon/sand-gallery";
            const [owner, updateRepo] = repoFull.split('/');

            const updateParams = {
                owner,
                repo: updateRepo,
                issue_number: data.issue_number
            };

            if (data.body) updateParams.body = data.body;
            if (data.title) updateParams.title = data.title;
            if (data.state) updateParams.state = data.state; // 'open' or 'closed'
            if (data.labels) updateParams.labels = data.labels; // Replaces existing labels

            const issue = await octokit.issues.update(updateParams);

            result = {
                success: true,
                issue_number: issue.data.number,
                message: "Task updated successfully."
            };

        } else if (command === 'read_file') {
            // Read File Content
            if (!githubToken.value()) throw new Error("GITHUB_TOKEN secret is not set.");
            const octokit = new Octokit({ auth: githubToken.value() });

            // Expecting data: { repo: "owner/repo", path: "src/index.js" }
            if (!data.path) throw new Error("path is required.");
            const repoFull = data.repo || "TheSandemon/sand-gallery";
            const [owner, repo] = repoFull.split('/');

            const fileData = await octokit.repos.getContent({
                owner,
                repo,
                path: data.path
            });

            // Handle directory response vs file response
            if (Array.isArray(fileData.data)) throw new Error("Path is a directory, not a file. Use list_files.");
            if (!fileData.data.content) throw new Error("File content is empty or not available.");

            const content = Buffer.from(fileData.data.content, 'base64').toString('utf-8');

            result = {
                path: data.path,
                content: content,
                sha: fileData.data.sha
            };

        } else if (command === 'list_files') {
            // List Directory
            if (!githubToken.value()) throw new Error("GITHUB_TOKEN secret is not set.");
            const octokit = new Octokit({ auth: githubToken.value() });

            // Expecting data: { repo: "owner/repo", path: "src/" }
            const repoFull = data.repo || "TheSandemon/sand-gallery";
            const [owner, repo] = repoFull.split('/');
            const path = data.path || "";

            const dirData = await octokit.repos.getContent({
                owner,
                repo,
                path
            });

            if (!Array.isArray(dirData.data)) throw new Error("Path is a file, not a directory. Use read_file.");

            result = {
                path,
                files: dirData.data.map(f => ({
                    name: f.name,
                    path: f.path,
                    type: f.type, // 'file' or 'dir'
                    size: f.size
                }))
            };

        } else if (command === 'search_code') {
            // Search Code (GitHub Search)
            if (!githubToken.value()) throw new Error("GITHUB_TOKEN secret is not set.");
            const octokit = new Octokit({ auth: githubToken.value() });

            // Expecting data: { repo: "owner/repo", query: "function test" }
            if (!data.query) throw new Error("query is required.");
            const repoFull = data.repo || "TheSandemon/sand-gallery";
            const q = `${data.query} repo:${repoFull}`;

            const searchRes = await octokit.search.code({ q });

            result = {
                count: searchRes.data.total_count,
                items: searchRes.data.items.map(item => ({
                    name: item.name,
                    path: item.path,
                    url: item.html_url
                }))
            };

        } else if (command === 'list_issues') {
            // List Issues (Monitoring)
            if (!githubToken.value()) throw new Error("GITHUB_TOKEN secret is not set.");
            const octokit = new Octokit({ auth: githubToken.value() });

            // Expecting data: { repo, state: "open", labels: "automated" }
            const repoFull = data.repo || "TheSandemon/sand-gallery";
            const [owner, repo] = repoFull.split('/');

            const listParams = { owner, repo };
            if (data.state) listParams.state = data.state;
            if (data.labels) listParams.labels = data.labels;
            if (data.per_page) listParams.per_page = data.per_page;

            const issues = await octokit.issues.listForRepo(listParams);

            result = {
                count: issues.data.length,
                issues: issues.data.map(i => ({
                    number: i.number,
                    title: i.title,
                    state: i.state,
                    labels: i.labels.map(l => l.name),
                    url: i.html_url,
                    created_at: i.created_at
                }))
            };

        } else if (command === 'get_pr') {
            // Get Pull Request (Verification)
            if (!githubToken.value()) throw new Error("GITHUB_TOKEN secret is not set.");
            const octokit = new Octokit({ auth: githubToken.value() });

            // Expecting data: { repo, pull_number }
            if (!data.pull_number) throw new Error("pull_number is required.");
            const repoFull = data.repo || "TheSandemon/sand-gallery";
            const [owner, repo] = repoFull.split('/');

            const pr = await octokit.pulls.get({
                owner,
                repo,
                pull_number: data.pull_number
            });

            result = {
                number: pr.data.number,
                title: pr.data.title,
                state: pr.data.state,
                merged: pr.data.merged,
                url: pr.data.html_url,
                head: pr.data.head.ref
            };

        } else {
            throw new Error(`Unknown command: ${command}`);
        }

        res.json({ success: true, ...result });

    } catch (error) {
        console.error("OpenClaw Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- GENERATION HANDLERS (REFACTORED) ---
// ... (Audio and Video handlers remain same)

exports.generateImage = onCall({
    timeoutSeconds: 60,
    memory: "1GiB",
    secrets: [googleApiKey, googleApiKeyNt, replicateApiToken, openRouterApiKey]
}, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");
    const uid = request.auth.uid;

    // 1. Calculate Cost (Shared Logic or manual here?)
    // Let's keep cost logic here as it's specific to the User Economy
    let { prompt, provider, version } = request.data;
    if (!prompt) throw new HttpsError("invalid-argument", "Prompt required.");

    let COST = 1;
    if (provider === 'google' || (version && version.includes('midjourney'))) COST = 2;
    if (provider === 'openrouter') COST = 4;
    if (provider === 'replicate' && version && !version.includes('midjourney')) COST = 1;

    await deductCredits(uid, COST);

    // 2. Call Core Logic
    try {
        // Pass COST so core logic can save it to history
        return await coreGenerateImage(uid, { ...request.data, cost: COST });
    } catch (e) {
        throw new HttpsError("internal", e.message);
    }
});

// SHARED CORE FUNCTION
async function coreGenerateImage(uid, data) {
    let { prompt, provider, modelId, version, aspectRatio = "1:1", cost = 0 } = data;

    console.log(`Image Core (${uid}) [${provider}]: ${prompt}`);
    let imageUrl = null;

    if (provider === 'replicate') {
        const replicate = getReplicate();
        const output = await replicate.run(version, {
            input: { prompt, aspect_ratio: aspectRatio, safety_tolerance: 5 }
        });
        imageUrl = Array.isArray(output) ? output[0] : output;
    } else if (provider === 'openrouter') {
        const key = getOpenRouterKey();
        if (!key) throw new Error("OpenRouter key missing.");

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

        if (!activeGoogleKey) throw new Error("Google API key missing for this model.");

        const googleKey = activeGoogleKey;

        const { temperature, topP, topK, candidateCount, safetySettings, grounding } = data;

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
            const { thinking, resolution } = data;
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


    if (imageUrl) {
        console.log("Saving creation to Firestore/Storage...");
        // saveCreation handles Base64 upload for Google and direct URL for others
        await saveCreation(uid, 'image', prompt, imageUrl, cost);
    }

    return { success: true, imageUrl, _version: "v2026.02.12.1 - Shared Core" };
}

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
    timeoutSeconds: 540,
    memory: "2GiB",
    secrets: [googleApiKey, googleApiKeyNt]
}, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");
    const uid = request.auth.uid;
    const { storagePath, harshness, perspective } = request.data;

    // COST: 10 Credits (handled in wrapper)
    await deductCredits(uid, 10);

    try {
        const result = await coreAnalyzeVideo(uid, { storagePath, harshness, perspective });
        return { success: true, data: result };
    } catch (e) {
        throw new HttpsError("internal", e.message);
    }
});

// SHARED CORE FUNCTION
async function coreAnalyzeVideo(uid, data) {
    const { storagePath, harshness = "Normal", perspective = "Overall" } = data;

    console.log(`Analyzing Video (${uid}): ${storagePath}`);

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
        const analysis = await callGeminiAnalysis(fileUri, harshness, perspective);

        // 5. Cleanup Gemini File (Optional)
        // await deleteGeminiFile(fileNameResource); 

        // 6. Save to Firestore
        const analysisId = crypto.randomUUID();
        const analysisData = {
            analysisId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            model: "gemini-3.0-pro",
            storagePath,
            harshness,
            perspective,
            scores: analysis.scores,
            critique: analysis.critique,
            reasoning_trace: analysis.reasoning_trace
        };

        await db.collection("users").doc(uid).collection("video_analyses").doc(analysisId).set(analysisData);

        // Cleanup Temp
        fs.unlinkSync(tempFilePath);

        return analysisData;

    } catch (e) {
        console.error(e);
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw new Error(e.message);
    }
}

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

async function callGeminiAnalysis(fileUri, harshness, perspective) {
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

    // Consult Architecture: Define Personas
    let roleDescription = "You are a master film editor and VFX supervisor.";
    if (perspective === 'Advertising') roleDescription = "You are a top-tier Advertising Executive and Creative Director focused on conversion, branding, and hook retention.";
    if (perspective === 'AI') roleDescription = "You are an advanced AGI Film Critic analyzing technical coherence, generative artifacts, and temporal stability.";
    if (perspective === 'Cinematic') roleDescription = "You are a legendary Cinema Director (like Scorsese or Kubrick) focusing on composition, lighting, and emotional depth.";

    // Define Harshness/Tone (UPDATED: Much Stricter)
    let toneInstruction = "Be constructive but honest.";
    if (harshness === 'Nice') toneInstruction = "Be encouraging, but don't lie. Point out flaws gently.";
    if (harshness === 'Normal') toneInstruction = "Be CRITICAL. Do not give 100/100 unless it is a Hollywood masterpiece. Average content should get 50-60. Point out every technical flaw.";
    if (harshness === 'Harsh') toneInstruction = "Be RUTHLESS. Standards are perfection. If a frame is dropped, a cut is late, or color is flat, deduct points heavily. 70/100 is a high score here.";
    if (harshness === 'Roast') toneInstruction = "ROAST IT. Be savage, sarcastic, and funny. Mock the editing choices, the effects, and the pacing. Destroy the user's ego but maintain accurate technical feedback.";

    // RUBRIC INJECTION
    const rubric = `
    CRITERIA FOR SCORING:
    - Editing: Flow, continuity coverage, cut timing, motivation of cuts.
    - FX: Quality of composites, motion tracking, color grading, realism/style integration.
    - Pacing: Rhythm, engagement retention, does it drag? Is it too fast?
    - Storytelling: Clarity of narrative, emotional impact, hook.
    - Quality: Resolution, compression artifacts, lighting, audio mix/clarity.
    `;

    const body = {
        contents: [{
            parts: [
                { file_data: { mime_type: "video/mp4", file_uri: fileUri } },
                {
                    text: `
${roleDescription}
${toneInstruction}

${rubric}

Analyze this video clip.
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

// --- AI WORKER (SELF-CORRECTION CRON) ---

exports.aiWorker = onSchedule({
    schedule: "every 5 minutes", // Checked freely via GitHub API. LLM only called if work exists.
    secrets: [githubToken, googleApiKeyNt],
    timeoutSeconds: 300,
    memory: "1GiB"
}, async (event) => {
    console.log("AI Worker waking up...");

    // 1. Setup Octokit
    const { Octokit } = require("@octokit/rest");
    if (!githubToken.value()) {
        console.error("GITHUB_TOKEN missing. AI Worker sleeping.");
        return;
    }
    const octokit = new Octokit({ auth: githubToken.value() });

    // 2. Poll for Issues
    const OWNER = "TheSandemon";
    const REPO = "sand-gallery";

    const issues = await octokit.issues.listForRepo({
        owner: OWNER,
        repo: REPO,
        state: 'open',
        labels: 'automated',
        per_page: 5
    });

    if (issues.data.length === 0) {
        console.log("No automated tasks found.");
        return;
    }

    console.log(`Found ${issues.data.length} issues to process.`);

    // 3. Process Loop (Max 3 to avoid timeout)
    const MAX_BATCH = 3;
    const batch = issues.data.slice(0, MAX_BATCH);

    for (const issue of batch) {
        console.log(`Processing Issue #${issue.number}: ${issue.title}`);

        try {
            // A. Parse Context (File Path)
            const fileMatch = issue.body.match(/File:\s*([^\s\n]+)/);
            if (!fileMatch) {
                await octokit.issues.createComment({
                    owner: OWNER, repo: REPO, issue_number: issue.number,
                    body: "❌ **AI Worker Error**: Could not find `File: path/to/file` in issue body.\n\nRunning cleanup: Removing 'automated' label to unblock queue."
                });
                await octokit.issues.removeLabel({
                    owner: OWNER, repo: REPO, issue_number: issue.number,
                    name: 'automated'
                });
                continue;
            }
            const filePath = fileMatch[1];

            // B. Get Code
            let fileContent;
            let sha;
            try {
                const fileData = await octokit.repos.getContent({
                    owner: OWNER, repo: REPO, path: filePath
                });
                fileContent = Buffer.from(fileData.data.content, 'base64').toString('utf-8');
                sha = fileData.data.sha;
            } catch (e) {
                await octokit.issues.createComment({
                    owner: OWNER, repo: REPO, issue_number: issue.number,
                    body: `❌ **AI Worker Error**: Could not read file \`${filePath}\`. Does it exist?\n\nRemoving 'automated' label.`
                });
                await octokit.issues.removeLabel({
                    owner: OWNER, repo: REPO, issue_number: issue.number,
                    name: 'automated'
                });
                continue;
            }

            // C. Think (Gemini)
            const instruction = issue.body.replace(/File:\s*[^\s\n]+/, '').trim();
            const prompt = `
            You are an expert React/Node.js Developer.
            GOAL: ${issue.title}
            INSTRUCTION: ${instruction}
            
            FILE: ${filePath}
            CURRENT CODE:
            \`\`\`javascript
            ${fileContent}
            \`\`\`

            OUTPUT: Return ONLY the full updated code for the file. No markdown toggles, no explanations. Just the raw code.
            `;

            const googleKey = getGoogleKeyNt();
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${googleKey}`;

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.2 }
                })
            });
            const json = await response.json();
            const rawCode = json.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!rawCode) throw new Error("Gemini returned empty response.");

            let cleanCode = rawCode.trim();
            if (cleanCode.startsWith('```')) {
                cleanCode = cleanCode.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
            }

            // D. Create Branch & Commit
            const BRANCH_NAME = `fix/issue-${issue.number}`;
            const BASE_BRANCH = "main";
            const mainRef = await octokit.git.getRef({ owner: OWNER, repo: REPO, ref: `heads/${BASE_BRANCH}` });
            const mainSha = mainRef.data.object.sha;

            try {
                await octokit.git.createRef({
                    owner: OWNER, repo: REPO,
                    ref: `refs/heads/${BRANCH_NAME}`,
                    sha: mainSha
                });
            } catch (e) {
                console.log("Branch likely exists, proceeding to commit...");
            }

            await octokit.repos.createOrUpdateFileContents({
                owner: OWNER, repo: REPO, path: filePath,
                message: `fix: Resolved Issue #${issue.number} via AI Worker`,
                content: Buffer.from(cleanCode).toString('base64'),
                branch: BRANCH_NAME,
                sha: sha
            });

            // E. Open Pull Request
            const pr = await octokit.pulls.create({
                owner: OWNER, repo: REPO,
                title: `fix: ${issue.title} (AI Worker)`,
                head: BRANCH_NAME,
                base: BASE_BRANCH,
                body: `Resolves #${issue.number}.\n\nAutomated fix generated by Antigravity AI Worker.`
            });

            // F. Comment & Remove Label
            await octokit.issues.createComment({
                owner: OWNER, repo: REPO, issue_number: issue.number,
                body: `✅ **Success**: Fix proposed in PR #${pr.data.number}.`
            });

            await octokit.issues.removeLabel({
                owner: OWNER, repo: REPO, issue_number: issue.number,
                name: 'automated'
            });

        } catch (e) {
            console.error(`Issue #${issue.number} Failed:`, e);
            await octokit.issues.createComment({
                owner: OWNER, repo: REPO, issue_number: issue.number,
                body: `❌ **AI Worker Failed**: ${e.message}\n\nRemoving 'automated' label to prevent queue block.`
            });
            await octokit.issues.removeLabel({
                owner: OWNER, repo: REPO, issue_number: issue.number,
                name: 'automated'
            });
        }
    }
});
