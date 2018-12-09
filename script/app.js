const domVariables = {
  select: document.getElementById('game-level'),
  submit: document.getElementById('submit'),
  reset: document.getElementById('reset'),
  container: document.getElementsByClassName('boardContainer')[0],
  score: document.getElementById('score'),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  modal: document.getElementsByClassName('modal')[0],
  scoreDisplay: document.getElementById('score-display'),
  timeDisplay: document.getElementById('time-display')
}

const gameVariables = {
  score: 0,
  lastScore: 0,
  lastTime: 0,
  matchingPair: [],
  guessedPairs: 0,
  uniqueCards: 0
}

const reverseCardPath = `/assets/reverso.png`;

// Selection of the game
domVariables.submit.addEventListener('click', function (event) {
  event.preventDefault();
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
  runTimer();
});

domVariables.container.addEventListener('click', function (event) {
  const element = event.target;
  if (element.tagName === 'IMG') {
    flipCard(element);
    if (gameVariables.matchingPair.length === 0 || gameVariables.matchingPair.length === 1) {
      gameVariables.matchingPair.push(element.parentNode);
    }
    if (gameVariables.matchingPair.length === 2) {
      let match1 = gameVariables.matchingPair[0];
      let match2 = gameVariables.matchingPair[1];
      checkPairs(match1, match2);
    }
  }
});

reset.addEventListener('click', () => window.location.reload());

function checkPairs(card1, card2) {
  const card1Img = card1.firstChild;
  const card2Img = card2.firstChild;
  if (card1Img.getAttribute('src') === card2Img.getAttribute('src')) {
    domVariables.score.textContent = gameVariables.score + 10;
    gameVariables.guessedPairs++;
    card1Img.className += ' matched';
    card2Img.className += ' matched';
    checkFinishedGame();
  } else {
    domVariables.score.textContent--;
    gameVariables.score = parseInt(domVariables.score.textContent);
    // Wait .8s if cards don't match
    setTimeout(() => {
      card1Img.setAttribute('alt', card1Img.getAttribute('src'));
      card2Img.setAttribute('alt', card2Img.getAttribute('src'));
      card1Img.setAttribute('src', reverseCardPath);
      card2Img.setAttribute('src', reverseCardPath);
    }, 800);
  }
  gameVariables.matchingPair = [];
}

function checkFinishedGame() {
  if (gameVariables.guessedPairs === gameVariables.uniqueCards) {
    // TODO: Implement webstorage, stop timer, show last results 
    domVariables.scoreDisplay.textContent = gameVariables.score;
    domVariables.timeDisplay.textContent = `${domVariables.minutes.textContent}:${domVariables.seconds.textContent}`;
    domVariables.modal.style.display = 'block';
  }
}

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



function generatePairOfCards(number) {
  let images = cargarImagenes();
  let grid = [];

  for (let i = 1; i <= number; i = i + 2) {
    let arrOfIndex = [];
    let imageIndex;
    do {
      imageIndex = getNumber(0, images.length);
    } while (arrOfIndex.includes(imageIndex));
    arrOfIndex.push(imageIndex);
    // Create two cards
    let card1 = createCardElement();
    let card2 = createCardElement();
    let pair = [card1, card2];

    card1.id = i;
    card2.id = i + 1;

    pair.forEach(card => {
      card.firstChild.setAttribute('src', reverseCardPath);
      card.firstChild.setAttribute('alt', `/assets/${images[imageIndex]}`);
      grid.push(card);
    });
  }
  shuffleArr(grid);
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
  setInterval(function () {
    // Set seconds first
    seconds.innerHTML = pad(++second % 60);
    // Set minutes
    minutes.innerHTML = pad(parseInt(second / 60, 10));
  }, 1000);
}