const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Print full lines 843-860 with char codes to debug
const lines = content.split('\n');
for (let i = 842; i < 862; i++) {
  const line = lines[i] || '';
  console.log(`LINE ${i+1} [${line.length} chars]:`, line.replace(/\r/g, '\\r'));
}
