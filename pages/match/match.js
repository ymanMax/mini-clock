// match.js
Page({
  data: {
    gridSize: 8,
    score: 0,
    gameState: 'ready', // ready, playing, paused
    grid: [],
    selectedCell: null,
    letterColors: {
      'A': '#FF6B6B', 'B': '#4ECDC4', 'C': '#45B7D1', 'D': '#96CEB4',
      'E': '#FFEAA7', 'F': '#DDA0DD', 'G': '#98D8C8', 'H': '#F7DC6F',
      'I': '#BB8FCE', 'J': '#85C1E9', 'K': '#F8B739', 'L': '#52B788',
      'M': '#FF85A1', 'N': '#84DCC6', 'O': '#A8DADC', 'P': '#C896FF',
      'Q': '#FF9F1C', 'R': '#2EC4B6', 'S': '#E71D36', 'T': '#FF9F1C',
      'U': '#43AA8B', 'V': '#90BE6D', 'W': '#F9C74F', 'X': '#F8961E',
      'Y': '#F3722C', 'Z': '#F94144'
    }
  },

  onLoad: function (options) {
    this.initGame();
  },

  // 初始化游戏
  initGame: function() {
    const grid = this.generateRandomGrid();
    this.setData({
      grid: grid,
      score: 0,
      gameState: 'ready',
      selectedCell: null
    });
  },

  // 生成随机字母网格
  generateRandomGrid: function() {
    const grid = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < this.data.gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < this.data.gridSize; j++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        grid[i][j] = letters[randomIndex];
      }
    }

    return grid;
  },

  // 开始游戏
  startGame: function() {
    this.setData({
      gameState: 'playing'
    });
  },

  // 暂停游戏
  pauseGame: function() {
    this.setData({
      gameState: 'paused'
    });
  },

  // 重置游戏
  resetGame: function() {
    this.initGame();
  },

  // 点击网格细胞
  onCellTap: function(e) {
    if (this.data.gameState !== 'playing') return;

    const row = e.currentTarget.dataset.row;
    const col = e.currentTarget.dataset.col;
    const cell = {row, col};

    // 如果已经选中了一个细胞
    if (this.data.selectedCell) {
      const selected = this.data.selectedCell;

      // 检查是否相邻
      if (this.isAdjacent(selected, cell)) {
        // 交换字母
        this.swapLetters(selected, cell);
      }

      // 清除选中状态
      this.setData({
        selectedCell: null
      });
    } else {
      // 选中当前细胞
      this.setData({
        selectedCell: cell
      });
    }
  },

  // 检查两个细胞是否相邻
  isAdjacent: function(cell1, cell2) {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  },

  // 交换两个细胞的字母
  swapLetters: function(cell1, cell2) {
    const grid = [...this.data.grid];
    const temp = grid[cell1.row][cell1.col];
    grid[cell1.row][cell1.col] = grid[cell2.row][cell2.col];
    grid[cell2.row][cell2.col] = temp;

    this.setData({
      grid: grid
    });

    // 检查是否有可消除的组合
    setTimeout(() => {
      this.checkAndRemoveMatches();
    }, 300);
  },

  // 检查并消除匹配的字母
  checkAndRemoveMatches: function() {
    let grid = [...this.data.grid];
    let matches = this.findMatches(grid);

    if (matches.length > 0) {
      // 计算分数
      const newScore = this.data.score + matches.length * 10;

      // 消除匹配的字母
      grid = this.removeMatches(grid, matches);

      // 字母下落
      grid = this.dropLetters(grid);

      // 补充新字母
      grid = this.fillEmptySpaces(grid);

      this.setData({
        grid: grid,
        score: newScore
      });

      // 递归检查是否有新的匹配
      setTimeout(() => {
        this.checkAndRemoveMatches();
      }, 500);
    }
  },

  // 查找所有匹配的字母（3个或以上相连）
  findMatches: function(grid) {
    const matches = [];
    const visited = Array(this.data.gridSize).fill().map(() => Array(this.data.gridSize).fill(false));

    // 检查水平匹配
    for (let i = 0; i < this.data.gridSize; i++) {
      let count = 1;
      let currentLetter = grid[i][0];

      for (let j = 1; j < this.data.gridSize; j++) {
        if (grid[i][j] === currentLetter) {
          count++;
        } else {
          if (count >= 3) {
            for (let k = j - count; k < j; k++) {
              if (!visited[i][k]) {
                matches.push({row: i, col: k});
                visited[i][k] = true;
              }
            }
          }
          count = 1;
          currentLetter = grid[i][j];
        }
      }

      // 检查行末尾的匹配
      if (count >= 3) {
        for (let k = this.data.gridSize - count; k < this.data.gridSize; k++) {
          if (!visited[i][k]) {
            matches.push({row: i, col: k});
            visited[i][k] = true;
          }
        }
      }
    }

    // 检查垂直匹配
    for (let j = 0; j < this.data.gridSize; j++) {
      let count = 1;
      let currentLetter = grid[0][j];

      for (let i = 1; i < this.data.gridSize; i++) {
        if (grid[i][j] === currentLetter) {
          count++;
        } else {
          if (count >= 3) {
            for (let k = i - count; k < i; k++) {
              if (!visited[k][j]) {
                matches.push({row: k, col: j});
                visited[k][j] = true;
              }
            }
          }
          count = 1;
          currentLetter = grid[i][j];
        }
      }

      // 检查列末尾的匹配
      if (count >= 3) {
        for (let k = this.data.gridSize - count; k < this.data.gridSize; k++) {
          if (!visited[k][j]) {
            matches.push({row: k, col: j});
            visited[k][j] = true;
          }
        }
      }
    }

    return matches;
  },

  // 消除匹配的字母
  removeMatches: function(grid, matches) {
    const newGrid = [...grid];

    matches.forEach(match => {
      newGrid[match.row][match.col] = null;
    });

    return newGrid;
  },

  // 字母下落
  dropLetters: function(grid) {
    const newGrid = [...grid];

    for (let j = 0; j < this.data.gridSize; j++) {
      let writePos = this.data.gridSize - 1;

      // 从下往上填充非空字母
      for (let i = this.data.gridSize - 1; i >= 0; i--) {
        if (newGrid[i][j] !== null) {
          newGrid[writePos][j] = newGrid[i][j];
          if (writePos !== i) {
            newGrid[i][j] = null;
          }
          writePos--;
        }
      }
    }

    return newGrid;
  },

  // 补充新字母到顶部
  fillEmptySpaces: function(grid) {
    const newGrid = [...grid];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < this.data.gridSize; i++) {
      for (let j = 0; j < this.data.gridSize; j++) {
        if (newGrid[i][j] === null) {
          const randomIndex = Math.floor(Math.random() * letters.length);
          newGrid[i][j] = letters[randomIndex];
        }
      }
    }

    return newGrid;
  },

  // 页面分享功能
  onShareAppMessage: function () {
    return {
      title: '开心消消乐 - 番茄Clock',
      path: '/pages/match/match'
    };
  }
});