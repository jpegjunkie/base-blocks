// Check if JavaScript is running
console.log('JavaScript loaded and running');

// Define the game grid dimensions
const rows = 20;
const cols = 10;
let grid = Array.from({ length: rows }, () => Array(cols).fill(0));

// Define the Tetromino shapes
const tetrominos = {
  I: [[1, 1, 1, 1]],
  O: [[2, 2], [2, 2]],
  T: [[0, 3, 0], [3, 3, 3]],
  S: [[0, 4, 4], [4, 4, 0]],
  Z: [[5, 5, 0], [0, 5, 5]],
  J: [[6, 0, 0], [6, 6, 6]],
  L: [[0, 0, 7], [7, 7, 7]]
};

// Define initial state
let currentTetromino = tetrominos['T']; // Example: Start with T shape
let currentX = 4; // Initial horizontal position
let currentY = 0; // Initial vertical position
let dropInterval = 1000; // Normal drop speed in milliseconds
let fastDropInterval = 100; // Fast drop speed in milliseconds
let gameInterval; // Variable to store the game loop interval
let score = 0; // Score tracking

// Function to draw the game grid and the current Tetromino
function drawGrid() {
  console.log('Drawing the grid');
  let gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = ''; // Clear previous content

  // Draw the grid cells
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let cell = document.createElement('div');
      cell.className = 'cell';
      if (grid[row][col] !== 0) {
        cell.classList.add(`color-${grid[row][col]}`);
      }
      gameBoard.appendChild(cell);
    }
  }

  // Draw the current Tetromino
  currentTetromino.forEach((row, rIndex) => {
    row.forEach((value, cIndex) => {
      if (value !== 0) {
        let cellIndex = (currentY + rIndex) * cols + (currentX + cIndex);
        if (cellIndex >= 0 && cellIndex < gameBoard.children.length) { 
          let cell = gameBoard.children[cellIndex];
          if (cell) cell.classList.add(`color-${value}`);
        }
      }
    });
  });
}

// Function to move the Tetromino
function moveTetromino(dx, dy) {
  console.log(`Moving Tetromino by dx: ${dx}, dy: ${dy}`);

  // Clear the Tetromino's current position
  clearTetromino();

  // Check new position boundaries
  if (!isMoveValid(dx, dy)) {
    console.log('Invalid move: Out of bounds or collision detected');
    if (dy === 1) { // Tetromino is moving downward and collides
      lockTetromino(); // Lock the Tetromino in place
      spawnNewTetromino(); // Spawn a new Tetromino
    }
    return; // If the move is not valid, exit the function
  }

  // Update Tetromino's position
  currentX += dx;
  currentY += dy;

  // Place the Tetromino at its new position
  placeTetromino();
  drawGrid(); // Redraw the grid after movement
}

// Function to check if the new move is valid
function isMoveValid(dx, dy, tetromino = currentTetromino) {
  console.log('Checking if move is valid');
  for (let rIndex = 0; rIndex < tetromino.length; rIndex++) {
    for (let cIndex = 0; cIndex < tetromino[rIndex].length; cIndex++) {
      if (tetromino[rIndex][cIndex] !== 0) {
        let newX = currentX + dx + cIndex;
        let newY = currentY + dy + rIndex;
        // Check boundaries
        if (newX < 0 || newX >= cols || newY >= rows) return false; // Out of horizontal or vertical bounds
        if (grid[newY] && grid[newY][newX] !== 0) return false; // Collision with existing blocks
      }
    }
  }
  return true; // Valid move
}

// Function to lock the Tetromino in place
function lockTetromino() {
  console.log('Locking Tetromino in place');
  currentTetromino.forEach((row, rIndex) => {
    row.forEach((value, cIndex) => {
      if (value !== 0) {
        grid[currentY + rIndex][currentX + cIndex] = value; // Lock position in grid
      }
    });
  });

  clearFullRows(); // Optionally clear completed rows
}

// Function to clear the current Tetromino from the grid
function clearTetromino() {
  currentTetromino.forEach((row, rIndex) => {
    row.forEach((value, cIndex) => {
      if (value !== 0 && grid[currentY + rIndex] && grid[currentY + rIndex][currentX + cIndex] !== undefined) {
        grid[currentY + rIndex][currentX + cIndex] = 0; // Clear current position in grid
      }
    });
  });
}

