//logs.js
import {formatTime} from '../utils/util'
import PieChart from './pie-chart.js'

Page({
  data: {
    logs: [],
    activeIndex: 0,
    dayList: [],
    list: [],
    sum: [
      {
        title: '今日番茄次数',
        val: '0'
      },
      {
        title: '累计番茄次数',
        val: '0'
      },
      {
        title: '今日专注时长',
        val: '0分钟'
      },
      {
        title: '累计专注时长',
        val: '0分钟'
      }
    ],
    cateArr: [
      {
        icon: 'work',
        text: '工作'
      },
      {
        icon: 'study',
        text: '学习'
      },
      {
        icon: 'think',
        text: '思考'
      },
      {
        icon: 'write',
        text: '写作'
      },
      {
        icon: 'sport',
        text: '运动'
      },
      {
        icon: 'read',
        text: '阅读'
      }
    ],
    pieChartData: [
      { name: '工作', value: 120 },
      { name: '学习', value: 90 },
      { name: '写作', value: 60 },
      { name: '阅读', value: 45 },
      { name: '娱乐', value: 75 }
    ]
  },

  onLoad: function () {
  },

  onShow: function () {
    var logs = wx.getStorageSync('logs') || [];
    var day = 0;
    var total = logs.length;
    var dayTime = 0;
    var totalTime = 0;
    var dayList = [];

    if (logs.length > 0) {
      for (var i = 0; i < logs.length; i++) {
        let a = logs[i].date + ""
        let b = formatTime(new Date) + ""

        if (a.slice(0, 10) == b.slice(0, 10)) {
          day = day + 1;
          dayTime = dayTime + parseInt(logs[i].time);
          dayList.push(logs[i]);
          this.setData({
            dayList: dayList,
            list: dayList
          })
        }
        totalTime = totalTime + parseInt(logs[i].time);
      }
      this.setData({
        'sum[0].val': day,
        'sum[1].val': total,
        'sum[2].val': dayTime + '分钟',
        'sum[3].val': totalTime + '分钟'
      })
    }

    // 初始化饼图
    this.initPieChart();
  },

  changeType: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      this.setData({
        list: this.data.dayList
      })
    } else if (index == 1) {
      var logs = wx.getStorageSync('logs') || [];
      this.setData({
        list: logs
      })
    }
    this.setData({
      activeIndex: index
    })
  },

  // 初始化饼图
  initPieChart: function () {
    const ctx = wx.createCanvasContext('pieChart');
    const query = wx.createSelectorQuery();

    query.select('.pie-chart-canvas').boundingClientRect((rect) => {
      if (rect) {
        this.pieChart = new PieChart('pieChart', ctx, this.data.pieChartData, {
          width: rect.width,
          height: rect.height,
          radius: Math.min(rect.width, rect.height) * 0.3,
          innerRadius: Math.min(rect.width, rect.height) * 0.15
        });

        // 绘制饼图
        this.pieChart.draw();
      }
    }).exec();
  },

  // 饼图触摸事件处理
  onChartTouchStart: function (e) {
    // 可以在这里添加触摸交互逻辑
  },

  onChartTouchMove: function (e) {
    // 可以在这里添加触摸交互逻辑
  },

  onChartTouchEnd: function (e) {
    // 可以在这里添加触摸交互逻辑
  }
})