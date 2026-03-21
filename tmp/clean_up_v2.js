const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Delete lines by finding exactly where the redundant part is
// Line 791 starts with <div className="bg-white p-8 rounded-[2rem]
// Line 813 ends the block

const startIdx = lines.findIndex(l => l.includes('<div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">'));
if (startIdx !== -1) {
    // Look forward for the next gap-6 header
    const nextHeaderIdx = lines.findIndex((l, i) => i > startIdx && l.includes('flex flex-col md:flex-row justify-between items-start md:items-center gap-6'));
    if (nextHeaderIdx !== -1) {
        // Delete everything between startIdx and nextHeaderIdx
        lines.splice(startIdx, nextHeaderIdx - startIdx);
        fs.writeFileSync(path, lines.join('\n'));
        console.log(`Deleted ${nextHeaderIdx - startIdx} lines starting from line ${startIdx + 1}`);
    } else {
        console.log('Next header not found!');
    }
} else {
    console.log('Start of redundant part not found!');
}
