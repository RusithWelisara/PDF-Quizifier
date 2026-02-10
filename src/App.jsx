import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadPage } from './components/UploadPage'
import { BrowsePage } from './components/BrowsePage'
import { Settings as SettingsIcon, LayoutGrid, Upload } from 'lucide-react'
import { Settings } from './components/Settings'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [currentPage, setCurrentPage] = useState('upload') // 'upload' | 'browse'
  const [showSettings, setShowSettings] = useState(false)

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

        {/* Main Navigation */}
        <div className="main-nav">
          <button
            className={`nav-btn ${currentPage === 'upload' ? 'active' : ''}`}
            onClick={() => setCurrentPage('upload')}
          >
            <Upload size={18} /> Upload
          </button>
          <button
            className={`nav-btn ${currentPage === 'browse' ? 'active' : ''}`}
            onClick={() => setCurrentPage('browse')}
          >
            <LayoutGrid size={18} /> Browse
          </button>
        </div>

        <button
          className="settings-toggle"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <SettingsIcon size={24} />
        </button>
      </div>

      <AnimatePresence mode='wait'>
        {currentPage === 'upload' ? (
          <motion.div
            key="upload-page"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <UploadPage />
          </motion.div>
        ) : (
          <motion.div
            key="browse-page"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <BrowsePage />
          </motion.div>
        )}
      </AnimatePresence>

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <style>{`
        .app-header {
            width: 100%;
            max-width: 900px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
            position: relative;
            z-index: 100;
        }
        .main-nav {
            display: flex;
            background: rgba(255, 255, 255, 0.05);
            padding: 0.3rem;
            border-radius: 99px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .nav-btn {
            background: transparent;
            border: none;
            color: var(--text-dim);
            padding: 0.6rem 1.2rem;
            border-radius: 99px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }
        .nav-btn.active {
            background: var(--surface);
            color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .nav-btn:hover:not(.active) {
            color: white;
        }

        .app-container {
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 2rem;
            overflow-y: auto;
            box-sizing: border-box;
            background: radial-gradient(circle at top center, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
        }
        .logo-title {
            font-size: 2rem;
            margin: 0;
            font-weight: 900;
            letter-spacing: -1px;
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
            width: 40px;
            height: 40px;
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
