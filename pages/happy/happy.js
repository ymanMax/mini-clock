// happy.js
Page({
  data: {
    // 页面数据
  },

  onLoad: function (options) {
    // 页面加载时的初始化工作
    console.log('Happy page loaded');
  },

  onShow: function () {
    // 页面显示时的处理
  },

  onReady: function () {
    // 页面初次渲染完成时的处理
  },

  // 导航到游戏页面
  navigateToGame: function (e) {
    const game = e.currentTarget.dataset.game;

    switch (game) {
      case 'snake':
        wx.navigateTo({
          url: '/pages/snake/snake'
        });
        break;
      case 'match':
        wx.navigateTo({
          url: '/pages/match/match'
        });
        break;
      default:
        wx.showToast({
          title: '游戏暂未开放',
          icon: 'none',
          duration: 1500
        });
    }
  },

  // 页面分享功能
  onShareAppMessage: function () {
    return {
      title: '小游戏中心 - 番茄Clock',
      path: '/pages/happy/happy'
    };
  }
});
