const domVariables = {
  select: document.getElementById('game-level'),
  submit: document.getElementById('submit'),
  reset: document.getElementById('reset'),
  container: document.getElementsByClassName('boardContainer')[0],
  score: document.getElementById('score')
}

const gameVariables = {
  score: 0,
  matchingPair: [],
  guessedPairs: 0,
  uniqueCards: 0
}

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
  if (card1.firstChild.getAttribute('src') === card2.firstChild.getAttribute('src')) {
    domVariables.score.textContent = gameVariables.score + 10;
    gameVariables.guessedPairs++;
    checkFinishedGame();
  } else {
    domVariables.score.textContent--;
    gameVariables.score = parseInt(domVariables.score.textContent);
    // Wait .8s if cards don't match
    setTimeout(() => {
      card1.firstChild.setAttribute('alt', card1.firstChild.getAttribute('src'));
      card2.firstChild.setAttribute('alt', card2.firstChild.getAttribute('src'));
      card1.firstChild.setAttribute('src', `/assets/reverso.png`);
      card2.firstChild.setAttribute('src', `/assets/reverso.png`);
    }, 800);
  }
  gameVariables.matchingPair = [];
}

function checkFinishedGame() {
  if (gameVariables.guessedPairs === gameVariables.uniqueCards) {
    alert('woho');
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
      card.firstChild.setAttribute('src', `/assets/reverso.png`);
      card.firstChild.setAttribute('alt', `/assets/${images[imageIndex]}`);
      grid.push(card);
    });
  }
  shuffleArr(grid);
  grid.forEach(element => domVariables.container.appendChild(element));


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