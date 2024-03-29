import { data } from "./data.js";

enum Continent {
  Africa = "Africa",
  Asia = "Asia",
  Europe = "Europe",
  SouthAmerica = "South America",
}

enum GameType {
  Knockout = "Knockout",
  Quickfire = "Quickfire",
  UntilAllCorrect = "Until All Correct",
  OneQuestionEach = "One Question Each",
}

const GameConfig: Record<
  GameType,
  { maxAttempts?: number; maxWrong?: number }
> = {
  [GameType.Quickfire]: { maxAttempts: 3 },
  [GameType.Knockout]: {
    maxWrong: 0,
  },
  [GameType.UntilAllCorrect]: {},
  [GameType.OneQuestionEach]: {
    maxAttempts: 3,
  },
};

let questions: Question[] = [];
let unansweredQuestions: Question[] = [];
let currentQuestion: Question | undefined;
let selectedContinent: Continent | undefined;
let gameConfig = GameConfig[GameType.Knockout];

let answerData: AnswerData = {
  correct: [],
  incorrect: [],
  totalQuestions: 0,
  attempts: 0,
};

let $questionContainer: Element;
let $answersContainer: Element;
let $scoreContainer: Element;
let $dataContainer: Element;

let handleAnswer: (value?: unknown) => void;

/**
 * Retrieves and removes the first question from the provided array.
 * @param array - The array of questions.
 * @returns The first question from the array.
 */
const getNextQuestion = (array: Question[]) => {
  return array.shift();
};

/**
 * Generates a question object based on the provided capital data.
 * @param data - The capital data containing the country and city information.
 * @returns A question object with text, answer, and data properties.
 */
const getQuestion = (data: Capital) => {
  return {
    text: `What is the capital of ${data.country}?`,
    answer: data.city,
    data,
  } as Question;
};

/**
 * Generates an array of question objects based on the provided capital data.
 * @param data - The array of capital data containing the country and city information.
 * @returns An array of question objects with text, answer, and data properties.
 */
const getQuestions = (data: Capital[]) => {
  return data.map((item) => getQuestion(item));
};

/**
 * Shuffles the elements of the input array in place.
 * @param array - The array to be shuffled.
 * @returns The shuffled array.
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates an array of answer options based on the current question and all available questions.
 * @param currentQuestion - The current question object.
 * @param allQuestions - The array of all available question objects.
 * @returns An array of answer options including the correct answer and three random wrong answers.
 */
const getAnswerOptions = (
  currentQuestion: Question,
  allQuestions: Question[]
) => {
  const correctAnswer = currentQuestion.answer;

  // All questions except current one
  const allAvailableQuestions = allQuestions.filter(
    (question) => question.answer !== correctAnswer
  );

  // Remove questions that have already been answered correctly
  const questionsFiltered = allAvailableQuestions.filter(
    (question) =>
      !answerData.correct.some((answer) => answer.city === question.answer)
  );

  const wrongAnswers = shuffleArray(
    (questionsFiltered.length >= 3
      ? questionsFiltered
      : allAvailableQuestions
    ).map((question: Question) => question.answer)
  ).slice(0, 3);

  const answers = [correctAnswer, ...wrongAnswers];

  return shuffleArray(answers);
};

/**
 * Retrieves the response from the user asynchronously.
 * @returns A promise that resolves with the user's response.
 */
const getResponse = async () =>
  new Promise((resolve, reject) => {
    handleAnswer = resolve;
  });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Render functions only apply to vanilla js
const renderStart = () => {
  $questionContainer.textContent = "Select a continent";

  const buttons = document.createDocumentFragment();

  for (const value of Object.values(Continent)) {
    const button = document.createElement("button");
    button.textContent = value;
    button.onclick = () => {
      selectedContinent = value as Continent;
      start();
    };

    buttons.append(button);
  }

  $answersContainer.replaceChildren(buttons);
  $scoreContainer.replaceChildren();
  $dataContainer.replaceChildren();
};

const renderQuestion = (question: Question, questionNumber: number) => {
  $questionContainer.textContent = `${questionNumber}. ${question.text}`;
};

