// sudoku/sudoku.js
// Core logic for vanilla JS Sudoku game

///// UTILITIES /////
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function deepClone(grid) {
  return grid.map(r => r.slice());
}

function inBox(row, col) {
  // Returns [boxRow, boxCol] for a cell
  return [Math.floor(row / 3), Math.floor(col / 3)];
}

///// SUDOKU BOARD VALIDATION /////
function isValid(grid, row, col, val, ignoreCell) {
  for (let i = 0; i < 9; i++) {
    if ((i !== col || ignoreCell !== true) && grid[row][i] === val && i !== col) return false; // Row
    if ((i !== row || ignoreCell !== true) && grid[i][col] === val && i !== row) return false; // Col
  }
  let [boxRow, boxCol] = inBox(row, col);
  for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
    for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
      if ((r !== row || c !== col || ignoreCell !== true) && grid[r][c] === val && (r !== row || c !== col)) {
        return false;
      }
    }
  }
  return true;
}

function findConflicts(grid, row, col, val) {
  // Returns true if value at (row, col) causes conflict
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === val && i !== col) return true;
    if (grid[i][col] === val && i !== row) return true;
  }
  let [boxRow, boxCol] = inBox(row, col);
  for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
    for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
      if (grid[r][c] === val && (r !== row || c !== col)) return true;
    }
  }
  return false;
}

///// SUDOKU SOLVER /////
function solveSudoku(grid) {
  let empty = null;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!grid[r][c]) { empty = [r, c]; break; }
  if (!empty) return true;
  let [row, col] = empty;
  let numbers = shuffle([1,2,3,4,5,6,7,8,9]);
  for (let num of numbers) {
    if (isValid(grid, row, col, num, true)) {
      grid[row][col] = num;
      if (solveSudoku(grid)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

function countSolutions(grid, lim=2) {
  // Counts number of solutions (for uniqueness check), short-circuits at lim
  let empty = null;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!grid[r][c]) { empty = [r, c]; break; }
  if (!empty) return 1;
  let [row, col] = empty;
  let total = 0;
  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num, true)) {
      grid[row][col] = num;
      total += countSolutions(grid, lim - total);
      if (total >= lim) break;
      grid[row][col] = 0;
    }
  }
  grid[row][col] = 0;
  return total;
}

///// SUDOKU PUZZLE GENERATOR /////
function generateFullBoard() {
  let grid = Array.from({length: 9}, () => Array(9).fill(0));
  solveSudoku(grid); // Backtracking fill with shuffle
  return grid;
}

const DIFFICULTY_CLUES = {
  easy:   [36, 43],  // random range for variety
  medium: [30, 35],
  hard:   [22, 29],
};

function generatePuzzle(difficulty) {
  // Generate a new puzzle; guarantee unique solution.
  let [minClues, maxClues] = DIFFICULTY_CLUES[difficulty] || DIFFICULTY_CLUES["medium"];

  let board = generateFullBoard();
  let solution = deepClone(board);

  // Choose clues
  let cells = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
  shuffle(cells);
  let totalClues = Math.floor(Math.random() * (maxClues - minClues + 1)) + minClues;

  let toClear = cells.slice(totalClues);
  for (let [r, c] of toClear) board[r][c] = 0;

  // Remove more while maintaining at least minClues and unique solution
  for (let idx = 0; idx < toClear.length; idx++) {
    let [r, c] = toClear[idx];
    let guard = board[r][c];
    board[r][c] = 0;
    if (countSolutions(deepClone(board), 2) > 1 ||
        (board.flat().filter(x => x > 0).length < minClues)) {
      board[r][c] = guard;
    }
  }

  return { puzzle: board, solution };
}

///// SUDOKU UI LOGIC /////
const gridEl = document.getElementById('sudoku-grid');
const feedbackEl = document.getElementById('feedback');
const diffSel = document.getElementById('difficulty');
const btnNew = document.getElementById('new-puzzle');
const btnCheck = document.getElementById('check');
const btnReset = document.getElementById('reset');

let puzzle = null;
let solution = null;
let givenMap = null;

function renderBoard(board, givenMap, userBoard={}) {
  gridEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const input = document.createElement('input');
      input.classList.add('sudoku-cell');
      input.maxLength = 1;
      input.inputMode = 'numeric';
      input.setAttribute('data-row', r);
      input.setAttribute('data-col', c);
      if (givenMap[r][c]) {
        input.value = board[r][c];
        input.disabled = true;
        input.classList.add('given');
        input.setAttribute('aria-readonly', 'true');
      } else if (userBoard && userBoard[r] && userBoard[r][c]) {
        input.value = userBoard[r][c];
      } else if (board[r][c]) {
        input.value = board[r][c];
      } else {
        input.value = '';
      }
      input.addEventListener('input', handleInput);
      input.addEventListener('keydown', handleKeyDown);
      input.addEventListener('paste', e => e.preventDefault()); // Disallow paste
      gridEl.appendChild(input);
    }
  }
}

