const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add bulkUpdateQuizScores to imports
if (!content.includes('bulkUpdateQuizScores')) {
    content = content.replace('getBulkReportData\r\n} from "@/app/dashboard/admin/grading/actions"', 'getBulkReportData,\r\n  bulkUpdateQuizScores\r\n} from "@/app/dashboard/admin/grading/actions"');
    content = content.replace('getBulkReportData\n} from "@/app/dashboard/admin/grading/actions"', 'getBulkReportData,\n  bulkUpdateQuizScores\n} from "@/app/dashboard/admin/grading/actions"');
}

// 2. Add bulk import logic (State and Handler) inside GradingInterfaceContent
const stateInsertionPoint = 'const [submissionSearch, setSubmissionSearch] = React.useState("")';
const bulkImportCode = `  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBulkImportMarks = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedQuiz) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        const updates = data.map(row => {
          const studentId = row["ID Number"] || row["Student ID"] || row["id"];
          const earned = parseFloat(row["Marks"] || row["Earned"] || row["Score"] || 0);
          const total = parseFloat(row["Max Marks"] || row["Total"] || 100);
          return { studentId: String(studentId), earned, total };
        }).filter(u => u.studentId);

        if (updates.length > 0) {
          const res = await bulkUpdateQuizScores(selectedQuiz.id, updates);
          if (res.success) {
            toast.success(\`Successfully imported \${res.count} scores!\`);
            // Refresh submissions
            if (selectedCourse) {
               const subs = await getQuizSubmissions(selectedQuiz.id);
               setSubmissions(subs);
            }
          } else {
            toast.error(res.error || "Bulk import failed");
          }
        }
      } catch (err) {
        toast.error("Error reading file");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
`;

if (!content.includes('handleBulkImportMarks')) {
    content = content.replace(stateInsertionPoint, bulkImportCode + '\n  ' + stateInsertionPoint);
}

// 3. Update SUBMISSIONS view header with Stats and Import button
const oldSubmissionsHeader = `      {view === 'SUBMISSIONS' && (
        <div className="space-y-6">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input 
                 placeholder="Search student by name or ID..." 
                 value={submissionSearch}
                 onChange={(e) => setSubmissionSearch(e.target.value)}
                 className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium focus:border-indigo-500 transition-all shadow-sm"
              />
           </div>`;

const newSubmissionsHeader = `      {view === 'SUBMISSIONS' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
            {/* Header with Stats */}
            <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
               <div className="absolute top-0 right-0 h-full w-32 bg-indigo-600/5 -skew-x-12 translate-x-10" />
               <div className="flex items-center gap-6 relative">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                     <FileText className="h-8 w-8" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">{selectedQuiz?.title}</h2>
                     <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedCourse?.name} • Submission Hub</p>
                  </div>
               </div>
               
               <div className="flex gap-3 relative">
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Submissions</p>
                     <p className="text-2xl font-black text-slate-900 leading-none">{submissions.length}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Average Score</p>
                     <p className="text-2xl font-black text-indigo-600 leading-none">
                       {submissions.length > 0 ? (submissions.reduce((a, b) => a + parseFloat(b.score), 0) / submissions.length).toFixed(1) : "0"}%
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="relative group flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input 
                     placeholder="Search student by name or ID..." 
                     value={submissionSearch}
                     onChange={(e) => setSubmissionSearch(e.target.value)}
                     className="pl-12 h-12 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-indigo-500 transition-all shadow-sm"
                  />
               </div>
               <div className="flex gap-2 w-full md:w-auto">
                 <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1 md:flex-none h-12 px-6 rounded-xl border-slate-200 bg-white shadow-sm font-black text-xs uppercase tracking-widest gap-2">
                    <Upload className="h-4 w-4" /> Import Marks
                 </Button>
                 <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkImportMarks} />
               </div>
            </div>`;

content = content.replace(oldSubmissionsHeader, newSubmissionsHeader);

fs.writeFileSync(path, content);
console.log('Submissions UI enhanced and Bulk Import added!');
