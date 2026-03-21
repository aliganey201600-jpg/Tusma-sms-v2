const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file uses CRLF. We found the block start at 48985
// Now let's find the exact end of the quiz map block (looking for closing })} after the loop)
const blockStart = 48985;

// Find the closing pattern: three closing tags after the quizzes.map
// The block ends right before "{/* Breakdown */}" or "Quizzes 30%"
const endMarker = '{/* Breakdown */}';
const endMarkerAlt = '{/* Weighting breakdown */}';
const endIdx = content.indexOf(endMarker, blockStart);
const endIdxAlt = content.indexOf(endMarkerAlt, blockStart);

console.log('End markers:', endIdx, endIdxAlt);
console.log('Block around end:', JSON.stringify(content.slice(Math.max(0, Math.min(endIdx, endIdxAlt) - 20), Math.min(endIdx, endIdxAlt) + 50)));

// Show full block
const end = Math.min(endIdx === -1 ? Infinity : endIdx, endIdxAlt === -1 ? Infinity : endIdxAlt);
if (end !== Infinity) {
  const block = content.slice(blockStart, end);
  console.log('\n=== FULL QUIZ MAP BLOCK ===\n');
  process.stdout.write(block);
  console.log('\n=== END ===');
} else {
  // Try different end
  // The block ends with })} followed by another {/* comment
  const lines = content.split('\n');
  let inBlock = false;
  let lineStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const score = student.quizScores[quiz.id]')) {
      inBlock = true;
      lineStart = i - 1;
    }
    if (inBlock && lines[i].includes('/* Breakdown */')) {
      console.log('Found end at line', i+1);
      for (let j = lineStart; j < i; j++) {
        console.log(j+1, ':', lines[j]);
      }
      break;
    }
  }
}
