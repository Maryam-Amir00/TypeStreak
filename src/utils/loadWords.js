export async function loadWords() {
    try{
        const response = await fetch('/words.txt');
        const text = await response.text();
        return text.split(/\s+/);
    } catch (error) {
        console.error('Error loading words:', error);
        return [];
    }
}