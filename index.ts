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

const questionsData: Capital[] = [
  { city: "Madrid", country: "Spain", continent: "Europe" },
  { city: "Brussels", country: "Belgium", continent: "Europe" },
  { city: "Lisbon", country: "Portugal", continent: "Europe" },
  { city: "Oslo", country: "Norway", continent: "Europe" },
];

let questions: Question[] = [];
let unansweredQuestions: Question[] = [];
const totalQuestions = questionsData.length;
const answeredCorrectly: Question[] = [];
let currentQuestion: Question | undefined;
let handleAnswer: (value?: unknown) => void;

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

const renderQuestion = (question: Question) => {
  console.log("question :", question);
  $questionContainer.textContent = question.text;
};

const getAnswers = (currentQuestion: Question, allQuestions: Question[]) => {
  const correctAnswer = currentQuestion.answer;

  const wrongAnswers = shuffleArray(
    allQuestions
      .filter((question) => question.answer !== correctAnswer)
      .map((question: Question) => question.answer)
  ).slice(0, 3);

  const answers = [correctAnswer, ...wrongAnswers];

  return shuffleArray(answers);
};

const renderButtons = (answers: string[]) => {
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

const getAnswer = async () =>
  new Promise((resolve, reject) => {
    handleAnswer = resolve;
  });

const renderScore = (correctAnswers: number, totalQuestions: number) => {
  const scoreText = `${correctAnswers}/${totalQuestions}`;
  console.log(scoreText);

  $scoreContainer.textContent = scoreText;
};

const gameEnd = () => {
  console.log(`Game end.`);
  $questionContainer.innerHTML = "Finished";
  $answersContainer.innerHTML = "";
};

const loopStart = async () => {
  console.log("loopStart");

  currentQuestion = getNextQuestion(unansweredQuestions);
  console.log("unansweredQuestions :", unansweredQuestions);
  console.log("currentQuestion :", currentQuestion);

  if (!currentQuestion) return;

  const answers = getAnswers(currentQuestion, questions);

  renderQuestion(currentQuestion);
  renderButtons(answers);
  renderScore(answeredCorrectly.length, totalQuestions);

  const answer = await getAnswer();
  console.log("answer :", answer);

  if (answer === currentQuestion.answer) {
    console.log("correct :", answer);
    answeredCorrectly.push(currentQuestion);
  } else {
    unansweredQuestions.push(currentQuestion);
  }

  renderScore(answeredCorrectly.length, totalQuestions);

  if (unansweredQuestions.length > 0) {
    loopStart();
  } else {
    gameEnd();
  }
};

window.onload = () => {
  console.log("window loaded");

  $questionContainer = document.querySelector("#question-container")!;
  $answersContainer = document.querySelector("#answers-container")!;
  $scoreContainer = document.querySelector("#score-container")!;

  questions = getQuestions(questionsData);
  unansweredQuestions = shuffleArray([...questions]);

  loopStart();
};
