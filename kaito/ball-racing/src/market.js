import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const MARKET_DIR = 'kaito/ball-racing/pending-markets/';

// Calculate implied probabilities from AI params with noise
function calculateOdds(balls) {
  const scores = balls.map(ball => {
    const { topSpeed, acceleration, cornering } = ball.aiParams;
    return topSpeed * 0.4 + acceleration * 0.3 + cornering * 0.3;
  });

  // Add noise (10-15% variance)
  const noisyScores = scores.map((s, i) => {
    const noise = (Math.sin(Date.now() + i * 7) * 0.5 + 0.5) * 0.3 + 0.85;
    return s * noise;
  });

  // Convert to probabilities
  const total = noisyScores.reduce((a, b) => a + b, 0);
  const prices = noisyScores.map(s => (s / total).toFixed(2));

  // Ensure they sum to ~1.00
  const sum = prices.reduce((a, b) => a + parseFloat(b), 0);
  if (Math.abs(sum - 1.0) > 0.05) {
    const factor = 1.0 / sum;
    return prices.map(p => (parseFloat(p) * factor).toFixed(2));
  }

  return prices;
}

// Generate track name from seed
function generateTrackName(seed) {
  const prefixes = ['Neon', 'Cyber', 'Quantum', 'Flux', 'Apex', 'Hyper', 'Turbo', 'Sonic'];
  const suffixes = ['Circuit', 'Loop', 'Ring', 'Track', 'Orbit', 'Grid', 'Wave'];

  const pIdx = Math.abs(Math.sin(seed * 1.7).toString().slice(-1)) % prefixes.length;
  const sIdx = Math.abs(Math.sin(seed * 2.3).toString().slice(-1)) % suffixes.length;

  return prefixes[pIdx] + ' ' + suffixes[sIdx];
}

export async function generateMarketPayload(raceResult) {
  const { raceId, timestamp, trackSeed, balls, winner, track, replayUrl } = raceResult;

  const trackName = generateTrackName(trackSeed);
  const odds = calculateOdds(balls);

  const raceDate = new Date(timestamp);
  const marketEndDate = new Date(raceDate.getTime() + 2 * 60 * 60 * 1000);

  const dateStr = raceDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const payload = {
    question: 'Which ball wins the ' + trackName + ' race on ' + dateStr + '?',
    description: '3D physics ball racing championship. Watch the replay: ' + (replayUrl || 'Pending upload') + ' | 3 balls compete on a procedurally generated circuit. First to complete the lap wins.',
    outcomes: balls.map(b => b.name),
    outcomePrices: odds,
    endDate: marketEndDate.toISOString(),
    marketType: 'categorical',
    raceId,
    trackName,
    trackSeed,
    timestamp: timestamp.toISOString(),
    winner: winner ? winner.name : null,
    replayUrl: replayUrl || null,
    ballDetails: balls.map((b, i) => ({
      name: b.name,
      color: '#' + b.mesh.material.color.getHexString(),
      odds: odds[i],
      aiParams: b.aiParams
    }))
  };

  return payload;
}

export async function saveMarketPayload(payload, outputDir = MARKET_DIR) {
  const raceId = payload.raceId;
  const filePath = outputDir + raceId + '.json';

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  await writeFile(filePath, JSON.stringify(payload, null, 2));

  return filePath;
}

export async function createMarketPayload(raceResult, outputDir = MARKET_DIR) {
  const payload = await generateMarketPayload(raceResult);
  const filePath = await saveMarketPayload(payload, outputDir);

  return {
    payload,
    filePath
  };
}
