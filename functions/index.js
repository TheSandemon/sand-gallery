const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Replicate = require("replicate");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Initialize Replicate with API Key from Firebase Config
// Set this via: firebase functions:config:set replicate.key="YOUR_KEY"
const replicate = new Replicate({
    auth: functions.config().replicate?.key || "MOCK_KEY_FOR_BUILD",
});

exports.generateAudio = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in to generate audio."
        );
    }

    const uid = context.auth.uid;
    const { prompt, duration = 5 } = data; // Duration in seconds

    if (!prompt) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Prompt is required."
        );
    }

    // Cost: 2 Credits
    const COST = 2;

    try {
        // 2. Transaction: Check & Deduct Credits
        await db.runTransaction(async (transaction) => {
            const userRef = db.collection("users").doc(uid);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new functions.https.HttpsError("not-found", "User profile not found.");
            }

            const userData = userDoc.data();
            const currentCredits = userData.credits || 0;

            if (currentCredits < COST) {
                throw new functions.https.HttpsError(
                    "resource-exhausted",
                    `Insufficient credits. You need ${COST} credits.`
                );
            }

            transaction.update(userRef, {
                credits: currentCredits - COST,
            });
        });

        // 3. Call Replicate API (AudioLDM)
        // Model: avo-world/audioldm-s-full-v2
        console.log(`Generating audio for ${uid}: "${prompt}"`);

        // Note: Replicate.run returns the output directly
        const output = await replicate.run(
            "avo-world/audioldm-s-full-v2:tuw5z4i4rxj6c0cj4q4907q050", // Use a stable version ID or 'latest'
            {
                input: {
                    text: prompt,
                    duration: duration.toString(),
                    n_candidates: 1,
                    guidance_scale: 2.5,
                },
            }
        );

        console.log("Replicate output:", output);
        // Output is usually a URI string or an array depending on the model. 
        // For AudioLDM it's typically a string URL.

        const audioUrl = output;

        // 4. Save Metadata to Firestore
        await db.collection("creations").add({
            userId: uid,
            prompt: prompt,
            audioUrl: audioUrl,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            cost: COST,
            type: "audio"
        });

        return { success: true, audioUrl: audioUrl, remainingCredits: "fetched_client_side" };

    } catch (error) {
        console.error("Error in generateAudio:", error);
        // Rethrow valid HttpsErrors, wrap others
        if (error.code && error.details) throw error;
        throw new functions.https.HttpsError("internal", error.message);
    }
});

exports.generateVideo = functions.runWith({ timeoutSeconds: 300, memory: '1GB' }).https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required.");
    }
    const uid = context.auth.uid;
    const { prompt, motion = 5, seed } = data;

    if (!prompt) throw new functions.https.HttpsError("invalid-argument", "Prompt required.");

    const COST = 10; // Video is expensive

    try {
        // 2. Credits Deduct
        await db.runTransaction(async (t) => {
            const userRef = db.collection("users").doc(uid);
            const doc = await t.get(userRef);
            if (!doc.exists) throw new functions.https.HttpsError("not-found", "User not found.");

            const current = doc.data().credits || 0;
            if (current < COST) throw new functions.https.HttpsError("resource-exhausted", `Need ${COST} credits.`);

            t.update(userRef, { credits: current - COST });
        });

        // 3. Replicate Call (Zeroscope v2 XL for Text-to-Video)
        console.log(`Generating video for ${uid}: ${prompt}`);

        // Using simple zeroscope model for demo purposes
        const output = await replicate.run(
            "anotherjesse/zeroscope-v2-xl:9f747673055b9c058f22d9c375dcf743b74959db2354c478a5e82da9428f5727",
            {
                input: {
                    prompt: prompt,
                    num_frames: 24,
                    fps: 8,
                    width: 576,
                    height: 320,
                    guidance_scale: 17.5,
                    negative_prompt: "noisy, washed out, ugly, distorted, broken",
                    num_inference_steps: 50
                }
            }
        );

        // Output is usually an array of URL strings involved in the generation process, the last one is the video
        const videoUrl = Array.isArray(output) ? output[0] : output;

        // 4. Save
        await db.collection("creations").add({
            userId: uid,
            prompt: prompt,
            videoUrl: videoUrl,
            type: "video",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            cost: COST
        });

        return { success: true, videoUrl: videoUrl };

    } catch (error) {
        console.error("Video Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
