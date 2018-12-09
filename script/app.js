// TODO: show last results 


// ==== Variable declaration ==== //
// Path for reverse image
const reverseCardPath = `/assets/reverso.png`;

// Variables used with the DOM
const domVariables = {
  select: document.getElementById('game-level'),
  submit: document.getElementById('submit'),
  reset: document.getElementById('reset'),
  reset2: document.getElementById('reset2'),
  container: document.getElementsByClassName('boardContainer')[0],
  score: document.getElementById('score'),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  modal: document.getElementsByClassName('modal')[0],
  scoreDisplay: document.getElementById('score-display'),
  timeDisplay: document.getElementById('time-display'),
  saveBtn: document.getElementById('save-data'),
  totalGames: document.getElementById('games-span'),
  maxScore: document.getElementById('max-score-span')
}

// Game Variables
const gameVariables = {
  score: 0,
  lastScore: 0,
  lastTime: 0,
  matchingPair: [],
  guessedPairs: 0,
  uniqueCards: 0,
  stopInterval: '',
  currentGame: {
    name: '',
    score: '',
    time: '',
    date: ''
  }
}

// ==== Event Listeners ==== //
// Load maxixum score and number of games everytime the page loads
window.addEventListener('load', () => {
  domVariables.totalGames.textContent = localStorage.length;
  getMaxScore();
  introJs().start();
});

// Selection of the game
domVariables.submit.addEventListener('click', function (event) {
  domVariables.score.textContent = gameVariables.score;
  const inputs = this.parentNode.parentNode.children;
  let choice;
  let grid = [];
  // Find selected level
  for (element of inputs) {
    if (element.checked === true) {
      choice = element.value;
    }
  }
  // Store variables to generate the grid
  let {
    numberOfCards,
    gridRows,
    gridColumns
  } = chooseGrid(choice);
  // Set win condition
  gameVariables.uniqueCards = numberOfCards / 2;
  // Generate grid and its cards
  setGridVariables(gridRows, gridColumns);
  generatePairOfCards(numberOfCards);
  // Start the timer on grid creation
  runTimer();
});

// Check mechanics each time a card is clicked
domVariables.container.addEventListener('click', function (event) {
  checkCard(event);
});

// Reset buttons
reset.addEventListener('click', () => window.location.reload());
reset2.addEventListener('click', () => window.location.reload());

// Save data on user confirmation after the game finishes
domVariables.saveBtn.addEventListener('click', () => {
  // Saving it on a JavaScriptobject first
  saveData();
  // Parse that object to string
  localStorage.setItem(`game${localStorage.length}`, JSON.stringify(gameVariables.currentGame));
  // Empty object for reuse
  gameVariables.currentGame = {};
});


// ==== Function declarations ==== //
// Dives into the Local Storage and get the maximum score out of all the games
function getMaxScore() {
  let arrayOfGames = [];
  let arrayOfScores = [];
  let maxScore = 0;
  // Iterate and get the values and parse them to JavaScript objects
  for (let i = 0; i < localStorage.length; i++) {
    arrayOfGames.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
  }
  // Create a new array only with the scores of those games
  arrayOfScores = arrayOfGames.map(game => game.score);
  maxScore = Math.max(...arrayOfScores);
  domVariables.maxScore.textContent = maxScore;
}

// On user click, search for a match
function checkCard(event) {
  const element = event.target;
  let pair = gameVariables.matchingPair;
  // Listen to the board but accept only card clicks
  if (element.tagName === 'IMG') {
    element.style.transform = 'scale(1.1)';
    // Swaps src and alt attributes
    flipCard(element);
    // Use an array with two slots that we are going to fill to later compare them(pair variable)
    if (pair.length === 0) {
      pair.push(element.parentNode);
    } else if (pair.length === 1 && pair[0].parentNode.id !== element.parentNode.id) {
      pair.push(element.parentNode)
    }
    if (pair.length === 2) {
      let match1 = pair[0];
      let match2 = pair[1];
      checkPairs(match1, match2);
    }
  }
}

