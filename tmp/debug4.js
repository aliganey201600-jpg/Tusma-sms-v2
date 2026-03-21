const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace by finding exact unique substring and replacing it
// The current code (from the fix_grading_ui_v2.js script) uses slightly different formatting
// Let's search for the score display part specifically

const searchStr = `const score = student.quizScores[quiz.id]`;

const idx = content.indexOf(searchStr);
if (idx === -1) {
  console.log('Not found! Available quizScores references:');
  const matches = [...content.matchAll(/quizScores/g)];
  matches.forEach(m => {
    console.log('  At pos', m.index, ':', content.slice(Math.max(0, m.index-30), m.index+60).replace(/\n/g,'\\n').replace(/\r/g,'\\r'));
  });
} else {
  console.log('Found at index:', idx);
  // Show surrounding context
  console.log('Context:\n', content.slice(idx-100, idx+500)
    .replace(/\r\n/g, '\n')
  );
}
