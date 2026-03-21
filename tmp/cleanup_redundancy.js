const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// The block from 791 to 813 is redundant now that we have the stats bar
// Finding the redundant block
const redundantBlockRegex = /\{view === 'GRADEBOOK' && \(\s+<div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">[\s\S]*?Course Header Summary[\s\S]*?<\/div>\s+<\/div>/;

// Actually I'll just remove the middle part
const oldHeaderRegex = /\{view === 'GRADEBOOK' && \([\s\S]*?<div className="space-y-6[\s\S]*?\/\* Course Header Summary \*\/[\s\S]*?<div className="bg-white p-8[\s\S]*?<\/div>[\s\S]*?<\/div>/;

// Let's use a simpler match for the redundant part
const redundantPart = `            {/* Course Header Summary */}
            <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
               <div className="absolute top-0 right-0 h-full w-32 bg-indigo-600/5 -skew-x-12 translate-x-10" />
               <div className="flex items-center gap-6 relative">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                     <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">{selectedCourse?.name}</h2>
                     <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedCourse?.className} • MARK SHEET</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 relative">
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Quizzes</p>
                     <p className="text-2xl font-black text-slate-900 leading-none">{gradebookData.quizzes.length}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Students</p>
                     <p className="text-2xl font-black text-slate-900 leading-none">{gradebookData.gradebook.length}</p>
                  </div>
               </div>
            </div>`;

if (content.includes(redundantPart)) {
    content = content.replace(redundantPart, '');
    fs.writeFileSync(path, content);
    console.log('Redundant header removed!');
} else {
    // Try without CRLF
    const redundantPartLF = redundantPart.replace(/\r\n/g, '\n');
    if (content.includes(redundantPartLF)) {
        content = content.replace(redundantPartLF, '');
        fs.writeFileSync(path, content);
        console.log('Redundant header (LF) removed!');
    } else {
        console.log('Redundant header not found!');
    }
}