// Comparison of the cards once the array is populated
function checkPairs(card1, card2) {
  const card1Img = card1.firstChild;
  const card2Img = card2.firstChild;
  const pair = [card1Img, card2Img];
  // Checks through the source attribute and that is not the same card to find a good match
  if (card1Img.getAttribute('src') === card2Img.getAttribute('src') && card1.id !== card2.id) {
    gameVariables.guessedPairs++;
    // Mark guess cards as 'matched'
    pair.forEach(card => {
      if (!card.className.includes('matched')) {
        card.style.filter = 'grayscale(100%)';
        card.style.border = 'none';
        card.className += ' matched';
      }
    });
    // We are enclosing each guess in a callback to delay the game speed and make it more natural
    (() => {
      domVariables.score.textContent = gameVariables.score + 10;
      checkFinishedGame();
    })();
  // Case for the wrong match
  } else {
    domVariables.score.textContent--;
    gameVariables.score = parseInt(domVariables.score.textContent);
    // Wait .8s if cards don't match
    setTimeout(() => {
      pair.forEach(card => {
        card.setAttribute('alt', card.getAttribute('src'));
        card.setAttribute('src', reverseCardPath);
        card.style.transform = 'scale(1)';
      });
    }, 800);
  }
  gameVariables.matchingPair = [];
}

// Function that looks for all the pairs been matched
function checkFinishedGame() {
  if (gameVariables.guessedPairs === gameVariables.uniqueCards) {
    domVariables.timeDisplay.textContent = `${domVariables.minutes.textContent}:${domVariables.seconds.textContent}`;
    setTimeout(() => {
      // Stop timer on game finish
      clearInterval(gameVariables.stopInterval);
      domVariables.scoreDisplay.textContent = domVariables.score.textContent;
      domVariables.modal.style.display = 'block';
    }, 800);
  }
}

// Save user information in a JS object
function saveData() {
  gameVariables.currentGame = {
    name: document.getElementById('name').value,
    score: domVariables.score.textContent,
    time: `${domVariables.minutes.textContent}:${domVariables.seconds.textContent}`,
    date: new Date().toUTCString()
  }
  console.log(document.getElementById('name').value);
}

// Generate grid according to user selection
function chooseGrid(level) {
  let numberOfCards, gridRows, gridColumns;
  switch (level) {
    // Assign 16 images
    case 'easy':
      numberOfCards = 16;
      gridRows = 4;
      gridColumns = 4;
      break;
      // Assign 32 images
    case 'medium':
      numberOfCards = 36;
      gridRows = 6;
      gridColumns = 6;
      break;
      // Assign 64 images
    case 'hard':
      numberOfCards = 64;
      gridRows = 8;
      gridColumns = 8;
      break;
    default:
      // Nothing to do here
      break;
  }
  return {
    numberOfCards,
    gridRows,
    gridColumns
  };
}

// Generate cards according to the number of cards assigned to each level
function generatePairOfCards(number) {
  let images = cargarImagenes();
  let grid = [];
  // We are going to generate a pir of cards per iteration
  for (let i = 1; i <= number; i = i + 2) {
    let arrOfIndex = [];
    let imageIndex;
    // Checks for repeated cards
    do {
      imageIndex = getNumber(0, images.length);
    } while (arrOfIndex.includes(imageIndex));
    arrOfIndex.push(imageIndex);
    // Create two cards
    let card1 = createCardElement();
    let card2 = createCardElement();
    let pair = [card1, card2];
    // Assign unique ids
    card1.id = i;
    card2.id = i + 1;
    // Assign the images
    pair.forEach(card => {
      card.firstChild.setAttribute('src', reverseCardPath);
      card.firstChild.setAttribute('alt', `/assets/${images[imageIndex]}`);
      grid.push(card);
    });
  }
  // Shuffle the deck before displaying it
  shuffleArr(grid);
  // Apend to the board
  grid.forEach(element => domVariables.container.appendChild(element));

  // Create one single card element
  function createCardElement() {
    let cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';
    let img = document.createElement('img');
    img.className = 'card-img';
    cardContainer.appendChild(img);
    return cardContainer;
  }
}

// Set the variables for the CSS Grid
function setGridVariables(rows, columns) {
  document.documentElement.style.setProperty('--rows', rows);
  document.documentElement.style.setProperty('--columns', columns);
}

// Flip card on click
function flipCard(element) {
  const sourceImg = element.getAttribute('alt');
  element.setAttribute('src', sourceImg);
}

// Timer function
function runTimer() {
  // Reset value each time it hits 9
  const pad = value => (value > 9) ? value : "0" + value;
  let second = 0;
  gameVariables.stopInterval = setInterval(function () {
    // Set seconds first
    seconds.innerHTML = pad(++second % 60);
    // Set minutes
    minutes.innerHTML = pad(parseInt(second / 60, 10));
  }, 1000);
}