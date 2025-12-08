/**
 * 轻量级饼状图绘制工具
 * 支持微信小程序canvas
 */
class PieChart {
  constructor(canvasId, context, data = [], options = {}) {
    this.canvasId = canvasId;
    this.ctx = context;
    this.data = data;
    this.options = Object.assign({
      width: 300,
      height: 300,
      radius: 100,
      innerRadius: 0,
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      label: {
        show: true,
        fontSize: 12,
        color: '#333'
      },
      legend: {
        show: true,
        position: 'right',
        fontSize: 12
      }
    }, options);

    this.total = this.calculateTotal();
  }

  calculateTotal() {
    return this.data.reduce((sum, item) => sum + (item.value || 0), 0);
  }

  draw() {
    const { ctx, options, data, total } = this;
    const { width, height, radius, innerRadius, colors, label, legend } = options;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 计算中心点
    const centerX = width / 2;
    const centerY = height / 2;

    let startAngle = -Math.PI / 2; // 从顶部开始

    // 绘制饼图
    data.forEach((item, index) => {
      const value = item.value || 0;
      const percentage = total > 0 ? value / total : 0;
      const endAngle = startAngle + percentage * 2 * Math.PI;

      // 设置颜色
      ctx.setFillStyle(colors[index % colors.length]);

      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      ctx.closePath();
      ctx.fill();

      // 绘制标签
      if (label.show && percentage > 0) {
        const midAngle = startAngle + percentage * Math.PI;
        const labelRadius = radius + 30;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;

        ctx.setFillStyle(label.color);
        ctx.setFontSize(label.fontSize);
        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle');

        const labelText = item.name || `数据${index + 1}`;
        const percentageText = `(${((percentage * 100).toFixed(1))}%)`;

        ctx.fillText(labelText, labelX, labelY - 10);
        ctx.fillText(percentageText, labelX, labelY + 10);
      }

      // 更新起始角度
      startAngle = endAngle;
    });

    // 绘制图例
    if (legend.show && legend.position === 'right') {
      const legendX = centerX + radius + 50;
      const legendY = centerY - (data.length * 20) / 2;

      data.forEach((item, index) => {
        const itemY = legendY + index * 20;

        // 绘制颜色方块
        ctx.setFillStyle(colors[index % colors.length]);
        ctx.fillRect(legendX, itemY - 5, 12, 12);

        // 绘制文字
        ctx.setFillStyle('#333');
        ctx.setFontSize(legend.fontSize);
        ctx.setTextAlign('left');
        ctx.setTextBaseline('middle');
        ctx.fillText(item.name || `数据${index + 1}`, legendX + 20, itemY);
      });
    }
  }
}

// 导出供小程序使用
module.exports = PieChart;