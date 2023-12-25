import { data } from "./data.js";

type Capital = {
  city: string;
  country: string;
  continent: string;
};

type Question = {
  answer: string;
  text: string;
  options: string[];
};

let questions: Question[] = [];
let unansweredQuestions: Question[] = [];
let answeredCorrectly: Question[] = [];
let currentQuestion: Question | undefined;
let handleAnswer: (value?: unknown) => void;
let attempts = 0;

let $questionContainer: Element;
let $answersContainer: Element;
let $scoreContainer: Element;

const getNextQuestion = (array: Question[]) => {
  return array.shift();
};

const getQuestion = (data: Capital) => {
  return {
    text: `What is the capital of ${data.country}?`,
    answer: data.city,
  } as Question;
};

const getQuestions = (data: Capital[]) => {
  return data.map((item) => getQuestion(item));
};

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const getAnswerOptions = (
  currentQuestion: Question,
  allQuestions: Question[]
) => {
  const correctAnswer = currentQuestion.answer;

  const wrongAnswers = shuffleArray(
    allQuestions
      .filter((question) => question.answer !== correctAnswer)
      .map((question: Question) => question.answer)
  ).slice(0, 3);

  const answers = [correctAnswer, ...wrongAnswers];

  return shuffleArray(answers);
};

const getResponse = async () =>
  new Promise((resolve, reject) => {
    handleAnswer = resolve;
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const renderStart = () => {
  $questionContainer.textContent = "Ready?";
  const button = document.createElement("button");
  button.textContent = "Play";
  button.onclick = () => start();

  $answersContainer.append(button);
};

const renderQuestion = (question: Question, attempts: number) => {
  $questionContainer.textContent = `${attempts + 1}. ${question.text}`;
};

const renderButtons = (answers: string[]) => {
  const buttons = document.createDocumentFragment();

  for (let i = 0; i < answers.length; i++) {
    const button = document.createElement("button");
    button.textContent = answers[i];
    button.onclick = () => {
      handleAnswer(answers[i]);
    };

    buttons.append(button);
  }

  $answersContainer.replaceChildren(buttons);
};

const renderScore = (
  correctAnswers: number,
  totalQuestions: number,
  attempts: number
) => {
  const scoreText = `${correctAnswers}/${totalQuestions}`;

  $scoreContainer.textContent = `correct answers ${scoreText} attempts ${attempts}`;
};

const renderCorrect = (correct: Boolean) => {
  if (correct) {
    $answersContainer.innerHTML = "Right answer!";
  } else {
    $answersContainer.innerHTML = "Wrong answer!";
  }
};

const renderGameEnd = () => {
  $questionContainer.innerHTML = "Finished";

  const button = document.createElement("button");
  button.textContent = "Play Again";
  button.onclick = () => start();
  $answersContainer.replaceChildren(button);
};

const loopStart = async () => {
  currentQuestion = getNextQuestion(unansweredQuestions);

  if (!currentQuestion) return;

  const answerOptions = getAnswerOptions(currentQuestion, questions);

  renderQuestion(currentQuestion, attempts);
  renderButtons(answerOptions);
  renderScore(answeredCorrectly.length, questions.length, attempts);

  const answer = await getResponse();

  if (answer === "escape") {
    renderGameEnd();
    return;
  }

  attempts++;

  if (answer === currentQuestion.answer) {
    answeredCorrectly.push(currentQuestion);
    renderCorrect(true);
  } else {
    unansweredQuestions.push(currentQuestion);
    renderCorrect(false);
  }

  renderScore(answeredCorrectly.length, questions.length, attempts);

  await sleep(2000);

  if (unansweredQuestions.length > 0) {
    loopStart();
  } else {
    renderGameEnd();
  }
};

const listenForEscape = () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      handleAnswer("escape");
    }
  });
};

const init = () => {
  $questionContainer = document.querySelector("#question-container")!;
  $answersContainer = document.querySelector("#answers-container")!;
  $scoreContainer = document.querySelector("#score-container")!;
};

const resetState = () => {
  questions = getQuestions(
    data.filter((capital) => capital.continent === "Europe").slice(0, 3)
  );

  unansweredQuestions = shuffleArray([...questions]);
  answeredCorrectly = [];
  attempts = 0;
};

const start = () => {
  resetState();
  loopStart();
};

window.onload = () => {
  init();
  resetState();
  listenForEscape();
  renderStart();
};