// Function to place the current Tetromino on the grid
function placeTetromino() {
  currentTetromino.forEach((row, rIndex) => {
    row.forEach((value, cIndex) => {
      if (value !== 0 && grid[currentY + rIndex] && grid[currentY + rIndex][currentX + cIndex] !== undefined) {
        grid[currentY + rIndex][currentX + cIndex] = value; // Update grid with new position
      }
    });
  });
}

// Function to spawn a new Tetromino
function spawnNewTetromino() {
  console.log('Spawning a new Tetromino');
  const tetrominoKeys = Object.keys(tetrominos);
  const randomKey = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
  currentTetromino = tetrominos[randomKey];
  currentX = 4; // Reset horizontal position
  currentY = 0; // Reset vertical position

  if (!isMoveValid(0, 0)) {
    console.log('Game Over');
    clearInterval(gameInterval); // Stop the game if no valid moves are available
    alert('Game Over');
  }
}

// Function to clear full rows
function clearFullRows() {
  console.log('Checking for full rows to clear');
  for (let row = rows - 1; row >= 0; row--) {
    if (grid[row].every(cell => cell !== 0)) {
      grid.splice(row, 1); // Remove the full row
      grid.unshift(Array(cols).fill(0)); // Add a new empty row at the top
      console.log(`Cleared row ${row}`);
      updateScore(); // Increase score for clearing a row
      row++; // Recheck the current row index after shifting
    }
  }
}

// Function to update score
function updateScore() {
  score += 100; // Increment score by 100 points for each cleared row
  console.log(`Score updated: ${score}`);
  document.getElementById('scoreboard').innerText = `Score: ${score}`; // Update the scoreboard
}

// Function to rotate the Tetromino
function rotateTetromino() {
  console.log('Attempting to rotate Tetromino');

  // Clear the Tetromino's current position
  clearTetromino();

  // Create a new rotated Tetromino
  const newTetromino = rotateMatrix(currentTetromino); // Rotate the Tetromino

  // Adjust position if the rotation goes out of bounds
  if (!isMoveValid(0, 0, newTetromino)) {
    // Try moving the Tetromino left or right to fit
    for (let shift = -1; shift <= 1; shift++) {
      if (isMoveValid(shift, 0, newTetromino)) {
        currentX += shift; // Adjust horizontal position
        break;
      }
    }
    if (!isMoveValid(0, 0, newTetromino)) {
      console.log('Invalid rotation: Out of bounds or collision detected');
      placeTetromino(); // Reapply the original Tetromino
      return; // If still not valid, do not rotate
    }
  }

  console.log('Rotation successful');
  currentTetromino = newTetromino; // Apply rotation
  placeTetromino(); // Place the rotated Tetromino
  drawGrid(); // Redraw the grid after rotation
}

// Helper function to rotate a matrix clockwise
function rotateMatrix(matrix) {
  return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
  console.log(`Key pressed: ${event.key}`);
  switch (event.key.toLowerCase()) {
    case 'arrowleft':
      moveTetromino(-1, 0); // Move left
      break;
    case 'arrowright':
      moveTetromino(1, 0); // Move right
      break;
    case 'arrowdown':
      moveTetromino(0, 1); // Move down
      break;
    case 'arrowup': // Use up arrow to rotate
      rotateTetromino(); // Rotate the Tetromino
      break;
    case ' ':
      startFastDrop(); // Start fast drop while space is held down
      break;
  }
});

// Handle key release to reset speed
document.addEventListener('keyup', (event) => {
  if (event.key === ' ') {
    resetDropSpeed(); // Reset drop speed when space is released
  }
});

// Function to start fast drop
function startFastDrop() {
  console.log('Starting fast drop');
  clearInterval(gameInterval); // Clear the current interval
  gameInterval = setInterval(() => moveTetromino(0, 1), fastDropInterval); // Faster drop speed
}

// Function to reset drop speed
function resetDropSpeed() {
  console.log('Resetting drop speed');
  clearInterval(gameInterval); // Clear the current interval
  gameInterval = setInterval(() => moveTetromino(0, 1), dropInterval); // Normal drop speed
}

// Initialize the game
function startGame() {
  console.log('Starting the game');
  drawGrid();
  gameInterval = setInterval(() => {
    moveTetromino(0, 1); // Regular downward movement
  }, dropInterval);
}

// Start the game when the page loads
window.onload = function () {
  console.log('Window loaded, starting game');
  startGame();
};
