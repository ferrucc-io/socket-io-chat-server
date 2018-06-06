const express = require('express');
const httpServer = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const http = httpServer.Server(app);
const io = socketIO(http);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
