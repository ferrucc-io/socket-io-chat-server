const express = require('express');
const httpServer = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const sha256 = require('js-sha256').sha256;

// Import Local Dependencies
const config = require('./config');
const User = require('./models/user');

// Initialise APP
const app = express();
const http = httpServer.Server(app);
const io = socketIO(http);
const router = express.Router();
const tokenList = {};

// CONFIGURATION
const port = process.env.PORT || config.port;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// Set up Body Parser [for POST/GET requests]
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// log requests with morgan
app.use(morgan('dev'));

// ------------------------------ //
//           ROUTES               //
// ------------------------------ //


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/auth/', (req, res) => {
  res.sendFile(path.join(__dirname, '/auth.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

// ------------------------------ //
//          API ROUTES            //
// ------------------------------ //

const apiRoutes = express.Router();

// Route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', (req, res) => {
  // find the user
  User.findOne({
    name: req.body.name,
  }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if password matches
      if (user.password !== req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        // if user is found and password is right
        // create a token with only our given payload
        // we don't want to pass in the entire user since that has the password
        const payload = {
          admin: user.admin,
        };
        const token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: config.tokenLife,
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token,
        });
      }
    }
  });
});

// route to show a user ID generated with the IP address (GET http://localhost:8080/api/user-id)
apiRoutes.get('/user/id', (req, res) => {
  let userID = sha256(req.ip + Math.round(1000000000000000000000 * Math.random()));
  userID = `user-${userID}`;
  res.json({ userID });
});

// Route middleware to verify a token
apiRoutes.use((req, res, next) => {
  // check header / url parameters / post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), (err, decoded) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      }
      // if everything is good, save to request for use in other routes
      req.decoded = decoded;
      next();
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.',
    });
  }
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

// ------------------------------ //
//          TEST ROUTES           //
// ------------------------------ //

app.get('/setup', (req, res) => {
  // create a sample user
  const nick = new User({
    name: 'Ferruccio Balestreri',
    email: 'jelly@ferrucc.io',
    password: 'password',
    admin: true,
  });

  // save the sample user
  nick.save((err) => {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});
