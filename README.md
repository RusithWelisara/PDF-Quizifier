# PDF Quiz Platform

A modern, gamified platform to turn PDF study materials into interactive quizzes instantly.

## 🚀 How to Run

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get a free Gemini API key:**
   - Visit https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy your API key

3. **Add your API key:**
   - Open `.env` file in the project root
   - Replace `VITE_GEMINI_API_KEY=` with `VITE_GEMINI_API_KEY=your_actual_key_here`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## How It Works

1. **Upload PDF** or **Paste Text** containing MCQs
2. **AI-Powered Extraction**: Gemini AI intelligently extracts questions, options, and answers
3. **Fallback Parsing**: If AI fails, regex-based parser attempts extraction
4. **Interactive Quiz**: Answer questions with real-time scoring and streak tracking

## 🎮 Features

-   **Instant PDF Parsing**: Drag and drop any text-based PDF.
-   **Gamified Quiz**: Score points, build streaks, and verify your knowledge.
-   **Local Processing**: Privacy-focused; files are processed in your browser.
-   **Responsive Design**: Works on desktop and mobile.

## 🛠 Tech Stack

-   **Frontend**: React + Vite
-   **Styling**: Vanilla CSS + Framer Motion (Animations)
-   **PDF Engine**: PDF.js
-   **Icons**: Lucide React
