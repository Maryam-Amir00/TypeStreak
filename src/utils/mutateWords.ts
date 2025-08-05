type MutationOptions = {
  capitalization?: boolean;
  punctuation?: boolean;
  numbers?: boolean;
  symbols?: boolean;
};

export function mutateWords(words: string[], options: MutationOptions): string[] {
  const probability: number = 0.15;

  return words.flatMap((word: string): string[] => {
    let modified: string = word;
    const output: string[] = [];

    if (options.capitalization && Math.random() < probability) {
      modified = modified.charAt(0).toUpperCase() + modified.slice(1).toLowerCase();
    }

    if (options.punctuation && Math.random() < 0.08) {
      const punct: string[] = ['!', '.', ',', '?'];
      modified += punct[Math.floor(Math.random() * punct.length)];
    }

    output.push(modified);

    if (options.numbers && Math.random() < probability) {
      const numberWord: string = Math.floor(10000 + Math.random() * 900000).toString();
      output.push(numberWord);
    }

    if (options.symbols && Math.random() < probability) {
      const symbols: string[] = ['@', '#', '$', '%', '&'];
      output.push(symbols[Math.floor(Math.random() * symbols.length)] as string);
    }

    return output;
  });
}
