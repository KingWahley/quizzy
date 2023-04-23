const categorySelect = document.getElementById("category");
const startButton = document.getElementById("start-btn");
const submitButton = document.getElementById("submit-btn");
const quizContainer = document.getElementById("quiz-container");
const resultsContainer = document.getElementById("results-container");

let currentQuiz = [];
let currentQuestion = 0;
let numCorrect = 0;

function getQuestions(category) {
  const apiUrl = `https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`;
  return axios.get(apiUrl);
}

function shuffleArray(array) {
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function displayQuiz() {
  const question = currentQuiz[currentQuestion];
  const answers = shuffleArray([
    ...question.incorrect_answers,
    question.correct_answer,
  ]);

  quizContainer.innerHTML = `
    <div class="question">${question.question}</div>
    <div class="answers">
      ${answers
        .map((answer) => `<button class="answer-btn">${answer}</button>`)
        .join("")}
    </div>
  `;

  const answerButtons = document.querySelectorAll(".answer-btn");
  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedAnswer = button.textContent;
      answerButtons.forEach((button) => {
        button.classList.add("answered");
      });
      if (selectedAnswer === question.correct_answer) {
        numCorrect++;
      }
      currentQuestion++;
      if (currentQuestion < currentQuiz.length) {
        displayQuiz();
      } else {
        displayResults();
      }
    });
  });
}

function displayResults() {
  quizContainer.style.display = "none";
  resultsContainer.style.display = "block";
  let reviewQuestionsHtml = "";

  currentQuiz.forEach((question, index) => {
    const answerClass =
      question.correct_answer === question.user_answer
        ? "correct"
        : "incorrect";
    reviewQuestionsHtml += `
      <div class="review-question ${answerClass}">
        <div class="review-question__title">Question ${index + 1}</div>
        <div class="review-question__text">${question.question}</div>
        <div class="review-question__your-answer"><strong>Your Answer:</strong> ${
          question.user_answer
        }</div>
        <div class="review-question__correct-answer"><strong>Correct Answer:</strong> ${
          question.correct_answer
        }</div>
      </div>
    `;
  });

  resultsContainer.innerHTML = `
    <div class="results-summary">You got ${numCorrect} out of ${currentQuiz.length} questions correct!</div>
    <div class="review-questions">
      ${reviewQuestionsHtml}
    </div>
    <button id="restart-btn" class="button">Restart Quiz</button>
  `;

  const restartButton = document.getElementById("restart-btn");
  restartButton.addEventListener("click", () => {
    startButton.style.display = "block";
    resultsContainer.style.display = "none";
    currentQuiz = [];
    currentQuestion = 0;
    numCorrect = 0;
  });
}

startButton.addEventListener("click", () => {
  const category = categorySelect.value;
  getQuestions(category)
    .then((response) => {
      currentQuiz = response.data.results;
      currentQuestion = 0;
      numCorrect = 0;
      startButton.style.display = "none";
      displayQuiz();
    })
    .catch((error) => {
      console.error(error);
    });
});

submitButton.addEventListener("click", () => {
  const answerButtons = document.querySelectorAll(".answer-btn");
  const numAnswered = Array.from(answerButtons).filter((button) =>
    button.classList.contains("answered")
  ).length;

  if (numAnswered < currentQuiz.length) {
    alert("Please answer all questions before submitting.");
    return;
  }

  displayResults();
});
