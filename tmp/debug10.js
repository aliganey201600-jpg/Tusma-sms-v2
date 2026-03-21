const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Show exact content around the quiz td block
const idx = content.indexOf('<td key={quiz.id} className="px-4 py-4 text-center">');
console.log('Block from td start:');
process.stdout.write(content.slice(idx, idx + 500));
