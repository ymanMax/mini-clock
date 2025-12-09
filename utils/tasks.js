// tasks.js
// 任务数据管理模块

// 从本地存储获取任务数据，如果没有则使用默认数据
function getStoredTasks() {
    try {
        const storedTasks = wx.getStorageSync('tasks');
        if (storedTasks && Array.isArray(storedTasks)) {
            return storedTasks;
        }
    } catch (error) {
        console.error('获取存储的任务数据失败:', error);
    }

    // 默认任务数据
    return [
        {
            icon: "gongzuo.png",
            text: "工作",
        },
        {
            icon: "xuexi.png",
            text: "学习",
        },
        {
            icon: "xiezuo.png",
            text: "写作",
        },
        {
            icon: "yuedu.png",
            text: "阅读",
        },
        {
            icon: "yule.png",
            text: "娱乐",
        }
    ];
}

// 初始化任务数据
let tasks = getStoredTasks();

// 获取所有任务
function getTasks() {
    return tasks;
}

// 添加新任务
function addTask(newTask) {
    tasks.push(newTask);

    // 保存到本地存储，实现数据持久化
    try {
        wx.setStorageSync('tasks', tasks);
    } catch (error) {
        console.error('保存任务数据失败:', error);
    }
}

// 导出模块
module.exports = {
    getTasks,
    addTask
};
