type Capital = {
  city: string;
  country: string;
  continent: string;
};

type Question = {
  answer: string;
  text: string;
  data: Capital;
};

type AnswerData = {
  correct: Capital[];
  incorrect: Capital[];
  totalQuestions: number;
  attempts: number;
};
