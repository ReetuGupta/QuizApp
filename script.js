const container = document.querySelector('.container');
const questionBox = document.querySelector('.question');
const choicesBox = document.querySelector('.choices');
const nextBtn = document.querySelector('.nextBtn');
const scoreCard = document.querySelector('.scoreCard');
const welcomeScreen = document.getElementById('welcomeScreen');
const quizScreen = document.getElementById('quizScreen');
const startQuizBtn = document.getElementById('startQuizBtn');

//Making Variable
let currentQuestionIndex= 0;
let score=0;
let quizOver =false;
let selectedTopic = null;
let selectedDifficulty = null;
let quizData = [];
let answerSelected = false;

const categoryMap ={
    gk: 9,
    sci: 18,
    maths: 19,
    entertain: 11,
    geo:22,
    history: 23
};

// Function to handle selection
function handleSelection(containerId,value) {
    document.querySelectorAll(`#${containerId} .option`).forEach(option => option.classList.remove('selected'));
    document.querySelector(`[data-value="${value}"]`).classList.add('selected');

    if (containerId === "topicOptions") {
        selectedTopic = value;
    } else {
        selectedDifficulty = value;
    }

    if (selectedTopic && selectedDifficulty) {
        startQuizBtn.disabled = false;
    }
}

// Event Listeners for topic selection
document.querySelectorAll("#topicOptions .option").forEach(option => {
    option.addEventListener("click", () => handleSelection("topicOptions",option.dataset.value));
});

// Event Listeners for difficulty selection
document.querySelectorAll("#difficultyOptions .option").forEach(option => {
    option.addEventListener("click", () => handleSelection("difficultyOptions",option.dataset.value));
});

// Start Quiz Button Click
startQuizBtn.addEventListener('click', async () => {
    // Hide Welcome Screen & Show Quiz Screen
    document.querySelector('.main-container').style.display = "none"; // Hide front page
    document.getElementById('quizScreen').style.display = "block"; // Show quiz page

    await fetchQuestions();
    // Start Quiz
    showQuestions();
});

// Fetch questions from API
async function fetchQuestions() {
    const category = categoryMap[selectedTopic];
    const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${selectedDifficulty}&type=multiple`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        quizData = data.results.map(q => ({
            question: q.question,
            choices: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
            answer: q.correct_answer
        }));

        currentQuestionIndex = 0;
        score = 0;
        quizOver = false;
    } catch (error) {
        alert("Failed to load quiz questions. Try again later.");
    }
}

//function to show questions
function showQuestions() {
    if (currentQuestionIndex >= quizData.length) {
        showScore();
        return;
    }

    answerSelected = false;
    const questionDetails = quizData[currentQuestionIndex];

    questionBox.innerHTML = questionDetails.question;
    choicesBox.innerHTML = "";

    questionDetails.choices.forEach(choice => {
        const choiceDiv = document.createElement('div');
        choiceDiv.innerHTML = choice;
        choiceDiv.classList.add('choice');
        choiceDiv.addEventListener('click', () => checkAnswer(choiceDiv, questionDetails.answer));
        choicesBox.appendChild(choiceDiv);
    });

    nextBtn.disabled = true;
}

//function to check ans
function checkAnswer(choiceDiv, correctAnswer) {
    if(answerSelected) return;
    answerSelected = true;

    const selectedChoice = choiceDiv.innerHTML;
    const allChoices = document.querySelectorAll('.choice');

    allChoices.forEach(choice => choice.classList.add('disabled'));

    if (selectedChoice === correctAnswer) {
        choiceDiv.classList.add('correct');
        score++;
    } else {
        choiceDiv.classList.add('wrong');

        // Highlight correct answer in green
        allChoices.forEach(choice => {
            if (choice.textContent === correctAnswer) {
                choice.classList.add('correct');
            }
        });
    }

    nextBtn.disabled = false; // Enable Next button after selecting an answer
}

// Show final score
function showScore() {
    questionBox.innerHTML = "Quiz Completed!";
    choicesBox.innerHTML = "";
    nextBtn.textContent = "Play Again";
    quizOver = true;
    
    let finalScore = score;
    let animatedScore = 0;


    let message = finalScore >= 7 ? "🎉 Great job!" :
                  finalScore >= 4 ? "😐 Not bad!" : "😞 Keep practicing!";

    scoreCard.innerHTML = `<p id="animatedScore">${message} 0/${quizData.length}</p>`;
    
    // Animated Score Reveal
    let scoreText = document.getElementById('animatedScore');
    let interval = setInterval(() => {
        if (animatedScore < finalScore) {
            animatedScore++;
            scoreText.textContent = `${message} ${animatedScore}/${quizData.length}!`;
        } else {
            clearInterval(interval);
        }
    }, 100);
}

// Next button logic
nextBtn.addEventListener('click', async() => {
    if (quizOver) {
        // Reset Quiz
        currentQuestionIndex = 0;
        score = 0;
        quizOver = false;
        nextBtn.textContent = "Next"; 
        scoreCard.innerHTML = "";

        document.getElementById('quizScreen').style.display = "none";
        document.querySelector('.main-container').style.display = "flex";

    } else {
        currentQuestionIndex++;
        showQuestions();
    }
});




