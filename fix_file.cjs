
const fs = require('fs');
const path = 'functions/index.js';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n'); // Split by newline

// Keep lines 0 to 1005 (Total 1005 lines, index 0-1004? No, visual line 1005 is index 1004. slice(0, 1005) gives 0..1004)
// Verify line 1005 (index 1004) is "});"
if (lines[1004].trim() === '});') {
    const newContent = lines.slice(0, 1005).join('\n');
    fs.writeFileSync(path, newContent);
    console.log("File truncated successfully to 1005 lines.");
} else {
    console.error("Line 1005 is not '});':", lines[1004]);
    // Fallback: search for the second occurrence of "exports.aiWorker" ? No, risky.
    // Just log what it is.
}
