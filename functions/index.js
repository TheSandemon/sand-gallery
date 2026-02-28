const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

// ========== X402 PAYMENT SERVICE ==========

// Per-tool pricing (USDC on Base) - market-aligned
const TOOL_PRICING = {
    'kaito_query': { price: '0.002', maxTokens: 4000, description: 'AI text generation' },
    'kaito_image_analysis': { price: '0.003', maxTokens: 1000, description: 'Image vision analysis' },
    'kaito_web_search': { price: '0.002', maxResults: 10, description: 'Web search' },
    'kaito_code_review': { price: '0.004', maxTokens: 5000, description: 'Code review & analysis' },
    'kaito_summarize': { price: '0.002', maxTokens: 3000, description: 'Text summarization' },
    'kaito_translate': { price: '0.003', maxWords: 2000, description: 'Translation' },
    'kaito_image_generate': { price: '0.008', maxImages: 1, description: 'Image generation' }
};

const PAYMENT_ADDRESS = '0x6a3301fd46c7251374b9b21181519159fe5800ec';
const BASESCAN_API_KEY = 'WNBIJQS1MDW1K4J7P6GZQEVEIYVPQQNJKT';

// Get tool price
const getToolPrice = (toolName) => TOOL_PRICING[toolName]?.price || '0.002';

// In-memory storage
const paidQueries = new Map();

// ========== MCP PROTOCOL ==========

exports.toolsList = functions.https.onRequest({ cors: true }, (req, res) => {
    res.json({
        tools: [
            { name: 'kaito_query', description: 'AI text generation. Max 4000 tokens. 0.002 USDC.', price: '0.002 USDC', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, queryId: { type: 'string' }, model: { type: 'string' } }, required: ['prompt', 'queryId'] }},
            { name: 'kaito_image_analysis', description: 'Image vision. Max 1 image. 0.003 USDC.', price: '0.003 USDC', inputSchema: { type: 'object', properties: { imageUrl: { type: 'string' }, queryId: { type: 'string' } }, required: ['imageUrl', 'queryId'] }},
            { name: 'kaito_web_search', description: 'Web search. Max 10 results. 0.002 USDC.', price: '0.002 USDC', inputSchema: { type: 'object', properties: { query: { type: 'string' }, queryId: { type: 'string' } }, required: ['query', 'queryId'] }},
            { name: 'kaito_code_review', description: 'Code review. Max 5000 tokens. 0.004 USDC.', price: '0.004 USDC', inputSchema: { type: 'object', properties: { code: { type: 'string' }, language: { type: 'string' }, queryId: { type: 'string' } }, required: ['code', 'queryId'] }},
            { name: 'kaito_summarize', description: 'Text summarization. Max 3000 tokens. 0.002 USDC.', price: '0.002 USDC', inputSchema: { type: 'object', properties: { text: { type: 'string' }, queryId: { type: 'string' } }, required: ['text', 'queryId'] }},
            { name: 'kaito_translate', description: 'Translation. Max 2000 words. 0.003 USDC.', price: '0.003 USDC', inputSchema: { type: 'object', properties: { text: { type: 'string' }, targetLanguage: { type: 'string' }, sourceLanguage: { type: 'string' }, queryId: { type: 'string' } }, required: ['text', 'targetLanguage', 'queryId'] }},
            { name: 'kaito_image_generate', description: 'Image generation. Max 1 image. 0.008 USDC.', price: '0.008 USDC', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, queryId: { type: 'string' } }, required: ['prompt', 'queryId'] }}
        ]
    });
});

