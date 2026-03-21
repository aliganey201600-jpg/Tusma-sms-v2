const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Simple targeted approach - just find and replace the score display
// The exact issue: score is now an object { earned, total, score } not a number
// So score >= 70 won't work
// We need to replace the render logic inside the quiz.map block

const oldRender = `                                 <td key={quiz.id} className="px-4 py-4 text-center">
                                    {score !== null ? (
                                       <div className="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-slate-100 shadow-sm min-w-[60px]">
                                          <p className={\`text-xs font-black \${score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'}\`}>
                                             {score}%
                                          </p>
                                       </div>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-300">N/A</span>
                                    )}
                                 </td>`;

// Find any substring that exists in the file
const checkParts = [
  '<td key={quiz.id} className="px-4 py-4 text-center">',
  'score >= 70',
  '{score}%',
  'text-slate-300">N/A</span>',
  'text-[10px] font-bold text-slate-300'
];

checkParts.forEach(p => {
  const idx = content.indexOf(p);
  console.log(`"${p.slice(0,40)}" found at:`, idx);
});
