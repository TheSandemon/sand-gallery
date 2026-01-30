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