exports.toolsCall = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { name, arguments: args } = req.body;
    if (!name) return res.status(400).json({ content: [{ isError: true, text: JSON.stringify({ error: 'Tool name required' })}]});

    const queryId = args.queryId || `mcp-${Date.now()}`;
    const toolPrice = getToolPrice(name);
    const paymentStatus = await checkPayment(queryId, toolPrice);

    if (!paymentStatus.paid && !paidQueries.has(queryId)) {
        return res.status(402).json({ content: [{ isError: true, text: JSON.stringify({ error: 'Payment required', tool, price: toolPrice, currency: 'USDC', network: 'base', paymentAddress: PAYMENT_ADDRESS, queryId, limits: TOOL_PRICING[name], instructions: `Send ${toolPrice} USDC to ${PAYMENT_ADDRESS} on Base, then retry with same queryId` })}]});
    }

    if (paymentStatus.paid && !paidQueries.has(queryId)) {
        paidQueries.set(queryId, { txHash: paymentStatus.txHash, amount: toolPrice, paidAt: new Date().toISOString() });
    }

    let result;
    try {
        switch (name) {
            case 'kaito_query': result = await handleKaitoQuery(args.prompt, queryId, args.model); break;
            case 'kaito_image_analysis': result = await handleImageAnalysis(args.imageUrl, queryId); break;
            case 'kaito_web_search': result = await handleWebSearch(args.query, queryId); break;
            case 'kaito_code_review': result = await handleCodeReview(args.code, args.language, queryId); break;
            case 'kaito_summarize': result = await handleSummarize(args.text, queryId); break;
            case 'kaito_translate': result = await handleTranslate(args.text, args.targetLanguage, args.sourceLanguage, queryId); break;
            case 'kaito_image_generate': result = await handleImageGenerate(args.prompt, queryId); break;
            default: return res.status(404).json({ content: [{ isError: true, text: JSON.stringify({ error: `Unknown tool: ${name}` })}]});
        }
    } catch (e) {
        return res.status(500).json({ content: [{ isError: true, text: JSON.stringify({ error: e.message })}]});
    }

    res.json({ content: [{ type: 'text', text: JSON.stringify(result) }] });
});

exports.health = functions.https.onRequest((req, res) => {
    res.json({
        service: 'Kaito x402 Service',
        status: 'online',
        paymentAddress: PAYMENT_ADDRESS,
        network: 'base',
        version: '2.0-x402',
        pricing: TOOL_PRICING,
        endpoints: { toolsList: '/toolsList', toolsCall: '/toolsCall', health: '/health', status: '/status' }
    });
});

exports.query = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { prompt, queryId, model } = req.body;
    if (!queryId) return res.status(400).json({ error: 'queryId required' });

    const toolPrice = getToolPrice('kaito_query');
    if (paidQueries.has(queryId)) {
        const answer = await processQuery(prompt, model);
        return res.json({ queryId, answer, processedAt: new Date().toISOString() });
    }

    const paymentStatus = await checkPayment(queryId, toolPrice);
    if (paymentStatus.paid) {
        paidQueries.set(queryId, { txHash: paymentStatus.txHash, amount: toolPrice, paidAt: new Date().toISOString() });
        const answer = await processQuery(prompt, model);
        return res.json({ queryId, answer, processedAt: new Date().toISOString() });
    }

    res.status(402).json({ error: 'Payment required', price: toolPrice, currency: 'USDC', network: 'base', paymentAddress: PAYMENT_ADDRESS, queryId, instructions: `Send ${toolPrice} USDC to ${PAYMENT_ADDRESS} on Base, then retry` });
});

exports.status = functions.https.onRequest((req, res) => {
    const queryId = req.query.queryId;
    if (!queryId) return res.status(400).json({ error: 'queryId required' });
    if (paidQueries.has(queryId)) return res.json({ status: 'paid', details: paidQueries.get(queryId) });
    res.json({ status: 'pending', message: 'Payment not yet received' });
});

// ========== AI BACKENDS ==========

// Note: API keys would come from functions.config() or secrets in production
const getGoogleKey = () => process.env.GOOGLE_API_KEY || functions.config().google?.api_key;
const getReplicateKey = () => process.env.REPLICATE_API_TOKEN || functions.config().replicate?.api_token;
const getOpenRouterKey = () => process.env.OPENROUTER_API_KEY || functions.config().openrouter?.api_key;

