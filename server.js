const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('client'));

let rooms = {};

io.on('connection', (socket) => {
	console.log('User connected.')

	socket.on('createRoom', (room) => {
		console.log(socket.id)
		rooms[room] = { players: {}, choices: {} };
		socket.join(room);
		socket.emit('roomCreated', room);
		rooms[room].players[socket.id] = socket;
	});

	socket.on('joinRoom', (room) => {
		console.log(socket.id)
		if (rooms[room]) {
			socket.join(room);
			rooms[room].players[socket.id] = socket;
			socket.emit('roomJoined', room)
			io.emit('gameStart', room)
		} else {
			socket.emit('error', 'Room does not exist.');
		}
	});

	socket.on('choice', (room, choice) => {
	  	if (rooms[room]) {
			rooms[room].choices[`${socket.id}`] = choice;
			if (Object.keys(rooms[room].choices).length === 2) {
				const [player1Id, player2Id] = Object.keys(rooms[room].choices);
				const [choice1, choice2] = Object.values(rooms[room].choices);
				const winner = getWinner(choice1, choice2, player1Id, player2Id);
				const loser = winner === player1Id ? player2Id : player1Id;
				if (winner === 0) {
					io.to(room).emit('result', 'It\'s a draw!');
				} else {
					if (rooms[room].players[winner]) {
						rooms[room].players[winner].emit('result', 'You win!');
					}
					if (rooms[room].players[loser]) {
						rooms[room].players[loser].emit('result', 'You lose!');
					}
				}
				delete rooms[room];
			}
	  	}
	});
});

function getWinner(choice1, choice2, player1Id, player2Id) {
	if (choice1 === choice2) return 0;
	if ((choice1 === 'rock' && choice2 === 'scissors') || (choice1 === 'paper' && choice2 === 'rock') || (choice1 === 'scissors' && choice2 === 'paper')) {
		return player1Id;
	} else {
		return player2Id;
  	}
}

server.listen(3000, () => console.log('Server listening on port 3000'));