function handleInput(e) {
  let inp = e.target;
  let v = inp.value;
  if (!v || v.length === 0) {
    inp.value = '';
  } else if (/^[1-9]$/.test(v)) {
    inp.value = v;
  } else {
    inp.value = v.replace(/[^1-9]/g, '');
  }
  validateCells();
  feedbackEl.textContent = '';
  feedbackEl.classList.remove('error');
}

function handleKeyDown(e) {
  const inp = e.target;
  const key = e.key;
  // Allow navigation with arrows
  if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab"].includes(key)) return;
  // Allow backspace/delete
  if (key === "Backspace" || key === "Delete") return;
  // Allow 1-9 only
  if (!/^[1-9]$/.test(key)) e.preventDefault();
}

function validateCells() {
  let userBoard = getUserBoard();
  let cells = gridEl.querySelectorAll('.sudoku-cell');
  // First, remove all conflict classes
  cells.forEach(cell => cell.classList.remove('conflict'));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      let idx = r * 9 + c;
      let cell = cells[idx];
      let v = userBoard[r][c];
      if (v && !givenMap[r][c]) {
        if (findConflicts(userBoard, r, c, v)) {
          cell.classList.add('conflict');
        }
      }
    }
  }
}

function getUserBoard() {
  let cells = Array.from(gridEl.querySelectorAll('.sudoku-cell'));
  let board = [];
  for (let r = 0; r < 9; r++) {
    let row = [];
    for (let c = 0; c < 9; c++) {
      let idx = r * 9 + c;
      let val = cells[idx].value.trim();
      row.push(val.length === 1 && /^[1-9]/.test(val) ? parseInt(val, 10) : 0);
    }
    board.push(row);
  }
  return board;
}

function setSolvedStyle(isSolved) {
  let cells = gridEl.querySelectorAll('.sudoku-cell');
  if (isSolved) {
    cells.forEach(cell => {
      if (!cell.classList.contains('given')) cell.classList.add('solved');
    });
  } else {
    cells.forEach(cell => cell.classList.remove('solved'));
  }
}

function handleCheck() {
  const userBoard = getUserBoard();
  // Check if fully filled and correct
  let isFull = userBoard.flat().every(x => x > 0);
  if (!isFull) {
    feedbackEl.textContent = 'Incomplete!';
    feedbackEl.classList.add('error');
    setSolvedStyle(false);
    return;
  }
  // Check for conflicts
  let isWrong = false;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (userBoard[r][c] !== solution[r][c]) isWrong = true;
  }
  if (isWrong) {
    feedbackEl.textContent = 'Incorrect! Some values are not correct.';
    feedbackEl.classList.add('error');
    setSolvedStyle(false);
  } else {
    feedbackEl.textContent = 'Solved!';
    feedbackEl.classList.remove('error');
    setSolvedStyle(true);
  }
}

function handleReset() {
  let userBoard = getUserBoard();
  let blankUser = [];
  for (let r = 0; r < 9; r++) {
    let row = [];
    for (let c = 0; c < 9; c++) row.push(0);
    blankUser.push(row);
  }
  renderBoard(puzzle, givenMap, blankUser);
  setTimeout(validateCells, 50);
  feedbackEl.textContent = '';
  feedbackEl.classList.remove('error');
}

function newPuzzle(difficulty) {
  feedbackEl.classList.remove('error');
  feedbackEl.textContent = 'Generating...';
  setTimeout(() => {
    const { puzzle: p, solution: sol } = generatePuzzle(difficulty);
    puzzle = p;
    solution = sol;
    givenMap = puzzle.map(row => row.map(cell => cell !== 0));
    renderBoard(puzzle, givenMap);
    setTimeout(validateCells, 80);
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('error');
  }, 20);
}

btnNew.addEventListener('click', () => {
  newPuzzle(diffSel.value);
});
diffSel.addEventListener('change', () => {
  newPuzzle(diffSel.value);
});
btnCheck.addEventListener('click', handleCheck);
btnReset.addEventListener('click', handleReset);

// On page load:
document.addEventListener('DOMContentLoaded', () => {
  newPuzzle(diffSel.value);
});
