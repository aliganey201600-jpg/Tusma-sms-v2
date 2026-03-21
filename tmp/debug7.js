const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Do the replacement using string manipulation
// Find the block from "gradebookData.quizzes.map(quiz => {" to the end of the closing })}

const startMarker = '{gradebookData.quizzes.map(quiz => {\r\n                             const score = student.quizScores[quiz.id]';
const startIdx = content.indexOf(startMarker);

if (startIdx === -1) {
  // Try LF version
  const startMarkerLF = '{gradebookData.quizzes.map(quiz => {\n                             const score = student.quizScores[quiz.id]';
  const startIdxLF = content.indexOf(startMarkerLF);
  console.log('LF version found at:', startIdxLF);
} else {
  console.log('CRLF version found at:', startIdx);
}

// Manual approach: find start and end positions
const blockStart = content.indexOf('{gradebookData.quizzes.map(quiz =>\u003e {\r\n');
const blockStart2 = content.indexOf('{gradebookData.quizzes.map(quiz =>');
console.log('blockStart positions:', blockStart, blockStart2);

// Show exact chars at position
const chars = content.slice(content.indexOf('quizzes.map(quiz'), content.indexOf('quizzes.map(quiz') + 5);
console.log('Chars:', [...chars].map(c => c.charCodeAt(0)));
