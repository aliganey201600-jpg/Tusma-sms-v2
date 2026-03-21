const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Show exactly what's there around "const score = student.quizScores"
const idx = content.indexOf('const score = student.quizScores[quiz.id]');
const block = content.slice(idx - 100, idx + 600);
console.log(JSON.stringify(block));
