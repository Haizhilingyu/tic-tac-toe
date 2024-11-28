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
let playerName = '';

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

// 添加玩家名称输入处理
function showNameInput() {
    const nameModal = document.getElementById('nameModal');
    const nameInput = document.getElementById('nameInput');
    const submitNameBtn = document.getElementById('submitName');
    
    nameModal.style.display = 'flex';
    
    submitNameBtn.onclick = () => {
        const name = nameInput.value.trim();
        if (name) {
            playerName = name;
            nameModal.style.display = 'none';
            socket.emit('joinGame', { roomId, playerName: name });
            joinGameBtn.disabled = true;
        }
    };
    
    nameInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            submitNameBtn.click();
        }
    };
}

// 修改加入游戏按钮事件
joinGameBtn.addEventListener('click', showNameInput);

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

// 修改玩家分配事件处理
socket.on('playerAssigned', (data) => {
    playerSymbol = data.symbol;
    playerName = data.name;
    updateStatus(`你被分配为玩家 ${data.symbol}（${data.name}）`);
    console.log('收到玩家分配:', playerSymbol, playerName);
});

// 修改游戏状态更新处理
socket.on('gameState', (game) => {
    console.log('收到游戏状态更新:', game);
    
    // 更新玩家列表
    updatePlayersList(game.players);
    
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < cells.length; i++) {
        updateCell(cells[i], game.board[i]);
    }
    
    if (game.scores) {
        scoreX.textContent = game.scores.X;
        scoreO.textContent = game.scores.O;
    }
    
    const currentPlayer = game.players[game.currentPlayer];
    if (currentPlayer?.id === socket.id) {
        updateStatus('轮到你的回合');
    } else {
        updateStatus(`等待 ${currentPlayer?.name || '对手'} 落子`);
    }
});

// 添加更新玩家列表的函数
function updatePlayersList(players) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.innerHTML = `
            <div class="player-avatar">${player.symbol}</div>
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-symbol">玩家 ${player.symbol}</div>
            </div>
        `;
        playersList.appendChild(playerItem);
    });
}

// 添加更新历史记录的函数
function updateGameHistory(history) {
    const gameHistory = document.getElementById('gameHistory');
    gameHistory.innerHTML = ''; // 清空现有历史记录
    
    history.forEach(record => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        let resultText;
        if (record.winner === 'draw') {
            resultText = '平局';
        } else {
            resultText = `玩家 ${record.winner} 获胜`;
        }
        
        historyItem.innerHTML = `
            <div class="history-time">${record.timestamp}</div>
            <div class="history-result">
                <span class="history-winner">${resultText}</span>
                <span class="history-score">X: ${record.scores.X} - O: ${record.scores.O}</span>
            </div>
        `;
        
        gameHistory.appendChild(historyItem);
    });
    
    // 滚动到最新记录
    gameHistory.scrollTop = gameHistory.scrollHeight;
}

// 修改 gameEnd 事件处理
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
    
    // 更新历史记录
    if (result.history) {
        updateGameHistory(result.history);
    }
    
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
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chatMessage', {
            roomId: roomId,
            message: message
        });
        messageInput.value = '';
    }
}

// 修改添加消息的函数
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
        <span class="player-symbol ${data.playerSymbol.toLowerCase()}">${data.playerName}</span>
        <span class="message-text">${data.message}</span>
    `;

    messageDiv.appendChild(time);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
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

// 在现有代码中添加表情选择器的事件处理

// 添加表情选择器的点击事件处理
document.querySelectorAll('.emoji').forEach(emojiBtn => {
    emojiBtn.addEventListener('click', () => {
        const emoji = emojiBtn.dataset.emoji;
        const messageInput = document.getElementById('messageInput');
        messageInput.value += emoji;
        messageInput.focus();
    });
}); 