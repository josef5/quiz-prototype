"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const questionsData = [
    { city: "Madrid", country: "Spain", continent: "Europe" },
    { city: "Brussels", country: "Belgium", continent: "Europe" },
    { city: "Lisbon", country: "Portugal", continent: "Europe" },
    { city: "Oslo", country: "Norway", continent: "Europe" },
];
let questions = [];
let unansweredQuestions = [];
const totalQuestions = questionsData.length;
const answeredCorrectly = [];
let currentQuestion;
let handleAnswer;
let $questionContainer;
let $answersContainer;
let $scoreContainer;
const getNextQuestion = (array) => {
    return array.shift();
};
const getQuestion = (data) => {
    return {
        text: `What is the capital of ${data.country}?`,
        answer: data.city,
    };
};
const getQuestions = (data) => {
    return data.map((item) => getQuestion(item));
};
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
const renderQuestion = (question) => {
    console.log("question :", question);
    $questionContainer.textContent = question.text;
};
const getAnswers = (currentQuestion, allQuestions) => {
    const correctAnswer = currentQuestion.answer;
    const wrongAnswers = shuffleArray(allQuestions
        .filter((question) => question.answer !== correctAnswer)
        .map((question) => question.answer)).slice(0, 3);
    const answers = [correctAnswer, ...wrongAnswers];
    return shuffleArray(answers);
};
const renderButtons = (answers) => {
    const buttons = document.createDocumentFragment();
    for (let i = 0; i < answers.length; i++) {
        const button = document.createElement("button");
        button.textContent = answers[i];
        button.onclick = () => {
            console.log(answers[i]);
            handleAnswer(answers[i]);
        };
        buttons.append(button);
    }
    $answersContainer.replaceChildren(buttons);
};
const getAnswer = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        handleAnswer = resolve;
    });
});
const renderScore = (correctAnswers, totalQuestions) => {
    const scoreText = `${correctAnswers}/${totalQuestions}`;
    console.log(scoreText);
    $scoreContainer.textContent = scoreText;
};
const gameEnd = () => {
    console.log(`Game end.`);
    $questionContainer.innerHTML = "Finished";
    $answersContainer.innerHTML = "";
};
const loopStart = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("loopStart");
    currentQuestion = getNextQuestion(unansweredQuestions);
    console.log("unansweredQuestions :", unansweredQuestions);
    console.log("currentQuestion :", currentQuestion);
    if (!currentQuestion)
        return;
    const answers = getAnswers(currentQuestion, questions);
    renderQuestion(currentQuestion);
    renderButtons(answers);
    renderScore(answeredCorrectly.length, totalQuestions);
    const answer = yield getAnswer();
    console.log("answer :", answer);
    if (answer === currentQuestion.answer) {
        console.log("correct :", answer);
        answeredCorrectly.push(currentQuestion);
    }
    else {
        unansweredQuestions.push(currentQuestion);
    }
    renderScore(answeredCorrectly.length, totalQuestions);
    if (unansweredQuestions.length > 0) {
        loopStart();
    }
    else {
        gameEnd();
    }
});
window.onload = () => {
    console.log("window loaded");
    $questionContainer = document.querySelector("#question-container");
    $answersContainer = document.querySelector("#answers-container");
    $scoreContainer = document.querySelector("#score-container");
    questions = getQuestions(questionsData);
    unansweredQuestions = shuffleArray([...questions]);
    loopStart();
};
