const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

const idx = content.indexOf('const score = student.quizScores[quiz.id]');
const block = content.slice(idx - 100, idx + 700);

// Parse out exact block
const normalized = block;
process.stdout.write(normalized);
