# tomatoClock

## 番茄时钟 原生微信小程序

微信开发者工具版本：0.1.5.38552

语言：Javascript/WXML/WXSS

系统：Windows 10 专业版

有帮到你的话，star一下吧，谢谢~！


# 图表组件使用指南

## 概述

本项目实现了轻量级的微信小程序图表组件，支持饼状图、折线图、柱状图等多种图表类型。所有图表组件均使用纯JavaScript实现，无需外部依赖。

## 图表数据格式详解

### 1. 饼状图数据格式

**数据结构：**
```javascript
pieChartData: [
  { name: '分类名称1', value: 数值1 },
  { name: '分类名称2', value: 数值2 },
  { name: '分类名称3', value: 数值3 },
  // ... 更多分类
]
```

**字段说明：**
- `name` (String, 必填): 分类名称，用于饼图扇区和图例的显示
- `value` (Number, 必填): 分类对应的数值，决定饼图扇区的大小

**示例：**
```javascript
pieChartData: [
  { name: '工作', value: 120 },
  { name: '学习', value: 90 },
  { name: '写作', value: 60 },
  { name: '阅读', value: 45 },
  { name: '娱乐', value: 75 }
]
```

### 2. 折线图数据格式

**数据结构：**
```javascript
lineChartData: {
  categories: ['类别1', '类别2', '类别3', ...], // X轴分类
  series: [
    {
      name: '系列名称1',
      data: [数值1, 数值2, 数值3, ...] // Y轴数据
    },
    {
      name: '系列名称2',
      data: [数值1, 数值2, 数值3, ...]
    }
  ]
}
```

**字段说明：**
- `categories` (Array, 必填): X轴的分类标签数组
- `series` (Array, 必填): 数据系列数组，每个系列包含以下字段：
  - `name` (String, 必填): 数据系列名称，用于图例显示
  - `data` (Array, 必填): Y轴数据数组，长度需与categories一致

**示例：**
```javascript
lineChartData: {
  categories: ['周一', '周二', '周三', '周四', '周五'],
  series: [
    {
      name: '工作时长',
      data: [8, 7.5, 9, 6, 8.5]
    },
    {
      name: '学习时长',
      data: [2, 1.5, 3, 2.5, 1]
    }
  ]
}
```

### 3. 柱状图数据格式

**数据结构：**
```javascript
barChartData: {
  categories: ['类别1', '类别2', '类别3', ...], // X轴分类
  series: [
    {
      name: '系列名称1',
      data: [数值1, 数值2, 数值3, ...] // Y轴数据
    },
    {
      name: '系列名称2',
      data: [数值1, 数值2, 数值3, ...]
    }
  ]
}
```

**字段说明：**
- 柱状图的数据格式与折线图完全一致，便于在不同图表类型间切换
- `categories` 和 `series` 的字段含义与折线图相同

**示例：**
```javascript
barChartData: {
  categories: ['工作', '学习', '写作', '阅读', '娱乐'],
  series: [
    {
      name: '今日时长',
      data: [120, 90, 60, 45, 75]
    },
    {
      name: '昨日时长',
      data: [100, 120, 45, 60, 90]
    }
  ]
}
```

## 图表组件使用方法

### 1. 导入图表组件

在需要使用图表的页面js文件中导入图表组件：

```javascript
import PieChart from './pie-chart.js'
```

### 2. 在wxml中添加canvas元素

```xml
<canvas
  canvas-id="pieChart"
  class="pie-chart-canvas"
  bindtouchstart="onChartTouchStart"
  bindtouchmove="onChartTouchMove"
  bindtouchend="onChartTouchEnd">
</canvas>
```

### 3. 在wxss中设置canvas样式

```css
.pie-chart-canvas {
  width: 100%;
  height: 400rpx;
}
```

### 4. 在js中初始化图表

```javascript
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
}
```

## 图表配置选项

### 饼图配置选项

```javascript
{
  width: 300,           // 画布宽度
  height: 300,          // 画布高度
  radius: 100,          // 饼图外半径
  innerRadius: 0,       // 饼图内半径（0为实心饼图）
  colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'], // 颜色数组
  label: {
    show: true,          // 是否显示标签
    fontSize: 12,        // 标签字体大小
    color: '#333'        // 标签颜色
  },
  legend: {
    show: true,          // 是否显示图例
    position: 'right',   // 图例位置 ('right', 'bottom', 'left', 'top')
    fontSize: 12          // 图例字体大小
  }
}
```

## 注意事项

1. 确保canvas元素有足够的尺寸来显示图表
2. 图表数据更新后，需要重新调用`draw()`方法来重绘图表
3. 在页面`onShow`或`onReady`生命周期中初始化图表，以确保canvas元素已经渲染完成
4. 颜色数组的长度至少要等于数据系列的数量或分类的数量

## 示例代码

详细的示例代码可以参考`pages/logs/`目录下的实现，该页面包含了一个完整的饼状图实现示例。
