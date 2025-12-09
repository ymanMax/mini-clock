// components/add-task-modal/add-task-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 控制弹窗显示/隐藏的属性
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    taskName: '', // 任务名称
    taskIcon: ''   // 任务图标
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 关闭弹窗
    closeModal: function() {
      this.setData({
        show: false,
        taskName: '',
        taskIcon: ''
      });
      this.triggerEvent('close');
    },

    // 取消按钮点击事件
    onCancel: function() {
      this.closeModal();
    },

    // 确认按钮点击事件
    onConfirm: function() {
      const { taskName, taskIcon } = this.data;

      // 验证输入
      if (!taskName.trim()) {
        wx.showToast({
          title: '请输入任务名称',
          icon: 'none'
        });
        return;
      }

      // 创建新任务
      const newTask = {
        icon: taskIcon.trim() || 'default.png', // 默认图标
        text: taskName.trim()
      };

      // 触发父组件的事件，传递新任务数据
      this.triggerEvent('add', { task: newTask });

      // 关闭弹窗
      this.closeModal();
    },

    // 任务名称输入事件
    onTaskNameInput: function(e) {
      this.setData({
        taskName: e.detail.value
      });
    },

    // 任务图标输入事件
    onTaskIconInput: function(e) {
      this.setData({
        taskIcon: e.detail.value
      });
    },

    // 阻止蒙层点击事件冒泡
    preventTouchMove: function() {
      // 空函数，阻止蒙层点击事件冒泡到父组件
    }
  }
})
