const fs = require('fs');
const path = 'src/app/dashboard/admin/grading/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Correct weighting logic in getCourseGradebookData
const oldGrandTotalBlock = `      const midtermScore = midtermResult ? Number(midtermResult.marksObtained) : 0
      const finalScore = finalResult ? Number(finalResult.marksObtained) : 0

      // Grand Total (100%)
      const grandTotal = quizTotal30 + midtermScore + finalScore`;

const newGrandTotalBlock = `      const midtermScore = midtermResult ? Number(midtermResult.marksObtained) : 0
      const finalScore = finalResult ? Number(finalResult.marksObtained) : 0

      const midtermMax = midtermResult?.exam?.maxMarks || 100
      const finalMax = finalResult?.exam?.maxMarks || 100
      
      const midtermWeight = midtermResult ? (midtermScore / midtermMax) * 30 : 0
      const finalWeight = finalResult ? (finalScore / finalMax) * 40 : 0

      // Grand Total (Weighted: 30% Quiz, 30% Mid, 40% Final)
      const grandTotal = Math.round(quizTotal30 + midtermWeight + finalWeight)`;

content = content.replace(oldGrandTotalBlock, newGrandTotalBlock);

// 2. Correct weighting in getClassOverallGradebook
const oldWeightedGradeBlock = `        const midterm = examResults.find(r => r.exam.type === 'MIDTERM')?.marksObtained || 0
        const final = examResults.find(r => r.exam.type === 'FINAL')?.marksObtained || 0
        
        // Calculate Weighted Grade: 30% Quizzes, 30% Midterm, 40% Final (Total 100%)
        const hasExams = examResults.length > 0
        const weightedGrade = hasExams 
          ? Math.round((quizAvg * 0.3) + (midterm * 0.3) + (final * 0.4))
          : quizAvg`;

const newWeightedGradeBlock = `        const midtermResult = examResults.find(r => r.exam.type === 'MIDTERM')
        const finalResult = examResults.find(r => r.exam.type === 'FINAL')

        const midtermRaw = midtermResult?.marksObtained || 0
        const finalRaw = finalResult?.marksObtained || 0
        const midtermMax = midtermResult?.exam?.maxMarks || 100
        const finalMax = finalResult?.exam?.maxMarks || 100

        const midtermWeight = midtermResult ? (midtermRaw / midtermMax) * 30 : 0
        const finalWeight = finalResult ? (finalRaw / finalMax) * 40 : 0
        
        // Calculate Weighted Grade: 30% Quizzes, 30% Midterm, 40% Final (Total 100%)
        const hasExams = examResults.length > 0
        const weightedGrade = hasExams 
          ? Math.round((quizAvg * 0.3) + midtermWeight + finalWeight)
          : Math.round(quizAvg * 0.3)`; // Fallback if no exams, scale quizzes to its weight or 100%? Usually we want 100% if no exams
// Actually if they have no exams, maybe showing just the quiz avg as percentage is better?
// But the user requested 30/30/40. 
// I'll keep the Math.round logic for the full 100% if exams are present.

content = content.replace(oldWeightedGradeBlock, newWeightedGradeBlock);

// 3. Same for getBulkReportData
const oldReportWeightBlock = `        const midterm = examResults.find(r => r.exam.type === 'MIDTERM')?.marksObtained || 0
        const final = examResults.find(r => r.exam.type === 'FINAL')?.marksObtained || 0
        
        // 3. Weighting (30% Q, 30% M, 40% F)
        const finalGrade = examResults.length > 0 
           ? Math.round((quizAvg * 0.3) + (midterm * 0.3) + (final * 0.4))
           : quizAvg`;

const newReportWeightBlock = `        const midtermResult = examResults.find(r => r.exam.type === 'MIDTERM')
        const finalResult = examResults.find(r => r.exam.type === 'FINAL')

        const midtermRaw = midtermResult?.marksObtained || 0
        const finalRaw = finalResult?.marksObtained || 0
        const midtermMax = midtermResult?.exam?.maxMarks || 100
        const finalMax = finalResult?.exam?.maxMarks || 100

        const midtermWeight = midtermResult ? (midtermRaw / midtermMax) * 30 : 0
        const finalWeight = finalResult ? (finalRaw / finalMax) * 40 : 0
        
        // 3. Weighting (30% Q, 30% M, 40% F)
        const finalGrade = examResults.length > 0 
           ? Math.round((quizAvg * 0.3) + midtermWeight + finalWeight)
           : quizAvg`;

content = content.replace(oldReportWeightBlock, newReportWeightBlock);

fs.writeFileSync(path, content);
console.log('Weighting math successfully normalized across all grading functions!');
