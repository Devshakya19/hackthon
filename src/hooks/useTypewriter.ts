import { useEffect, useState } from 'react'

export default function useTypewriter(words: string[], loop = true, speed = 120){
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(()=>{
    let timeout: any
    const current = words[wordIndex % words.length]
    if(!isDeleting){
      setText(current.slice(0, text.length + 1))
      timeout = setTimeout(()=>{
        if(text.length + 1 === current.length) setIsDeleting(true)
        else setText(current.slice(0, text.length + 1))
      }, speed)
    } else {
      timeout = setTimeout(()=>{
        if(text.length === 0){
          setIsDeleting(false)
          setWordIndex((w)=>w+1)
        } else {
          setText(current.slice(0, text.length -1))
        }
      }, speed/2)
    }
    return ()=> clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, isDeleting, wordIndex])

  return text
}
