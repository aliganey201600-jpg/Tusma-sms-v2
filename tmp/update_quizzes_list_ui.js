const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldQuizzesHeader = `      {view === 'QUIZZES' && (
        <div className="space-y-6">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input 
                 placeholder="Search quiz title..." 
                 value={quizSearch}
                 onChange={(e) => setQuizSearch(e.target.value)}
                 className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium focus:border-emerald-500 transition-all shadow-sm"
              />
           </div>`;

const newQuizzesHeader = `      {view === 'QUIZZES' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
            {/* Subject Overview Header */}
            <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
               <div className="absolute top-0 right-0 h-full w-32 bg-emerald-600/5 -skew-x-12 translate-x-10" />
               <div className="flex items-center gap-6 relative">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
                     <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">{selectedCourse?.name}</h2>
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedCourse?.className} • Select a Quiz to Grade</p>
                  </div>
               </div>
               
               <div className="flex gap-4 relative">
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Total Quizzes</p>
                     <p className="text-2xl font-black text-slate-900 leading-none">{quizzes.length}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-100" />
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Students Enrolled</p>
                     <p className="text-2xl font-black text-slate-900 leading-none">{selectedCourse?.studentsCount || 0}</p>
                  </div>
               </div>
            </div>

            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
               <Input 
                  placeholder="Search quiz title..." 
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium focus:border-emerald-500 transition-all shadow-sm"
               />
            </div>`;

content = content.replace(oldQuizzesHeader, newQuizzesHeader);

fs.writeFileSync(path, content);
console.log('Quizzes list UI enhanced with a header!');
