import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractTextFromPDF } from './utils/pdf'
import { generateQuiz } from './utils/quiz'
import { UploadZone } from './components/UploadZone'
import { GameInterface } from './components/GameInterface'
import { ResultsView } from './components/ResultsView'
import { Settings } from './components/Settings'
import { Settings as SettingsIcon } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [gameState, setGameState] = useState('upload') // upload, processing, quiz, results
  const [questions, setQuestions] = useState([])
  const [score, setScore] = useState({ totalScore: 0, correctCount: 0 })
  const [loading, setLoading] = useState(false)
  const [originalFile, setOriginalFile] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

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

      setQuestions(generatedQuestions)
      setGameState('quiz')
    } catch (error) {
      console.error(error)
      if (error.message === 'API_KEY_MISSING') {
        alert("Please set your Gemini API key in Settings to use AI extraction.")
        setShowSettings(true)
      } else {
        alert("Failed to parse PDF: " + error.message)
      }
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

      setQuestions(generatedQuestions)
      setGameState('quiz')
    } catch (error) {
      console.error(error)
      if (error.message === 'API_KEY_MISSING') {
        alert("Please set your Gemini API key in Settings to use AI extraction.")
        setShowSettings(true)
      } else {
        alert("Failed to parse text: " + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuizComplete = (scoreData) => {
    setScore(scoreData)
    setGameState('results')
  }

  const handleRetry = () => {
    setScore({ totalScore: 0, correctCount: 0 })
    setGameState('quiz')
  }

  const handleNewFile = () => {
    setScore({ totalScore: 0, correctCount: 0 })
    setQuestions([])
    setGameState('upload')
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <motion.h1
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="logo-title"
        >
          PDF<span className="highlight">Quiz</span>ify
        </motion.h1>

        <button
          className="settings-toggle"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <SettingsIcon size={24} />
        </button>
      </div>

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
            score={score.totalScore}
            correctCount={score.correctCount}
            totalQuestions={questions.length}
            history={score.history}
            onRetry={handleRetry}
            onNewFile={handleNewFile}
            key="results"
          />
        )}
      </AnimatePresence>

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <style>{`
                .app-header {
                    width: 100%;
                    max-width: 800px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .app-container {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding: 4rem 2rem;
                    overflow-y: auto;
                    box-sizing: border-box;
                    background: radial-gradient(circle at top center, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                }
                .logo-title {
                    font-size: 3rem;
                    margin: 0;
                    font-weight: 900;
                    letter-spacing: -2px;
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
                .settings-toggle {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-dim);
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .settings-toggle:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border-color: var(--primary);
                    transform: rotate(45deg);
                }
            `}</style>
    </div>
  )
}

export default App

