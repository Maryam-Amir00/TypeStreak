import React, {useState , useEffect} from 'react'
import { loadWords } from '../utils/loadWords'

const TypingBox = () => {
    const [wordList , setWordList] = useState([]);
    const [loading , setLoading] = useState(true);

    useEffect(() => {
        loadWords()
        .then((words) => {
            const randomStart = Math.floor(Math.random() * (words.length - 1000));
            const selected = words.slice(randomStart, randomStart + 50);
            setWordList(selected);
            setLoading(false);
        }) .catch ((error) => {
           console.error("Error loading words:", error);
           setLoading(false);
        })
    }, []);

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4 text-center text-cyan-400'>TypeStreak</h1>
      <div className='bg-[#252526] text-[d4d4d4d] border border-[#333] p-6 rounded-lg shadow-md min-h-[150px] leading-relaxed text-lg '>
        {loading ? (
          <p className='text-gray-500'>Loading words...</p> 
        ) : (
          <p>{wordList.join(" ")}</p>
        )}
      </div>
    </div>
  )
}

export default TypingBox
