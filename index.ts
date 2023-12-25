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
  // { city: "", country: "", continent: "Europe" },
  /* { city: "Madrid", country: "Spain", continent: "Europe" },
  { city: "Brussels", country: "Belgium", continent: "Europe" },
  { city: "Lisbon", country: "Portugal", continent: "Europe" },
  { city: "Oslo", country: "Norway", continent: "Europe" },
  { city: "Paris", country: "France", continent: "Europe" },
  { city: "Berlin", country: "Germany", continent: "Europe" },
  { city: "Rome", country: "Italy", continent: "Europe" },
  { city: "Athens", country: "Greece", continent: "Europe" },
  { city: "Amsterdam", country: "Netherlands", continent: "Europe" },
  { city: "Vienna", country: "Austria", continent: "Europe" },
  { city: "Stockholm", country: "Sweden", continent: "Europe" },
  { city: "Copenhagen", country: "Denmark", continent: "Europe" },
  { city: "Helsinki", country: "Finland", continent: "Europe" },
  { city: "Tallinn", country: "Estonia", continent: "Europe" },
  { city: "Riga", country: "Latvia", continent: "Europe" },
  { city: "Vilnius", country: "Lithuania", continent: "Europe" },
  { city: "Warsaw", country: "Poland", continent: "Europe" },
  { city: "Budapest", country: "Hungary", continent: "Europe" },
  { city: "Prague", country: "Czech Republic", continent: "Europe" },
  { city: "Bratislava", country: "Slovakia", continent: "Europe" },
  { city: "Ljubljana", country: "Slovenia", continent: "Europe" },
  { city: "Zagreb", country: "Croatia", continent: "Europe" },
  { city: "Sarajevo", country: "Bosnia and Herzegovina", continent: "Europe" },
  { city: "Podgorica", country: "Montenegro", continent: "Europe" },
  { city: "Pristina", country: "Kosovo", continent: "Europe" },
  { city: "Skopje", country: "North Macedonia", continent: "Europe" },
  { city: "Tirana", country: "Albania", continent: "Europe" },
  { city: "Belgrade", country: "Serbia", continent: "Europe" },
  { city: "Chisinau", country: "Moldova", continent: "Europe" },
  { city: "Bucharest", country: "Romania", continent: "Europe" },
  { city: "Sofia", country: "Bulgaria", continent: "Europe" },
  { city: "Nicosia", country: "Cyprus", continent: "Europe" }, */

  { city: "Buenos Aires", country: "Argentina", continent: "South America" },
  { city: "Santiago", country: "Chile", continent: "South America" },
  { city: "Lima", country: "Peru", continent: "South America" },
  { city: "Brasília", country: "Brazil", continent: "South America" },
  { city: "Montevideo", country: "Uruguay", continent: "South America" },
  { city: "Asunción", country: "Paraguay", continent: "South America" },
  { city: "Quito", country: "Ecuador", continent: "South America" },
  { city: "La Paz", country: "Bolivia", continent: "South America" },
  { city: "Bogotá", country: "Colombia", continent: "South America" },
  { city: "Caracas", country: "Venezuela", continent: "South America" },
  { city: "Georgetown", country: "Guyana", continent: "South America" },
  { city: "Paramaribo", country: "Suriname", continent: "South America" },
  { city: "Cayenne", country: "French Guiana", continent: "South America" },
];

let questions: Question[] = [];
let unansweredQuestions: Question[] = [];
const totalQuestions = questionsData.length;
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

const renderQuestion = (question: Question, attempts: number) => {
  $questionContainer.textContent = `${attempts + 1}. ${question.text}`;
};

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

const getResponse = async () =>
  new Promise((resolve, reject) => {
    handleAnswer = resolve;
  });

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loopStart = async () => {
  currentQuestion = getNextQuestion(unansweredQuestions);

  if (!currentQuestion) return;

  const answerOptions = getAnswerOptions(currentQuestion, questions);

  renderQuestion(currentQuestion, attempts);
  renderButtons(answerOptions);
  renderScore(answeredCorrectly.length, totalQuestions, attempts);

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

  renderScore(answeredCorrectly.length, totalQuestions, attempts);

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

  questions = getQuestions(questionsData);
  unansweredQuestions = shuffleArray([...questions]);
  answeredCorrectly = [];
  attempts = 0;

  listenForEscape();
};

const start = () => {
  init();
  loopStart();
};

window.onload = () => {
  start();
};
