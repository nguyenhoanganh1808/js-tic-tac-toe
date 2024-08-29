const board = (function BoardGame() {
  const rows = 3;
  const columns = 3;
  const board = [];

  const getBoard = () => board;

  const dropToken = (row, column, player) => {
    const cell = board[row][column];

    if (row >= 3 || column >= 3 || !cell.checkIsCellEmpty()) {
      return false;
    }

    cell.addToken(player);
  };

  const checkBoardCondition = (condition) => {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (!condition(board[i][j])) {
          return false;
        }
      }
    }
    return true;
  };

  const checkIsBoardEmpty = () =>
    checkBoardCondition((cell) => cell.checkIsCellEmpty());

  const checkIsGameOver = () =>
    checkBoardCondition((cell) => !cell.checkIsCellEmpty());

  const checkWinner = (playerToken) => {
    const winningCount = 3;

    for (let i = 0; i < rows; i++) {
      let rowsCount = 0;
      let columnsCount = 0;

      for (let j = 0; j < columns; j++) {
        if (board[i][j].getValue() === playerToken) rowsCount++;
        if (board[j][i].getValue() === playerToken) columnsCount++;
      }

      if (rowsCount === winningCount || columnsCount === winningCount) {
        return true;
      }
    }

    //check diagonals
    let diagonals1 = 0;
    let diagonals2 = 0;
    for (let i = 0; i < rows; i++) {
      if (board[i][i].getValue() === playerToken) {
        diagonals1++;
      }
      if (board[i][columns - i - 1].getValue() === playerToken) {
        diagonals2++;
      }
    }

    return diagonals1 === winningCount || diagonals2 === winningCount;
  };

  const resetBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
    }
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  return {
    getBoard,
    dropToken,
    printBoard,
    checkIsGameOver,
    checkIsBoardEmpty,
    checkWinner,
    resetBoard,
  };
})();

function Cell() {
  let value = 0;

  const addToken = (player) => {
    value = player;
  };

  const checkIsCellEmpty = () => value === 0;

  const getValue = () => value;

  return {
    addToken,
    getValue,
    checkIsCellEmpty,
  };
}

function Player(name, token) {
  const getName = () => name;
  const getToken = () => token;

  return {
    getName,
    getToken,
  };
}

const game = (function GameController() {
  //set default name
  const player1 = Player("1", 1);
  const player2 = Player("2", 2);
  let players = [player1, player2];
  let isGameStart = false;
  board.resetBoard();

  let activePlayer = players[0];
  const getActivePlayer = () => activePlayer;
  const getIsGameStart = () => isGameStart;

  const getPlayers = () => players;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const startOrRestartGame = () => {
    // players = [player1, player2];
    isGameStart = true;
    board.resetBoard();
  };

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().getName()}'s turn`);
  };

  const setPlayersName = (player1Name, player2Name) => {
    players = [Player(player1Name, 1), Player(player2Name, 2)];
    activePlayer = players[0];
    board.resetBoard();
  };

  const playRound = (row, column) => {
    console.log(
      `Dropping ${getActivePlayer().getName()}'s token ${getActivePlayer().getToken()} into row ${row}, column ${column}`
    );
    const isFalse = board.dropToken(row, column, getActivePlayer().getToken());

    if (isFalse === false) {
      console.log("Drop failed, please choose another cell");
      printNewRound();
      return;
    }

    if (board.checkWinner(getActivePlayer().getToken())) {
      console.log(`Winner is ${getActivePlayer().getName()}`);
      return;
    }

    if (board.checkIsGameOver()) {
      console.log(`DRAW!!!!!`);
      return;
    }

    switchPlayerTurn();
    printNewRound();
  };

  return {
    getActivePlayer,
    getBoard: board.getBoard,
    resetGame: board.resetBoard,
    playRound,
    getIsGameStart,
    startOrRestartGame,
    getPlayers,
    setPlayersName,
    checkWinner: board.checkWinner,
    checkIsGameOver: board.checkIsGameOver,
  };
})();

function ScreenController() {
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const formDialog = document.querySelector("dialog");
  const openDialogButton = document.querySelector("#open-dialog");
  const closeDialogButton = document.querySelector("#cancel-btn");
  const submitDialogButton = document.querySelector("#submit-btn");
  const player1Input = document.querySelector("#player1-name");
  const player2Input = document.querySelector("#player2-name");
  const player1H1 = document.querySelector("#player1");
  const player2H1 = document.querySelector("#player2");
  const btnControlGame = document.querySelector(".control-game-button");

  const showModal = () => {
    formDialog.showModal();
  };

  const closeModal = (e) => {
    e.preventDefault();
    formDialog.close();
  };

  const submitSetPlayerForm = (e) => {
    e.preventDefault();
    const player1Name = player1Input.value;
    const player2Name = player2Input.value;

    game.setPlayersName(player1Name, player2Name);

    formDialog.close();
    updateScreen();
  };

  const startOrRestartGame = (e) => {
    btnControlGame.textContent = "Restart Game";
    game.startOrRestartGame();
    updateScreen();
  };

  btnControlGame.addEventListener("click", startOrRestartGame);

  openDialogButton.addEventListener("click", showModal);
  closeDialogButton.addEventListener("click", closeModal);
  submitDialogButton.addEventListener("click", submitSetPlayerForm);

  const updateScreen = () => {
    boardDiv.textContent = "";

    const gameBoard = game.getBoard();
    const activePlayer = game.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.getName()}'s Turn `;

    const players = game.getPlayers();

    player1H1.textContent = `Player ${players[0].getName()}: X`;
    player2H1.textContent = `Player ${players[1].getName()}: O`;

    const isBoardEmpty = board.checkIsBoardEmpty();
    if (!isBoardEmpty || game.getIsGameStart()) {
      btnControlGame.textContent = "Restart Game";
    } else {
      btnControlGame.textContent = "Start Game";
    }

    gameBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");

        cellButton.dataset.rowIndex = rowIndex;
        cellButton.dataset.colIndex = colIndex;

        let cellValue = "";
        if (cell.getValue() !== 0) {
          cellValue = cell.getValue() === 1 ? "X" : "O";
        }

        cellButton.textContent = cellValue;

        boardDiv.appendChild(cellButton);
      });
    });

    if (game.checkIsGameOver()) {
      playerTurnDiv.textContent = "DRAW!!!!";
    }

    if (game.checkWinner(activePlayer.getToken())) {
      playerTurnDiv.textContent = `The winner is ${activePlayer.getName()}`;
    }
  };

  const clickHandlerBoard = (e) => {
    if (!game.getIsGameStart()) {
      return;
    }
    const selectedColumn = e.target.dataset.colIndex;
    const selectedRow = e.target.dataset.rowIndex;

    game.playRound(selectedRow, selectedColumn);
    updateScreen();
  };

  boardDiv.addEventListener("click", clickHandlerBoard);

  updateScreen();
}

ScreenController();
