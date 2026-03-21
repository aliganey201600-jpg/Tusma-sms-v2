const fs = require('fs');
const path = 'src/components/dashboard/grading-interface.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update handleInputChange to auto-fill Somali remarks/feedback
const oldHandleInputChange = `  const handleInputChange = (idx: number, field: string, value: any) => {
    setEditedResults(prev => {
      const next = [...prev]
      let processedValue = value
      if (field === 'earned') processedValue = parseFloat(value) || 0
      next[idx] = { ...next[idx], [field]: processedValue }
      if (field === 'earned' && processedValue > 0) next[idx].isCorrect = true
      return next
    })
  }`;

const newHandleInputChange = `  const handleInputChange = (idx: number, field: string, value: any) => {
    setEditedResults(prev => {
      const next = [...prev]
      let processedValue = value
      if (field === 'earned') processedValue = parseFloat(value) || 0
      next[idx] = { ...next[idx], [field]: processedValue }
      
      // Auto-fill Somali Remarks if score changes and feedback is empty
      if (field === 'earned') {
        next[idx].isCorrect = processedValue > 0
        const total = next[idx].total || 1
        const pct = (processedValue / total) * 100
        
        if (!next[idx].feedback || next[idx].feedback === "" || 
            ["Aad u wanaagsan!", "Shaqo fiican!", "Aad u fiican!", "Waa dadaal fiican.", "Waa inaad dib u eegtaa Casharka.", "Dadaal dheeraad ah ayaad u baahantahay."].includes(next[idx].feedback)) {
           if (pct >= 90) next[idx].feedback = "Aad u wanaagsan! Sii soco dadaalka."
           else if (pct >= 80) next[idx].feedback = "Shaqo fiican! Aad baad u dadaashay."
           else if (pct >= 70) next[idx].feedback = "Aad u fiican! Wax yar oo saxid ah ayaad u baahantahay."
           else if (pct >= 60) next[idx].feedback = "Waa dadaal fiican. Wax ka baro khaladaadkaaga."
           else if (pct >= 50) next[idx].feedback = "Gudub macquul ah, laakiin u baahan in lagu noqdo casharka."
           else next[idx].feedback = "Dadaal dheeraad ah ayaad u baahantahay. Fadlan dib u eeg casharka."
        }
      }
      return next
    })
  }`;

content = content.replace(oldHandleInputChange, newHandleInputChange);

fs.writeFileSync(path, content);
console.log('Auto-fill Somali remarks successfully added!');
