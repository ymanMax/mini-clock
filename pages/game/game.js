Page({
  data: {
    grid: [],
    score: 0,
    gameStarted: false,
    isPaused: false,
    selectedCell: null,
    isProcessing: false
  },

  onLoad: function() {
    this.initGrid();
  },

  initGrid: function() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8B739', '#52B788',
      '#E76F51', '#2A9D8F', '#E9C46A', '#F4A261',
      '#264653', '#2A9D8F', '#E9C46A', '#F4A261',
      '#E76F51', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8'
    ];

    const grid = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const letterIndex = Math.floor(Math.random() * letters.length);
        grid.push({
          row: row,
          col: col,
          letter: letters[letterIndex],
          color: colors[letterIndex],
          selected: false,
          eliminated: false,
          delay: 0
        });
      }
    }

    this.setData({ grid });
  },

  handleTap: function(e) {
    if (!this.data.gameStarted || this.data.isPaused || this.data.isProcessing) {
      return;
    }

    const { row, col } = e.currentTarget.dataset;
    const clickedIndex = row * 8 + col;

    if (this.data.selectedCell === null) {
      const newGrid = [...this.data.grid];
      newGrid[clickedIndex].selected = true;
      this.setData({
        selectedCell: { row, col },
        grid: newGrid
      });
    } else {
      const { row: selectedRow, col: selectedCol } = this.data.selectedCell;
      const selectedCellIndex = selectedRow * 8 + selectedCol;

      if (clickedIndex === selectedCellIndex) {
        const newGrid = [...this.data.grid];
        newGrid[clickedIndex].selected = false;
        this.setData({
          selectedCell: null,
          grid: newGrid
        });
      } else if (this.isAdjacent(selectedRow, selectedCol, row, col)) {
        this.swapCells(selectedRow, selectedCol, row, col);
      } else {
        const newGrid = [...this.data.grid];
        newGrid[selectedCellIndex].selected = false;
        newGrid[clickedIndex].selected = true;
        this.setData({
          selectedCell: { row, col },
          grid: newGrid
        });
      }
    }
  },

  isAdjacent: function(row1, col1, row2, col2) {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  },

  swapCells: function(row1, col1, row2, col2) {
    this.setData({ isProcessing: true });

    const newGrid = [...this.data.grid];
    const index1 = row1 * 8 + col1;
    const index2 = row2 * 8 + col2;

    newGrid[index1].selected = false;
    newGrid[index2].selected = false;

    const tempLetter = newGrid[index1].letter;
    const tempColor = newGrid[index1].color;
    newGrid[index1].letter = newGrid[index2].letter;
    newGrid[index1].color = newGrid[index2].color;
    newGrid[index2].letter = tempLetter;
    newGrid[index2].color = tempColor;

    this.setData({ grid: newGrid, selectedCell: null });

    setTimeout(() => {
      const matches = this.findMatches();
      if (matches.length > 0) {
        this.eliminateMatches(matches);
      } else {
        this.swapBack(row1, col1, row2, col2);
      }
    }, 300);
  },

  swapBack: function(row1, col1, row2, col2) {
    const newGrid = [...this.data.grid];
    const index1 = row1 * 8 + col1;
    const index2 = row2 * 8 + col2;

    const tempLetter = newGrid[index1].letter;
    const tempColor = newGrid[index1].color;
    newGrid[index1].letter = newGrid[index2].letter;
    newGrid[index1].color = newGrid[index2].color;
    newGrid[index2].letter = tempLetter;
    newGrid[index2].color = tempColor;

    this.setData({ grid: newGrid, isProcessing: false });
  },

  findMatches: function() {
    const matches = new Set();
    const grid = this.data.grid;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 6; col++) {
        const index1 = row * 8 + col;
        const index2 = row * 8 + (col + 1);
        const index3 = row * 8 + (col + 2);

        if (grid[index1].letter === grid[index2].letter &&
            grid[index2].letter === grid[index3].letter) {
          matches.add(index1);
          matches.add(index2);
          matches.add(index3);

          let nextCol = col + 3;
          while (nextCol < 8) {
            const nextIndex = row * 8 + nextCol;
            if (grid[nextIndex].letter === grid[index1].letter) {
              matches.add(nextIndex);
              nextCol++;
            } else {
              break;
            }
          }
        }
      }
    }

    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 6; row++) {
        const index1 = row * 8 + col;
        const index2 = (row + 1) * 8 + col;
        const index3 = (row + 2) * 8 + col;

        if (grid[index1].letter === grid[index2].letter &&
            grid[index2].letter === grid[index3].letter) {
          matches.add(index1);
          matches.add(index2);
          matches.add(index3);

          let nextRow = row + 3;
          while (nextRow < 8) {
            const nextIndex = nextRow * 8 + col;
            if (grid[nextIndex].letter === grid[index1].letter) {
              matches.add(nextIndex);
              nextRow++;
            } else {
              break;
            }
          }
        }
      }
    }

    return Array.from(matches);
  },

  eliminateMatches: function(matches) {
    const newGrid = [...this.data.grid];
    const eliminatedCount = matches.length;

    matches.forEach((index, i) => {
      newGrid[index].eliminated = true;
      newGrid[index].delay = i * 50;
    });

    this.setData({
      grid: newGrid,
      score: this.data.score + eliminatedCount * 10
    });

    setTimeout(() => {
      this.applyGravity();
    }, 600);
  },

  applyGravity: function() {
    const newGrid = [...this.data.grid];

    for (let col = 0; col < 8; col++) {
      let emptyRow = 7;
      for (let row = 7; row >= 0; row--) {
        const index = row * 8 + col;
        if (!newGrid[index].eliminated) {
          if (row !== emptyRow) {
            const emptyIndex = emptyRow * 8 + col;
            newGrid[emptyIndex].letter = newGrid[index].letter;
            newGrid[emptyIndex].color = newGrid[index].color;
            newGrid[emptyIndex].eliminated = false;
            newGrid[index].eliminated = true;
          }
          emptyRow--;
        }
      }

      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8B739', '#52B788',
        '#E76F51', '#2A9D8F', '#E9C46A', '#F4A261',
        '#264653', '#2A9D8F', '#E9C46A', '#F4A261',
        '#E76F51', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8'
      ];

      for (let row = emptyRow; row >= 0; row--) {
        const index = row * 8 + col;
        const letterIndex = Math.floor(Math.random() * letters.length);
        newGrid[index].letter = letters[letterIndex];
        newGrid[index].color = colors[letterIndex];
        newGrid[index].eliminated = false;
      }
    }

    this.setData({ grid: newGrid });

    setTimeout(() => {
      const matches = this.findMatches();
      if (matches.length > 0) {
        this.eliminateMatches(matches);
      } else {
        this.setData({ isProcessing: false });
      }
    }, 300);
  },

  startGame: function() {
    this.setData({
      gameStarted: true,
      isPaused: false,
      score: 0
    });
    this.initGrid();
  },

  pauseGame: function() {
    this.setData({ isPaused: true });
  },

  resumeGame: function() {
    this.setData({ isPaused: false });
  },

  resetGame: function() {
    this.setData({
      gameStarted: false,
      isPaused: false,
      score: 0,
      selectedCell: null,
      isProcessing: false
    });
    this.initGrid();
  }
});
