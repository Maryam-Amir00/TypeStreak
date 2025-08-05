export async function loadWords(): Promise<string[]> {
    try{
        const response: Response = await fetch('/words.txt');
        const text: string = await response.text();
        return text.split(/\s+/);
    } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error loading words:', error.message);
        } else {
          console.error('Unknown error loading words');
        }
        return [];
      }
}