const renderButtons = (answers: string[]) => {
  const buttons = document.createDocumentFragment();

  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const button = document.createElement("button");
    button.textContent = answer;
    button.onclick = () => {
      handleAnswer(answer);
    };

    buttons.append(button);
  }

  $answersContainer.replaceChildren(buttons);
};

const renderScore = (answerData: AnswerData) => {
  const { correct, totalQuestions, attempts } = answerData;
  const scoreText = `${correct.length}/${totalQuestions}`;

  $scoreContainer.textContent = `correct answers ${scoreText} attempts ${attempts}`;
  $dataContainer.textContent = JSON.stringify(answerData, null, 2);
};

const renderAnswer = (question: Question, correct: boolean) => {
  const { country, city } = question.data;
  const correctAnswer = `The capital of ${country} is ${city}`;

  if (correct) {
    $answersContainer.innerHTML = `Right answer! ${correctAnswer}`;
  } else {
    $answersContainer.innerHTML = `Wrong answer! ${correctAnswer}`;
  }
};

const renderGameEnd = () => {
  $questionContainer.innerHTML = "Finished";

  const buttons = document.createDocumentFragment();
  const button1 = document.createElement("button");
  button1.textContent = "Play again";
  button1.onclick = () => {
    start();
  };
  buttons.append(button1);

  const button2 = document.createElement("button");
  button2.textContent = "Select a new continent";
  button2.onclick = () => {
    resetState();
    renderStart();
  };
  buttons.append(button2);

  $answersContainer.replaceChildren(buttons);
};

/**
 * Asynchronously loops through the game flow, rendering questions, handling answers, and updating the score.
 */
const loop = async () => {
  currentQuestion = getNextQuestion(unansweredQuestions);

  if (!currentQuestion) return;

  const answerOptions = getAnswerOptions(currentQuestion, questions);

  renderQuestion(currentQuestion, answerData.attempts + 1);
  renderButtons(answerOptions);
  renderScore(answerData);

  const answer = await getResponse();

  if (answer === "escape") {
    renderGameEnd();
    return;
  }

  answerData.attempts++;

  if (answer === currentQuestion.answer) {
    answerData.correct.push(currentQuestion.data);

    renderAnswer(currentQuestion, true);
  } else {
    unansweredQuestions.push(currentQuestion);
    answerData.incorrect.push(currentQuestion.data);

    renderAnswer(currentQuestion, false);
  }

  renderScore(answerData);

  await sleep(2000);

  if (
    unansweredQuestions.length === 0 ||
    answerData.attempts >= (gameConfig.maxAttempts ?? 99999) ||
    answerData.incorrect.length > (gameConfig.maxWrong ?? 99999)
  ) {
    renderGameEnd();
  } else {
    loop();
  }
};

/**
 * Listens for the "Escape" key press event and handles it by calling the handleAnswer function with the value "escape".
 */
const listenForEscape = () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      handleAnswer("escape");
    }
  });
};

/**
 * Initializes the game by setting up the necessary containers and event listeners.
 * Called once only
 */
const init = () => {
  $questionContainer = document.querySelector("#question-container")!;
  $answersContainer = document.querySelector("#answers-container")!;
  $scoreContainer = document.querySelector("#score-container")!;
  $dataContainer = document.querySelector("#data-container")!;

  listenForEscape();
};

/**
 * Resets the state by shuffling the questions, setting unanswered questions, and initializing answer data.
 * Called on each new game
 */
const resetState = () => {
  questions = shuffleArray(
    getQuestions(
      data.filter((capital) => capital.continent === selectedContinent)
    )
  );

  if (gameConfig.maxAttempts) {
    questions = questions.slice(0, gameConfig.maxAttempts);
  }

  unansweredQuestions = [...questions];

  answerData = {
    correct: [],
    incorrect: [],
    totalQuestions: questions.length,
    attempts: 0,
  };
};

/**
 * Starts the game by resetting the state and initiating the game loop.
 */
const start = () => {
  resetState();
  loop();
};

/**
 * Initializes the game by setting up the necessary containers and event listeners.
 */
window.onload = () => {
  init();
  resetState();
  renderStart();
};
