/**
 * Polymarket Opportunity Scanner
 * Looks for mispriced markets — especially in 30-70% range where knowledge = edge
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'reports');
if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

async function apiGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

function parseOdds(p) {
  try {
    const x = JSON.parse(p);
    return { yes: (parseFloat(x[0])*100).toFixed(1), no: (parseFloat(x[1])*100).toFixed(1) };
  } catch { return { yes: '?', no: '?' }; }
}

function daysUntil(d) {
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

async function scan() {
  const markets = await apiGet('https://gamma-api.polymarket.com/markets?closed=false&limit=1000');
  const all = Array.isArray(markets) ? markets : (markets.markets || []);

  const now = new Date();
  const in60 = new Date(now.getTime() + 60*86400000);

  // Filter: 0-60 days, >$10k volume
  const candidates = all.filter(m => {
    const end = new Date(m.endDate);
    const vol = parseFloat(m.volume || 0);
    return end >= now && end <= in60 && vol > 10000;
  });

  candidates.sort((a, b) => parseFloat(b.volume || 0) - parseFloat(a.volume || 0));

  const interesting = [];
  const veryCheap = [];
  const weird = [];

  candidates.forEach(m => {
    const odds = parseOdds(m.outcomePrices);
    const yes = parseFloat(odds.yes);
    const no = parseFloat(odds.no);
    const vol = parseFloat(m.volume || 0);

    const entry = {
      question: m.question,
      slug: m.slug,
      yes, no,
      volK: (vol/1000).toFixed(0),
      daysLeft: daysUntil(m.endDate),
      endDate: m.endDate.split('T')[0],
      url: `https://polymarket.com/markets/${m.slug}`,
      category: m.category || 'Unknown'
    };

    if (yes >= 20 && yes <= 80) {
      interesting.push(entry);
    } else if (yes < 10 && yes > 0) {
      veryCheap.push(entry);
    }

    if ((yes > 95 || no > 95) && vol > 50000) {
      weird.push(entry);
    }
  });

  console.log('\n🔍 POLYMARKET OPPORTUNITY SCAN\n');
  console.log(`Total: ${all.length} | Near-term (60d, >$10k): ${candidates.length}\n`);

  // INTERESTING 20-80%
  console.log('━'.repeat(80));
  console.log('🎯 INTERESTING (20-80% range — knowledge can give edge)');
  console.log('━'.repeat(80));

  if (interesting.length === 0) {
    console.log('None found.\n');
  } else {
    interesting.slice(0, 50).forEach((m, i) => {
      const spread = Math.abs(m.yes - m.no).toFixed(0);
      console.log(`\n[${i+1}] ${m.question}`);
      console.log(`   ${m.yes}% YES / ${m.no}% NO | Spread: ${spread}pts | Vol: $${m.volK}k | ${m.daysLeft}d`);
      console.log(`   → ${m.url}`);
    });
    if (interesting.length > 50) console.log(`\n... +${interesting.length - 50} more`);
  }

  // LOTTERY TICKETS
  console.log('\n' + '━'.repeat(80));
  console.log('🎲 LOTTERY TICKETS (<10% YES — small bet, big upside)');
  console.log('━'.repeat(80));

  if (veryCheap.length === 0) {
    console.log('None found.\n');
  } else {
    veryCheap.sort((a, b) => parseFloat(b.volK) - parseFloat(a.volK));
    veryCheap.slice(0, 15).forEach((m, i) => {
      const mult = (100 / Math.max(parseFloat(m.yes), 0.1)).toFixed(0);
      console.log(`\n[${i+1}] ${m.question}`);
      console.log(`   YES: $${(parseFloat(m.yes)/100).toFixed(4)} → win $1 | Vol: $${m.volK}k | ${m.daysLeft}d`);
      console.log(`   → ${m.url}`);
    });
  }

  // BIG WEIRD MARKETS
  console.log('\n' + '━'.repeat(80));
  console.log('⚠️  HIGH-VOLUME EXTREME MARKETS (check resolution risk)');
  console.log('━'.repeat(80));

  if (weird.length === 0) {
    console.log('None found.\n');
  } else {
    weird.forEach((m, i) => {
      const side = m.yes > 95 ? 'YES' : 'NO';
      const pct = Math.max(m.yes, m.no);
      console.log(`\n[${i+1}] ${m.question}`);
      console.log(`   ${side}: ${pct}% | Vol: $${m.volK}k | ${m.daysLeft}d`);
      console.log(`   → ${m.url}`);
    });
  }

  const report = { scannedAt: new Date().toISOString(), interesting, veryCheap, weird };
  fs.writeFileSync(path.join(OUTPUT, `opportunities-${Date.now()}.json`), JSON.stringify(report, null, 2));
}

scan().catch(console.error);
