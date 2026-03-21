const fs = require('fs');
const path = 'c:/Users/Dirie/Desktop/tusmo-sms/src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<td className="px-6 py-4 text-center bg-indigo-50/30">
                             <div className={\`text-base font-black \${student.grandTotal >= 50 ? 'text-slate-900' : 'text-rose-700'}\`}>
                                {student.average}%
                             </div>
                           </td>`;

const replacement = `<td className="px-4 py-4 text-center bg-blue-50/10 font-black text-blue-700 text-sm border-x border-blue-50/50">
                              {student.quizTotal30 || "0"}
                           </td>
                           <td className="px-4 py-4 text-center bg-amber-50/10 font-black text-amber-700 text-sm border-r border-amber-50/50">
                              {student.midterm || "0"}
                           </td>
                           <td className="px-4 py-4 text-center bg-emerald-50/10 font-black text-emerald-700 text-sm border-r border-emerald-50/50">
                              {student.final || "0"}
                           </td>
                           <td className="px-6 py-4 text-center bg-indigo-50/20">
                              <div className={\`text-lg font-black \${student.grandTotal >= 50 ? 'text-slate-900' : 'text-rose-700'}\`}>
                                 {student.grandTotal}
                              </div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">/ 100</p>
                           </td>`;

if (content.includes('student.average%')) {
    // Try to find the encompassing td block
    const lines = content.split('\n');
    let newLines = [];
    for (let i=0; i<lines.length; i++) {
        if (lines[i].includes('student.average%')) {
            // Found it! Assuming it's the one in the matrix
            // Remove 1 line before and 1 line after (roughly)
            newLines.pop(); // Remove the <div... line
            newLines.pop(); // Remove the <td... line
            newLines.push(replacement);
            i += 1; // skip the next 1 line (</div> and </td>)
        } else {
            newLines.push(lines[i]);
        }
    }
    fs.writeFileSync(path, newLines.join('\n'));
    console.log("File updated via script");
} else {
    console.log("Could not find relevant string in file");
    // Print lines around 860 to see
    const lines = content.split('\n');
    console.log("Lines around 860:", lines.slice(855, 865).join('\n'));
}
