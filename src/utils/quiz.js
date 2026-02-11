import { extractMCQsWithAI } from './aiParser.js';

export async function generateQuiz(text, questionCount = 5, markingScheme = null) {
    console.log("=== Starting Quiz Generation ===");
    console.log("Text length:", text.length);
    if (markingScheme) console.log("Marking scheme provided");

    // Try AI extraction first
    try {
        const aiQuestions = await extractMCQsWithAI(text, markingScheme);
        if (aiQuestions.length > 0) {
            console.log("AI extraction successful:", aiQuestions.length, "questions");
            return aiQuestions;
        }
    } catch (error) {
        console.log("AI extraction error:", error.message);
        // If API key is missing, throw it so App.jsx can handle showing the settings
        if (error.message === 'API_KEY_MISSING' || error.message.includes('API_KEY')) {
            throw new Error('API_KEY_MISSING');
        }

        // For other AI errors (like safety or rate limit), we might want to tell the user
        // but for now let's see if regex can find anything
        console.log("AI extraction failed, trying regex fallback...");
    }

    // Fallback to regex parsing ONLY if it looks like there are actual questions
    const mcqs = parseMCQs(text);

    if (mcqs.length > 0) {
        return mcqs;
    }

    // DO NOT fallback to cloze if AI is expected
    // Throw error so App.jsx can tell the user no questions were found
    throw new Error("No questions could be extracted. Please ensure your text contains MCQs or check your API key.");
}

function parseMCQs(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const questions = [];
    let currentQ = null;

    // Regex to detect question start: "1. Question text"
    const questionPattern = /^(\d+)\.\s+(.+)/;

    // Regex to detect option: "(1) option text" or "1) option text"
    const optionPattern = /^\((\d+)\)\s+(.+)|^(\d+)\)\s+(.+)/;

    // Regex to detect answer line: "Answer: 1" or "Ans: 1"
    const answerPattern = /^(?:ans(?:wer)?|correct)[\s:]+(\d+)/i;

    console.log("=== Parsing MCQs ===");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is a question
        const qMatch = line.match(questionPattern);
        if (qMatch) {
            // Save previous question if it has options
            if (currentQ && currentQ.options.length >= 2) {
                questions.push(currentQ);
                console.log(`Saved Q${currentQ.id}: ${currentQ.options.length} options`);
            }

            // Start new question
            currentQ = {
                id: parseInt(qMatch[1]),
                question: qMatch[2],
                options: [],
                answer: null
            };
            console.log(`\nFound Q${currentQ.id}: ${currentQ.question.substring(0, 50)}...`);
            continue;
        }

        // Check if this is an option
        const optMatch = line.match(optionPattern);
        if (optMatch && currentQ) {
            const optionText = optMatch[2] || optMatch[4];
            currentQ.options.push(optionText);
            console.log(`  Option ${currentQ.options.length}: ${optionText.substring(0, 40)}...`);
            continue;
        }

        // Check if this is an answer line
        const ansMatch = line.match(answerPattern);
        if (ansMatch && currentQ) {
            const answerNum = parseInt(ansMatch[1]);
            if (answerNum >= 1 && answerNum <= currentQ.options.length) {
                currentQ.answer = currentQ.options[answerNum - 1];
                console.log(`  Answer: Option ${answerNum} `);
            }
            continue;
        }

        // If we have a current question but no options yet, append to question text
        if (currentQ && currentQ.options.length === 0) {
            currentQ.question += ' ' + line;
            console.log(`  Appending to question: ${line.substring(0, 40)}...`);
        }
    }

    // Don't forget the last question
    if (currentQ && currentQ.options.length >= 2) {
        questions.push(currentQ);
        console.log(`Saved Q${currentQ.id}: ${currentQ.options.length} options`);
    }

    console.log(`\n === Total questions parsed: ${questions.length} === `);

    // If no answers were found, default to first option
    questions.forEach(q => {
        if (!q.answer && q.options.length > 0) {
            q.answer = q.options[0];
            console.log(`Q${q.id}: No answer found, defaulting to option 1`);
        }
    });

    return questions;
}

function generateClozeQuiz(text, questionCount) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

    if (sentences.length === 0) {
        return [{
            id: "failed",
            question: "Could not generate questions from this text. Please paste MCQ format.",
            options: ["Try again"],
            answer: "Try again"
        }];
    }

    const questions = [];
    const usedSentences = new Set();

    for (let i = 0; i < Math.min(questionCount, sentences.length); i++) {
        let sentence = sentences[i].trim();
        if (usedSentences.has(sentence) || sentence.length < 20) continue;

        usedSentences.add(sentence);
        const words = sentence.split(/\s+/).filter(w => w.length > 3);

        if (words.length < 3) continue;

        const blankIndex = Math.floor(Math.random() * words.length);
        const correctAnswer = words[blankIndex];
        const questionText = sentence.replace(correctAnswer, '______');

        const distractors = generateDistractors(correctAnswer, words);
        const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

        questions.push({
            id: i + 1,
            question: questionText,
            options,
            answer: correctAnswer
        });
    }

    return questions.length > 0 ? questions : [{
        id: "failed",
        question: "Could not generate questions. Please check your text format.",
        options: ["Try again"],
        answer: "Try again"
    }];
}

function generateDistractors(correct, wordPool) {
    const distractors = [];
    const used = new Set([correct.toLowerCase()]);

    while (distractors.length < 3 && wordPool.length > 0) {
        const word = wordPool[Math.floor(Math.random() * wordPool.length)];
        if (!used.has(word.toLowerCase()) && word.length > 2) {
            distractors.push(word);
            used.add(word.toLowerCase());
        }
    }

    while (distractors.length < 3) {
        distractors.push(`Option ${distractors.length + 1} `);
    }

    return distractors;
}