async function handleKaitoQuery(prompt, queryId, model = 'minimax') {
    let answer;
    switch (model) {
        case 'google': answer = await callGoogle(prompt); break;
        case 'openrouter': answer = await callOpenRouter(prompt); break;
        case 'replicate': answer = await callReplicate(prompt); break;
        case 'minimax': 
        default: answer = await callMiniMax(prompt); break;
    }
    return { queryId, answer, model, processedAt: new Date().toISOString() };
}

async function handleImageAnalysis(imageUrl, queryId) {
    return { queryId, imageUrl, analysis: '[Vision] Image analysis coming soon', processedAt: new Date().toISOString() };
}

async function handleWebSearch(query, queryId) {
    return { queryId, query, results: `[Search] Results for: ${query}`, processedAt: new Date().toISOString() };
}

async function handleCodeReview(code, language, queryId) {
    const prompt = `Review this ${language || 'code'}:\n\n${code}`;
    const review = await callMiniMax(prompt);
    return { queryId, language, review, processedAt: new Date().toISOString() };
}

async function handleSummarize(text, queryId) {
    const prompt = `Summarize: ${text}`;
    const summary = await callMiniMax(prompt);
    return { queryId, summary, processedAt: new Date().toISOString() };
}

async function handleTranslate(text, targetLanguage, sourceLanguage, queryId) {
    const prompt = sourceLanguage ? `Translate from ${sourceLanguage} to ${targetLanguage}: ${text}` : `Translate to ${targetLanguage}: ${text}`;
    const translation = await callMiniMax(prompt);
    return { queryId, translation, targetLanguage, sourceLanguage: sourceLanguage || 'auto', processedAt: new Date().toISOString() };
}

async function handleImageGenerate(prompt, queryId) {
    return { queryId, prompt, imageUrl: '[Image gen] Coming soon', processedAt: new Date().toISOString() };
}

async function processQuery(prompt, model) {
    const result = await handleKaitoQuery(prompt, `q-${Date.now()}`, model);
    return result.answer;
}

// ========== AI API CALLS ==========

async function callGoogle(prompt) {
    const key = getGoogleKey();
    if (!key) return 'Google API not configured';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

async function callMiniMax(prompt) {
    const key = 'sk-cp-0j-9SlOUPBnSodqUUBt7biKNWmPHh0yPvwYFezVLf0DR_8be5p6-VET1PWFUKpK3KNscOdwIAGfZTQ-xoSpouTO1ddv6qkYVD7z0O7kg6cbzi6G8Mevm8Wg';
    const res = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
        method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'MiniMax-M2.5', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response';
}

async function callOpenRouter(prompt) {
    const key = getOpenRouterKey();
    if (!key) return 'OpenRouter not configured';
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://sand.gallery', 'X-Title': 'Kaito' },
        body: JSON.stringify({ model: 'google/gemini-2.0-flash-exp', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response';
}

async function callReplicate(prompt) {
    const key = getReplicateKey();
    if (!key) return 'Replicate not configured';
    const res = await fetch('https://api.replicate.com/v1/models/meta/llama-3.1-8b-instruct/predictions', {
        method: 'POST', headers: { 'Authorization': `Token ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { prompt } })
    });
    const data = await res.json();
    if (data.status === 'starting' || data.status === 'processing') {
        await new Promise(r => setTimeout(r, 3000));
    }
    return data.output || 'No response';
}

// ========== PAYMENT CHECK ==========

async function checkPayment(queryId, minAmount = '0.002') {
    try {
        const res = await fetch(`https://api.etherscan.io/api?module=account&action=tokentx&address=${PAYMENT_ADDRESS}&contractaddress=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&sort=desc&apikey=${BASESCAN_API_KEY}&chainid=8453`);
        const data = await res.json();
        if (data.status === '1' && data.result) {
            for (const tx of data.result) {
                const amount = parseFloat(tx.value) / 1e6;
                if (amount >= parseFloat(minAmount)) return { paid: true, txHash: tx.hash, amount };
            }
        }
    } catch (e) { console.log('Payment check error:', e.message); }
    return { paid: false };
}
