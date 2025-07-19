export function mutateWords(words, options) {
    const probability = 0.15;   
  
    return words.flatMap(word => {
      let modified = word;
      const output = [];
  
      if (options.capitalization && Math.random() < probability) {
        modified = modified.charAt(0).toUpperCase() + modified.slice(1).toLowerCase();
      }     
  
      if (options.punctuation && Math.random() < 0.08) {
        const punct = ['!','.', ',', '?'];
        modified += punct[Math.floor(Math.random() * punct.length)];
      }
  
      output.push(modified);
  
      if (options.numbers && Math.random() < probability) {
        const numberWord = Math.floor(10000 + Math.random() * 900000).toString();
        output.push(numberWord);
      }
  
      if (options.symbols && Math.random() < probability) {
        const symbols = ['@', '#', '$', '%', '&'];
        output.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
  
      return output;
    });
  }