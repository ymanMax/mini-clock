// snake.js
Page({
  data: {
    score: 0,
    highScore: 0,
    gameState: 'ready', // ready, playing, paused, gameOver, win
    isPaused: false
  },

  // 游戏配置
  gameConfig: {
    gridSize: 20, // 网格大小
    snakeSpeed: 150, // 移动速度（毫秒）
    winScore: 30 // 获胜分数
  },

  // 游戏状态
  snake: [], // 蛇身，数组元素为{x, y, color}
  direction: 'right', // 当前方向
  nextDirection: 'right', // 下一个方向
  food: {}, // 食物位置和颜色{x, y, color}
  gameCanvas: null, // canvas上下文
  gameLoop: null, // 游戏循环定时器
  touchStartX: 0, // 触摸起始X坐标
  touchStartY: 0, // 触摸起始Y坐标

  onLoad: function (options) {
    // 页面加载时的初始化工作
    console.log('Snake game loaded');
    
    // 获取最高分
    const highScore = wx.getStorageSync('snakeHighScore') || 0;
    this.setData({ highScore });
    
    // 初始化蛇和食物
    this.initGame();
  },

  onReady: function () {
    // 页面初次渲染完成时的处理
    this.initCanvas();
  },

  onShow: function () {
    // 页面显示时的处理
  },

  onUnload: function () {
    // 页面卸载时的处理
    this.stopGameLoop();
  },

  // 初始化游戏
  initGame: function () {
    // 初始化蛇身
    const gridSize = this.gameConfig.gridSize;
    const startX = Math.floor(gridSize / 2);
    const startY = Math.floor(gridSize / 2);
    
    this.snake = [{
      x: startX,
      y: startY,
      color: this.getRandomColor()
    }];
    
    // 初始化方向
    this.direction = 'right';
    this.nextDirection = 'right';
    
    // 生成食物
    this.generateFood();
    
    // 重置分数
    this.setData({ score: 0 });
  },

  // 初始化canvas
  initCanvas: function () {
    // 创建canvas上下文
    const ctx = wx.createCanvasContext('snakeCanvas');

    // 获取canvas尺寸
    const query = wx.createSelectorQuery();
    query.select('.game-canvas').boundingClientRect((rect) => {
      if (!rect) return;

      this.canvasWidth = rect.width;
      this.canvasHeight = rect.height;
      this.cellSize = Math.min(this.canvasWidth, this.canvasHeight) / this.gameConfig.gridSize;

      // 开始渲染
      this.gameCanvas = ctx;
      this.renderGame();
    }).exec();
  },

  // 生成随机颜色
  getRandomColor: function () {
    const colors = [
      '#ff5556', '#ffbd55', '#4caf50', '#2196f3',
      '#9c27b0', '#ff9800', '#00bcd4', '#e91e63'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // 生成食物
  generateFood: function () {
    let newFood;
    let isOnSnake;
    
    do {
      // 随机生成食物位置
      newFood = {
        x: Math.floor(Math.random() * this.gameConfig.gridSize),
        y: Math.floor(Math.random() * this.gameConfig.gridSize),
        color: this.getRandomColor()
      };
      
      // 检查食物是否在蛇身上
      isOnSnake = this.snake.some(segment => 
        segment.x === newFood.x && segment.y === newFood.y
      );
    } while (isOnSnake);
    
    this.food = newFood;
  },

  // 开始游戏
  startGame: function () {
    if (!this.gameCanvas) {
      this.initCanvas();
    }
    
    // 重置游戏状态
    this.initGame();
    this.setData({
      gameState: 'playing',
      isPaused: false
    });
    
    // 开始游戏循环
    this.startGameLoop();
  },

  // 开始游戏循环
  startGameLoop: function () {
    // 清除之前的定时器或动画帧
    this.stopGameLoop();

    // 记录游戏开始时间
    this.lastGameUpdateTime = Date.now();

    // 开始新的游戏循环
    const gameLoop = () => {
      if (!this.data.isPaused) {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastGameUpdateTime;

        // 如果已经过了足够的时间，更新游戏状态
        if (deltaTime >= this.gameConfig.snakeSpeed) {
          this.updateGame();
          this.lastGameUpdateTime = currentTime;
        }

        // 渲染游戏画面
        this.renderGame();
      }

      // 继续下一个动画帧
      this.gameLoop = wx.requestAnimationFrame(gameLoop);
    };

    // 启动游戏循环
    gameLoop();
  },

  // 停止游戏循环
  stopGameLoop: function () {
    if (this.gameLoop) {
      wx.cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  },

  // 切换暂停状态
  togglePause: function () {
    const isPaused = !this.data.isPaused;
    this.setData({ isPaused });
  },

  // 更新游戏状态
  updateGame: function () {
    // 更新方向
    this.direction = this.nextDirection;
    
    // 计算新的蛇头位置
    const head = { ...this.snake[0] };
    
    switch (this.direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }
    
    // 检查是否撞墙
    if (
      head.x < 0 || 
      head.x >= this.gameConfig.gridSize || 
      head.y < 0 || 
      head.y >= this.gameConfig.gridSize
    ) {
      this.endGame(false);
      return;
    }
    
    // 检查是否撞到自己
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.endGame(false);
      return;
    }
    
    // 添加新的蛇头
    this.snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      // 增加分数
      const newScore = this.data.score + 1;
      this.setData({ score: newScore });
      
      // 检查是否获胜
      if (newScore >= this.gameConfig.winScore) {
        this.endGame(true);
        return;
      }
      
      // 生成新的食物
      this.generateFood();
    } else {
      // 移除蛇尾
      this.snake.pop();
    }
  },

  // 渲染游戏界面
  renderGame: function () {
    if (!this.gameCanvas || !this.cellSize) return;

    const ctx = this.gameCanvas;
    const cellSize = this.cellSize;

    // 清空画布
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 绘制食物（先绘制食物，这样蛇可以覆盖在食物上面）
    ctx.setFillStyle(this.food.color);

    // 绘制圆形食物
    const foodX = this.food.x * cellSize + cellSize / 2;
    const foodY = this.food.y * cellSize + cellSize / 2;
    const foodRadius = cellSize / 2 - 2;

    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制食物边框
    ctx.setStrokeStyle('#ffffff');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // 绘制蛇
    this.snake.forEach((segment, index) => {
      // 设置颜色
      ctx.setFillStyle(segment.color);

      // 绘制蛇身
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;

      // 蛇头添加边框
      if (index === 0) {
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        // 绘制蛇头边框
        ctx.setStrokeStyle('#ffffff');
        ctx.setLineWidth(2);
        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      } else {
        // 绘制蛇身，添加间距效果
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      }
    });

    // 渲染到画布
    ctx.draw();
  },

  // 结束游戏
  endGame: function (isWin) {
    // 停止游戏循环
    this.stopGameLoop();
    
    // 更新游戏状态
    this.setData({
      gameState: isWin ? 'win' : 'gameOver'
    });
    
    // 保存最高分
    if (this.data.score > this.data.highScore) {
      wx.setStorageSync('snakeHighScore', this.data.score);
      this.setData({ highScore: this.data.score });
    }
  },

  // 返回菜单
  backToMenu: function () {
    wx.navigateBack();
  },

  // 触摸开始事件
  onTouchStart: function (e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  },

  // 触摸移动事件
  onTouchMove: function (e) {
    // 防止触摸移动干扰游戏
    e.preventDefault();
  },

  // 触摸结束事件
  onTouchEnd: function (e) {
    if (this.data.gameState !== 'playing' || this.data.isPaused) {
      return;
    }
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // 计算触摸方向
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    
    // 确定滑动方向（水平或垂直）
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (deltaX > 0 && this.direction !== 'left') {
        this.nextDirection = 'right';
      } else if (deltaX < 0 && this.direction !== 'right') {
        this.nextDirection = 'left';
      }
    } else {
      // 垂直滑动
      if (deltaY > 0 && this.direction !== 'up') {
        this.nextDirection = 'down';
      } else if (deltaY < 0 && this.direction !== 'down') {
        this.nextDirection = 'up';
      }
    }
  },

  // 页面分享功能
  onShareAppMessage: function () {
    return {
      title: '我在贪吃蛇游戏中获得了' + this.data.score + '分！',
      path: '/pages/snake/snake'
    };
  }
});
