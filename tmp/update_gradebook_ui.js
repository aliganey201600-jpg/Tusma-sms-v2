const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Icons & XLSX imports
if (!content.includes('import * as XLSX')) {
    content = content.replace('Printer\r\n} from "lucide-react"', 'Printer,\r\n  Download,\r\n  Upload,\r\n  MoreVertical,\r\n  FileSpreadsheet,\r\n  TrendingUp,\r\n  X\r\n} from "lucide-react"\r\nimport * as XLSX from "xlsx"\r\nimport {\r\n  DropdownMenu,\r\n  DropdownMenuContent,\r\n  DropdownMenuItem,\r\n  DropdownMenuLabel,\r\n  DropdownMenuSeparator,\r\n  DropdownMenuTrigger\r\n} from "@/components/ui/dropdown-menu"');
    
    content = content.replace('Printer\n} from "lucide-react"', 'Printer,\n  Download,\n  Upload,\n  MoreVertical,\n  FileSpreadsheet,\n  TrendingUp,\n  X\n} from "lucide-react"\nimport * as XLSX from "xlsx"\nimport {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuLabel,\n  DropdownMenuSeparator,\n  DropdownMenuTrigger\n} from "@/components/ui/dropdown-menu"');
}

// 2. Update Gradebook Header & Stats Bar
const oldViewHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">\r\n               <div className="relative group w-full md:max-w-md">\r\n                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />\r\n                  <input \r\n                     placeholder="Search student..." \r\n                     value={submissionSearch}\r\n                     onChange={(e) => setSubmissionSearch(e.target.value)}\r\n                     className="pl-12 h-12 w-full bg-white border-2 border-slate-100 rounded-xl text-sm font-medium focus:border-indigo-500 transition-all shadow-sm outline-none" \r\n                  />\r\n               </div>\r\n               <div className="flex gap-3">\r\n                 <Button onClick={() => navigateToClassReport(selectedCourse.classId)} variant="outline" className="h-12 rounded-xl border-indigo-100 text-indigo-600 gap-2 font-black text-xs uppercase tracking-widest bg-indigo-50/50 hover:bg-indigo-100 shadow-sm"><Users className="h-4 w-4" />All Subjects Marksheet</Button>\r\n                 <Button onClick={() => window.print()} variant="outline" className="h-12 rounded-xl border-slate-200 gap-2 font-black text-xs uppercase tracking-widest bg-white shadow-sm"><Printer className="h-4 w-4" />Print / Save PDF</Button>\r\n               </div>\r\n            </div>`;

// Since it's hard to match exactly, I'll search for key landmarks
// Finding Search bar block
const searchBarBlockRegex = /<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">[\s\S]*?Search student\.\.\.[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const newHeaderAndStats = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="flex-1">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                   {selectedCourse.name}
                 </h2>
                 <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
                   <Users className="h-3 w-3 text-indigo-500" />
                   Class Management • Gradebook Matrix
                 </p>
               </div>
               
               <div className="flex gap-3 w-full md:w-auto">
                 <div className="relative group flex-1 md:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                       placeholder="Filter students..." 
                       value={submissionSearch}
                       onChange={(e) => setSubmissionSearch(e.target.value)}
                       className="pl-10 h-11 w-full bg-white border-2 border-slate-100 rounded-xl text-xs font-bold focus:border-indigo-500 transition-all shadow-sm outline-none"
                    />
                 </div>

                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-200 bg-white shadow-sm font-black text-[10px] uppercase tracking-[0.1em] gap-2">
                        <MoreVertical className="h-4 w-4" />
                        Actions
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-slate-100">
                     <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Data Operations</DropdownMenuLabel>
                     <DropdownMenuItem 
                        onClick={() => {
                          const data = gradebookData.gradebook.map(s => {
                            const row = {
                              "Student Name": s.name,
                              "ID Number": s.manualId || s.studentId,
                              "Quiz Total (30%)": s.quizTotal30,
                              "Midterm": s.midterm,
                              "Final Exam": s.final,
                              "Grand Total (100%)": s.grandTotal
                            };
                            gradebookData.quizzes.forEach(q => {
                              const score = s.quizScores[q.id];
                              row[q.title] = score ? \`\${score.earned}/\${score.total} (\${Math.round(score.score)}%)\` : "N/A";
                            });
                            return row;
                          });
                          const ws = XLSX.utils.json_to_sheet(data);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, "Gradebook");
                          XLSX.writeFile(wb, \`\${selectedCourse.name}_Gradebook.xlsx\`);
                        }}
                        className="rounded-xl cursor-pointer py-3 text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800"
                     >
                       <Download className="mr-2 h-4 w-4" />
                       <span className="font-bold">Export to Excel</span>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => toast.info("Import is available in the Exams section for Midterm/Final results.")} className="rounded-xl cursor-pointer py-3 text-blue-700 focus:bg-blue-50 focus:text-blue-800">
                       <Upload className="mr-2 h-4 w-4" />
                       <span className="font-bold">Bulk Import Marks</span>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator className="my-2" />
                     <DropdownMenuItem onClick={() => window.print()} className="rounded-xl cursor-pointer py-3">
                       <Printer className="mr-2 h-4 w-4 text-slate-500" />
                       <span className="font-bold">Print Gradebook</span>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator className="my-2" />
                     <DropdownMenuItem onClick={() => setView('COURSES')} className="rounded-xl cursor-pointer py-3 text-rose-600 focus:bg-rose-50">
                       <RotateCcw className="mr-2 h-4 w-4" />
                       <span className="font-bold">Discard & Back</span>
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const total = gradebookData.gradebook.length;
                const avg = total > 0 ? (gradebookData.gradebook.reduce((a, b) => a + (b.grandTotal || 0), 0) / total).toFixed(1) : "0";
                const pass = gradebookData.gradebook.filter(s => s.grandTotal >= 50).length;
                const passPct = total > 0 ? ((pass / total) * 100).toFixed(0) : "0";
                const topScore = total > 0 ? Math.max(...gradebookData.gradebook.map(s => s.grandTotal || 0)) : 0;
                
                return (
                  <React.Fragment>
                    {[
                      { label: "Total Students", value: total, icon: Users, color: "bg-blue-50 text-blue-600" },
                      { label: "Class Average", value: \`\${avg}%\`, icon: TrendingUp, color: "bg-indigo-50 text-indigo-600" },
                      { label: "Top Performer", value: \`\${topScore}/100\`, icon: GraduationCap, color: "bg-amber-50 text-amber-600" },
                      { label: "Pass Rate", value: \`\${passPct}%\`, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" }
                    ].map((stat, i) => (
                      <Card key={i} className="border-none shadow-sm rounded-3xl bg-white/50 backdrop-blur-sm px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={stat.color + " h-10 w-10 rounded-xl flex items-center justify-center"}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 leading-none mt-0.5">{stat.value}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </React.Fragment>
                );
              })()}
            </div>`;

content = content.replace(searchBarBlockRegex, newHeaderAndStats);

fs.writeFileSync(path, content);
console.log('Gradebook UI successfully enhanced!');
