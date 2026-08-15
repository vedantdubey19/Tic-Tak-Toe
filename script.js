const cells = [...document.querySelectorAll('.cell')];
const status = document.querySelector('#status');
const scores = { X: 0, O: 0, draw: 0 };
const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];
const human = 'X';
const computer = 'O';
let board, player, playing, computerTimer;

function startRound() {
  clearTimeout(computerTimer);
  board = Array(9).fill('');
  player = human;
  playing = true;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.disabled = false;
    cell.setAttribute('aria-label', `${cell.getAttribute('aria-label').replace(/, [XO]$/, '')}, empty`);
  });
  status.textContent = 'Your turn';
}

function updateScores() {
  document.querySelector('#x-score').textContent = scores.X;
  document.querySelector('#o-score').textContent = scores.O;
  document.querySelector('#draw-score').textContent = scores.draw;
}

function endRound(message, winningLine = []) {
  playing = false;
  status.textContent = message;
  cells.forEach(cell => { cell.disabled = true; });
  winningLine.forEach(index => cells[index].classList.add('win'));
  updateScores();
}

function play(index) {
  if (!playing || player !== human || board[index]) return;
  makeMove(index, human);
}

function makeMove(index, mark) {
  board[index] = mark;
  cells[index].textContent = mark;
  cells[index].classList.add(mark.toLowerCase());
  cells[index].setAttribute('aria-label', `${cells[index].getAttribute('aria-label').replace(/, empty$/, '')}, ${mark}`);

  const winner = winningLines.find(line => line.every(i => board[i] === mark));
  if (winner) {
    scores[mark]++;
    endRound(mark === human ? 'You win!' : 'Computer wins!', winner);
  } else if (board.every(Boolean)) {
    scores.draw++;
    endRound("It's a draw!");
  } else {
    player = mark === human ? computer : human;
    if (player === computer) {
      status.textContent = 'Computer is thinking…';
      cells.forEach(cell => { cell.disabled = true; });
      computerTimer = setTimeout(computerMove, 420);
    } else {
      cells.forEach((cell, index) => { cell.disabled = Boolean(board[index]); });
      status.textContent = 'Your turn';
    }
  }
}

function computerMove() {
  if (!playing) return;
  const move = bestMove();
  cells.forEach((cell, index) => { cell.disabled = Boolean(board[index]); });
  makeMove(move, computer);
}

function bestMove() {
  let bestScore = -Infinity;
  let move = 0;
  board.forEach((value, index) => {
    if (value) return;
    board[index] = computer;
    const score = minimax(board, 0, false);
    board[index] = '';
    if (score > bestScore) {
      bestScore = score;
      move = index;
    }
  });
  return move;
}

function minimax(state, depth, maximizing) {
  const winner = winningLines.find(line => line.every(i => state[i] && state[i] === state[line[0]]));
  if (winner) return state[winner[0]] === computer ? 10 - depth : depth - 10;
  if (state.every(Boolean)) return 0;

  let best = maximizing ? -Infinity : Infinity;
  state.forEach((value, index) => {
    if (value) return;
    state[index] = maximizing ? computer : human;
    const score = minimax(state, depth + 1, !maximizing);
    state[index] = '';
    best = maximizing ? Math.max(best, score) : Math.min(best, score);
  });
  return best;
}

cells.forEach((cell, index) => cell.addEventListener('click', () => play(index)));
document.querySelector('#reset-round').addEventListener('click', startRound);
document.querySelector('#reset-scores').addEventListener('click', () => {
  scores.X = scores.O = scores.draw = 0;
  updateScores();
  startRound();
});

startRound();
