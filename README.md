# 实时对战井字棋游戏

一个基于 Node.js 和 Socket.IO 构建的实时对战井字棋游戏，支持双人在线对战、实时聊天等功能。

## 功能特点

### 核心游戏功能
- ✨ 实时双人对战
- 🎮 回合制游戏机制
- 🏆 自动判定胜负
- 📊 实时比分系统
- 🔄 一键重新开始

### 玩家交互
- 💬 实时聊天系统
- 😊 表情选择器
- ⏱️ 回合计时器
- 🔔 游戏音效系统
- 👥 玩家状态显示

### 用户体验
- 🎯 清晰的游戏状态提示
- 🎨 美观的界面设计
- 📱 响应式布局
- ✨ 流畅的动画效果

## 技术栈

- **前端**：HTML5, CSS3, JavaScript
- **后端**：Node.js, Express
- **实时通信**：Socket.IO
- **开发工具**：npm

## 快速开始

1. 克隆项目 

```bash
git clone https://github.com/haizhilingyu/tic-tac-toe.git
cd tic-tac-toe
```

2. 安装依赖

```bash
npm install
```

3. 启动服务器

```bash
node server.js
```

4. 访问游戏

在浏览器中打开 `http://localhost:3000`

## 游戏规则

1. 两名玩家轮流在 3×3 的棋盘上放置自己的符号（X 或 O）
2. 率先在横、竖或对角线上连成一线的玩家获胜
3. 如果棋盘填满仍未分出胜负，则判定为平局

## 项目结构

```bash
ic-tac-toe/
├── public/
│ ├── index.html # 游戏主页面
│ ├── style.css # 样式文件
│ └── game.js # 客户端游戏逻辑
├── server.js # 服务器端代码
├── package.json # 项目配置
└── README.md # 项目文档
```


## 开发计划

- [ ] 添加用户账号系统
- [ ] 实现排行榜功能
- [ ] 添加观战模式
- [ ] 支持自定义房间
- [ ] 添加游戏音乐
- [ ] 优化移动端体验

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 注意事项

- 游戏需要两名玩家同时在线才能开始
- 建议使用现代浏览器以获得最佳体验
- 请确保您的网络连接稳定

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，欢迎联系：
- 邮箱：[haizhilingyu@gmail.com](mailto:haizhilingyu@gmail.com)
- GitHub：[haizhilingyu](https://github.com/haizhilingyu)

## 致谢

感谢所有为这个项目做出贡献的开发者！

---

希望您享受游戏！🎮