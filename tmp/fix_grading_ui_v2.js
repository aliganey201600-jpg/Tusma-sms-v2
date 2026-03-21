const fs = require('fs');
const path = 'c:/Users/Dirie/Desktop/tusmo-sms/src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `                           <td className=\"px-4 py-4 text-center bg-blue-50/10 font-black text-blue-700 text-sm border-x border-blue-50/50\">
                              {student.quizTotal30 || \"0\"}
                           </td>
                           <td className=\"px-4 py-4 text-center bg-amber-50/10 font-black text-amber-700 text-sm border-r border-amber-50/50\">
                              {student.midterm || \"0\"}
                           </td>
                           <td className=\"px-4 py-4 text-center bg-emerald-50/10 font-black text-emerald-700 text-sm border-r border-emerald-50/50\">
                              {student.final || \"0\"}
                           </td>
                           <td className=\"px-6 py-4 text-center bg-indigo-50/20 shadow-sm\">
                              <div className={\`text-lg font-black \${student.grandTotal >= 50 ? 'text-slate-900' : 'text-rose-700'}\`}>
                                 {student.grandTotal}
                              </div>
                              <p className=\"text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1\">/ 100</p>
                           </td>`;

// Let's use a simpler line-based replacement
const lines = content.split('\n');
let newLines = [];
let found = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{student.average}%')) {
        // Backtrack to find the start of the td block
        // Assuming the td starts roughly 2-3 lines before
        let j = newLines.length - 1;
        while (j >= 0 && !newLines[j].includes('<td')) {
            newLines.pop();
            j--;
        }
        if (j >=0) newLines.pop(); // Remove the <td line itself
        
        newLines.push(replacement);
        
        // Skip until </td>
        while (i < lines.length && !lines[i].includes('</td>')) {
            i++;
        }
        found = true;
    } else {
        newLines.push(lines[i]);
    }
}

if (found) {
    fs.writeFileSync(path, newLines.join('\n'));
    console.log("Successfully updated the file!");
} else {
    console.log("Fata Error: Could not find student.average% line");
}
