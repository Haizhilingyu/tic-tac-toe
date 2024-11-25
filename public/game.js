const socket = io();
const gameBoard = document.getElementById('gameBoard');
const joinGameBtn = document.getElementById('joinGame');
const resetGameBtn = document.getElementById('resetGame');
const statusMessage = document.getElementById('statusMessage');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');

// 聊天相关元素
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');

let roomId = 'game1';
let playerSymbol = null;
let gameOver = false;

function updateStatus(message) {
    statusMessage.textContent = message;
}

function updateCell(cell, value) {
    cell.textContent = value;
    cell.classList.remove('x', 'o');
    if (value === 'X') {
        cell.classList.add('x');
    } else if (value === 'O') {
        cell.classList.add('o');
    }
}

joinGameBtn.addEventListener('click', () => {
    socket.emit('joinGame', roomId);
    joinGameBtn.disabled = true;
    console.log('发送加入游戏请求');
});

resetGameBtn.addEventListener('click', () => {
    socket.emit('resetGame', roomId);
    gameOver = false;
    updateStatus('游戏已重置');
    console.log('发送重置游戏请求');
});

gameBoard.addEventListener('click', (e) => {
    if (gameOver) {
        updateStatus('游戏已结束，请点击"重新开始"开始新游戏');
        return;
    }
    
    const cell = e.target;
    if (cell.classList.contains('cell') && !cell.textContent) {
        const index = cell.dataset.index;
        console.log('尝试落子:', index, '玩家符号:', playerSymbol);
        socket.emit('makeMove', { roomId, index });
    }
});

socket.on('playerAssigned', (data) => {
    playerSymbol = data.symbol;
    updateStatus(`你被分配为玩家 ${playerSymbol}`);
    console.log('收到玩家分配:', playerSymbol);
});

socket.on('gameState', (game) => {
    console.log('收到游戏状态更新:', game);
    
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < cells.length; i++) {
        updateCell(cells[i], game.board[i]);
    }
    
    if (game.scores) {
        scoreX.textContent = game.scores.X;
        scoreO.textContent = game.scores.O;
    }
    
    const currentPlayerSymbol = game.players[game.currentPlayer]?.symbol;
    if (currentPlayerSymbol === playerSymbol) {
        updateStatus('轮到你的回合');
    } else {
        updateStatus('等待对手落子');
    }
    
    gameOver = game.gameOver;
    resetGameBtn.disabled = !gameOver;
});

socket.on('gameEnd', (result) => {
    gameOver = true;
    if (result.winner === 'draw') {
        updateStatus('游戏平局！');
    } else {
        updateStatus(`玩家 ${result.winner} 获胜！`);
    }
    
    scoreX.textContent = result.scores.X;
    scoreO.textContent = result.scores.O;
    resetGameBtn.disabled = false;
    
    console.log('游戏结束:', result);
});

// 错误处理
socket.on('connect_error', (error) => {
    console.error('连接错误:', error);
    updateStatus('连接错误，请刷新页面重试');
});

socket.on('connect', () => {
    console.log('连接成功');
    updateStatus('已连接到服务器');
});

socket.on('disconnect', () => {
    console.log('断开连接');
    updateStatus('与服务器断开连接');
});

// 发送消息函数
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chatMessage', {
            roomId: roomId,
            message: message
        });
        messageInput.value = '';
    }
}

// 添加消息到聊天框
function addMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message' + 
        (data.playerId === socket.id ? ' my-message' : '');
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = data.timestamp;

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `
        <span class="player-symbol ${data.playerSymbol.toLowerCase()}">${data.playerSymbol}</span>
        <span class="message-text">${data.message}</span>
    `;

    messageDiv.appendChild(time);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到最新消息
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 绑定发送消息事件
sendMessageBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 接收消息事件
socket.on('chatMessage', (data) => {
    addMessage(data);
}); 