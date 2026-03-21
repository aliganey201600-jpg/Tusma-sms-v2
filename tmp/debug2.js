const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Print full lines 843-860 with char codes to debug
const lines = content.split('\n');
const target = lines.slice(842, 862).join('\n');
console.log('=== FULL BLOCK ===');
console.log(target);
console.log('=== END BLOCK ===');
