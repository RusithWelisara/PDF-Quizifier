import { generateQuiz } from './src/utils/quiz.js';

const sampleText = `
1. What is the capital of France?
1. Berlin
2. Paris
3. London
4. Madrid
Answer: 2

2. Which planet is known as the Red Planet?
a) Venus
b) Mars
c) Jupiter
d) Saturn
Ans: b

3. Photosynthesis requires:
1. Sunlight
2. Water
3. CO2
4. All of the above
Correct: 4
`;

const questions = generateQuiz(sampleText);
console.log(JSON.stringify(questions, null, 2));

const clozeText = "The quick brown fox jumps over the lazy dog. React is a JavaScript library for building user interfaces.";
const clozeQuestions = generateQuiz(clozeText);
console.log(JSON.stringify(clozeQuestions, null, 2));
