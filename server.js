const express = require('express');
const httpServer = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const config = require('./config');

const app = express();
const http = httpServer.Server(app);
const io = socketIO(http);
const router = express.Router();
const tokenList = {};

const port = process.env.PORT || 3000;

app.use(express.static('public'));

router.get('/', (req, res) => {
  res.send('Ok');
});

router.post('/login', (req, res) => {
  const postData = req.body;
  const user = {
    email: postData.email,
    user: postData.user,
  };
  // DB authentication goes here
  const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife });
  const reftoken = config.refreshTokenLife;
  const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: reftoken });
  const response = {
    status: 'Logged in',
    token,
    refreshToken,
  };
  tokenList[refreshToken] = response;
  res.status(200).json(response);
});

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