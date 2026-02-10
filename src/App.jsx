import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractTextFromPDF } from './utils/pdf'
import { generateQuiz } from './utils/quiz'
import { UploadZone } from './components/UploadZone'
import { GameInterface } from './components/GameInterface'
import { ResultsView } from './components/ResultsView'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [gameState, setGameState] = useState('upload') // upload, processing, quiz, results
  const [questions, setQuestions] = useState([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [originalFile, setOriginalFile] = useState(null)

  const handleFileSelected = async (file) => {
    setLoading(true)
    setOriginalFile(file)
    try {
      const text = await extractTextFromPDF(file)
      const generatedQuestions = await generateQuiz(text)

      if (generatedQuestions[0]?.id === "failed") {
        alert(generatedQuestions[0].question)
        setLoading(false)
        return
      }

      if (generatedQuestions.length === 0) {
        alert("No questions found. Please check your PDF content.")
        setLoading(false)
        return
      }

      setQuestions(generatedQuestions)
      setGameState('quiz')
    } catch (error) {
      console.error(error)
      alert("Failed to parse PDF: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTextSubmit = async (text) => {
    setLoading(true)
    try {
      const generatedQuestions = await generateQuiz(text)

      if (generatedQuestions[0]?.id === "failed") {
        alert(generatedQuestions[0].question)
        setLoading(false)
        return
      }

      if (generatedQuestions.length === 0) {
        alert("No questions found. Please check your text format.")
        setLoading(false)
        return
      }

      setQuestions(generatedQuestions)
      setGameState('quiz')
    } catch (error) {
      console.error(error)
      alert("Failed to parse text: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuizComplete = (finalScore) => {
    setScore(finalScore)
    setGameState('results')
  }

  const handleRetry = () => {
    setScore(0)
    setGameState('quiz')
  }

  const handleNewFile = () => {
    setScore(0)
    setQuestions([])
    setGameState('upload')
  }

  return (
    <div className="app-container">
      <motion.h1
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="logo-title"
      >
        PDF<span className="highlight">Quiz</span>ify
      </motion.h1>

      <AnimatePresence mode='wait'>
        {gameState === 'upload' && (
          <UploadZone
            onFileSelected={handleFileSelected}
            onTextSubmit={handleTextSubmit}
            isLoading={loading}
            key="upload"
          />
        )}
        {gameState === 'quiz' && (
          <GameInterface questions={questions} onComplete={handleQuizComplete} key="quiz" />
        )}
        {gameState === 'results' && (
          <ResultsView
            score={score}
            totalQuestions={questions.length}
            onRetry={handleRetry}
            onNewFile={handleNewFile}
            key="results"
          />
        )}
      </AnimatePresence>

      <style>{`
                .app-container {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding: 4rem 2rem;
                    overflow: hidden;
                    box-sizing: border-box;
                    background: radial-gradient(circle at top center, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                }
                .logo-title {
                    font-size: 3rem;
                    margin-bottom: 3rem;
                    font-weight: 900;
                    letter-spacing: -2px;
                    text-align: center;
                    background: linear-gradient(to bottom, #fff, #9ca3af);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .highlight {
                    color: var(--primary);
                    background: linear-gradient(to bottom, #818cf8, #6366f1);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
    </div>
  )
}

export default App

