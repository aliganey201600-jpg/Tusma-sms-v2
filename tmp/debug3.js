const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');
// Gather quiz map block lines 843-858
for (let i = 842; i < 880; i++) {
  const line = lines[i] || '';
  process.stdout.write(`L${i+1}: ${line}\n`);
}
