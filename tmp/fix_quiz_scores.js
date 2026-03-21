const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find and replace the quiz score block
const oldBlock = `{gradebookData.quizzes.map(quiz => {
                              const score = student.quizScores[quiz.id]
                              return (
                                 <td key={quiz.id} className="px-4 py-4 text-center">
                                    {score !== null ? (
                                       <span className={\`text-[11px] font-black \${score >= 70 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}\`}>
                                          {score}%
                                       </span>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-200">—</span>
                                    )}
                                 </td>
                              )
                           })}`;

const newBlock = `{gradebookData.quizzes.map(quiz => {
                              const scoreData = student.quizScores[quiz.id]
                              const pct = scoreData ? scoreData.score : null
                              return (
                                 <td key={quiz.id} className="px-3 py-4 text-center">
                                    {scoreData ? (
                                       <div className="flex flex-col items-center gap-0.5">
                                          <span className={\`text-xs font-black \${pct! >= 70 ? 'text-emerald-600' : pct! >= 50 ? 'text-amber-500' : 'text-rose-600'}\`}>
                                             {scoreData.earned}<span className="text-slate-300 font-bold">/{scoreData.total}</span>
                                          </span>
                                          <span className="text-[8px] font-bold text-slate-300">{Math.round(pct!)}%</span>
                                       </div>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-200">—</span>
                                    )}
                                 </td>
                              )
                           })}`;

// Try both CRLF and LF versions
if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(path, content);
  console.log('SUCCESS: Replaced with LF match');
} else {
  // Try to find what's actually there
  const lines = content.split('\n');
  for (let i = 842; i < 862; i++) {
    console.log(i+1, ':', lines[i]);
  }
  console.log('FAILED: Could not find block');
}
