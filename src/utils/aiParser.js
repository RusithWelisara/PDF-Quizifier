import { GoogleGenerativeAI } from '@google/generative-ai';

// Function to get the current API key
const getApiKey = () => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Check if key is valid (not empty, not default placeholder)
    const isValid = (key) => {
        if (!key) return false;
        const trimmed = key.trim();
        return trimmed !== '' && trimmed !== 'YOUR_API_KEY_HERE';
    };

    if (isValid(savedKey)) return savedKey;
    if (isValid(envKey)) return envKey;
    return null;
};

let genAI = new GoogleGenerativeAI(getApiKey() || 'DUMMY_KEY');

// Listen for custom event to update the instance
window.addEventListener('api-key-updated', () => {
    const key = getApiKey();
    console.log("AI Parser: API Key updated, re-initializing GenAI...");
    genAI = new GoogleGenerativeAI(key);
});

export async function extractMCQsWithAI(text) {
    try {
        const apiKey = getApiKey();
        console.log("=== Using AI to extract MCQs ===");
        console.log("API Key present:", !!apiKey);
        console.log("Text length:", text.length);

        if (!apiKey) {
            throw new Error("API_KEY_MISSING");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert at extracting multiple choice questions from text. 

Given the following text, extract ALL multiple choice questions and format them as a JSON array.

Each question MUST have these exact fields:
- id: question number (1, 2, 3, etc.)
- question: the full question text
- options: array of exactly 4 option texts (ONLY the text, remove any numbering like (1), (2), a), b), etc.)
- answer: the CORRECT ANSWER text (must be the EXACT text of one of the options)

CRITICAL RULES:
1. Extract ONLY actual questions and options - ignore headers, instructions, page numbers
2. Remove ALL numbering/letters from options - just the text
3. The "answer" field is MANDATORY - you MUST identify the correct answer
4. If the correct answer is marked in the text (e.g., with *, or in an answer key), use that
5. If no answer is marked, use your knowledge to determine the correct answer
6. The answer MUST match one of the options EXACTLY (same text)
7. Return ONLY valid JSON, no markdown code blocks, no explanation

Example format:
[
  {
    "id": 1,
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "answer": "Paris"
  }
]

Text to parse:
${text}

Return ONLY the JSON array:`;

        console.log("Sending request to Gemini AI...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiText = response.text();

        console.log("AI Response:", aiText);

        // Try to extract JSON from the response
        let jsonText = aiText.trim();

        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Parse the JSON
        const questions = JSON.parse(jsonText);

        console.log(`AI extracted ${questions.length} questions`);

        // Validate and clean up the questions
        const validQuestions = questions.filter(q =>
            q.question &&
            Array.isArray(q.options) &&
            q.options.length >= 2
        ).map((q, index) => {
            // Clean up the question
            const cleanedQuestion = {
                id: q.id || index + 1,
                question: q.question.trim(),
                options: q.options.map(opt => opt.trim()),
                answer: q.answer ? q.answer.trim() : null
            };

            // Validate that answer exists and matches one of the options
            if (!cleanedQuestion.answer) {
                console.warn(`Q${cleanedQuestion.id}: No answer provided by AI, defaulting to first option`);
                cleanedQuestion.answer = cleanedQuestion.options[0];
            } else {
                // Check if answer matches any option
                const answerMatch = cleanedQuestion.options.find(opt =>
                    opt.toLowerCase() === cleanedQuestion.answer.toLowerCase()
                );
                if (!answerMatch) {
                    console.warn(`Q${cleanedQuestion.id}: Answer "${cleanedQuestion.answer}" doesn't match any option, defaulting to first`);
                    cleanedQuestion.answer = cleanedQuestion.options[0];
                } else {
                    cleanedQuestion.answer = answerMatch; // Use the exact match from options
                }
            }

            console.log(`Q${cleanedQuestion.id}: Correct answer = "${cleanedQuestion.answer}"`);

            // Shuffle the options to randomize answer position
            const correctAnswer = cleanedQuestion.answer;
            const shuffledOptions = [...cleanedQuestion.options].sort(() => Math.random() - 0.5);

            return {
                ...cleanedQuestion,
                options: shuffledOptions,
                answer: correctAnswer
            };
        });

        return validQuestions;

    } catch (error) {
        console.error("AI extraction failed:", error);
        throw new Error("AI extraction failed: " + error.message);
    }
}
