const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let games = {};

function checkWin(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横向
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 纵向
        [0, 4, 8], [2, 4, 6]             // 对角线
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.includes('') ? null : 'draw';
}

io.on('connection', (socket) => {
    console.log('用户连接成功:', socket.id);

    socket.on('joinGame', ({ roomId, playerName }) => {
        console.log('玩家加入房间:', socket.id, playerName, roomId);
        
        if (!games[roomId]) {
            // 创建新游戏
            games[roomId] = {
                players: [{
                    id: socket.id,
                    symbol: 'X',
                    name: playerName
                }],
                board: Array(9).fill(''),
                currentPlayer: 0,
                scores: {X: 0, O: 0},
                gameOver: false,
                history: []
            };
            socket.emit('playerAssigned', { symbol: 'X', name: playerName });
            console.log('玩家1分配为 X:', playerName);
        } else if (games[roomId].players.length < 2) {
            // 第二个玩家加入
            games[roomId].players.push({
                id: socket.id,
                symbol: 'O',
                name: playerName
            });
            socket.emit('playerAssigned', { symbol: 'O', name: playerName });
            console.log('玩家2分配为 O:', playerName);
        }
        
        socket.join(roomId);
        io.to(roomId).emit('gameState', games[roomId]);
    });

    socket.on('makeMove', ({roomId, index}) => {
        console.log('收到落子请求:', socket.id, index);
        
        const game = games[roomId];
        if (!game) {
            console.log('游戏不存在');
            return;
        }

        // 找到当前玩家
        const playerIndex = game.players.findIndex(p => p.id === socket.id);
        const currentPlayer = game.players[game.currentPlayer];
        
        console.log('当前玩家索引:', playerIndex);
        console.log('当前回合玩家:', currentPlayer?.id);

        // 验证是否是当前玩家的回合
        if (playerIndex === -1 || socket.id !== currentPlayer.id) {
            console.log('不是当前玩家的回合');
            return;
        }

        // 确保格子为空
        if (!game.board[index]) {
            const symbol = game.players[playerIndex].symbol;
            game.board[index] = symbol;
            console.log('落子成功:', index, symbol);
            
            // 检查胜利
            const result = checkWin(game.board);
            if (result) {
                if (result !== 'draw') {
                    game.scores[result]++;
                }
                
                // 添加历史记录
                game.history.push({
                    winner: result,
                    timestamp: new Date().toLocaleTimeString(),
                    scores: {...game.scores}
                });
                
                // 发送游戏结果
                io.to(roomId).emit('gameEnd', { 
                    winner: result, 
                    scores: game.scores,
                    history: game.history
                });
                
                // 自动重置游戏板
                game.board = Array(9).fill('');
                game.currentPlayer = (result === 'X') ? 0 : 1; // 获胜者先手
                console.log('游戏结束，自动重置:', result);
            } else {
                // 如果游戏未结束，切换玩家
                game.currentPlayer = (game.currentPlayer + 1) % 2;
            }
            
            // 发送更新后的游戏状态
            io.to(roomId).emit('gameState', game);
        }
    });

    socket.on('resetGame', (roomId) => {
        if (games[roomId]) {
            games[roomId].board = Array(9).fill('');
            games[roomId].currentPlayer = 0;
            io.to(roomId).emit('gameState', games[roomId]);
            console.log('游戏手动重置');
        }
    });

    socket.on('disconnect', () => {
        console.log('用户断开连接:', socket.id);
    });

    // 添加聊天消息处理
    socket.on('chatMessage', ({ roomId, message }) => {
        const game = games[roomId];
        if (!game) return;

        // 找到发送消息的玩家
        const player = game.players.find(p => p.id === socket.id);
        if (!player) return;

        // 广播消息到房间
        io.to(roomId).emit('chatMessage', {
            playerId: socket.id,
            playerSymbol: player.symbol,
            playerName: player.name,
            message: message,
            timestamp: new Date().toLocaleTimeString()
        });
    });
});

http.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
}); 