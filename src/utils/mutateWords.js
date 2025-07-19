export function mutateWords(words, options) {
    const probability = 0.3;
  
    return words.flatMap(word => {
      let modified = word;
      const output = [];
  
      if (options.capitalization) {
        const capType = Math.random() > probability ? 'upper' : 'first';
        modified = capType === 'upper'
          ? modified.toUpperCase()
          : modified.charAt(0).toUpperCase() + modified.slice(1);
      }
  
      if (options.punctuation && Math.random() < probability) {
        const punct = ['!','.', ','];
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