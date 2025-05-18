const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const userStore = require('./userStore');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

let players = [];

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log(`Connexion : ${socket.id}`);

  socket.on('join_table', (player) => {
    players.push({ ...player, id: socket.id });
    io.emit('update_players', players);
  });

  socket.on('fold', (id) => {
    players = players.filter(p => p.id !== id);
    io.emit('update_players', players);
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit('update_players', players);
    console.log(`Déconnexion : ${socket.id}`);
  });
});

// API HTTP
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  let user = await userStore.getUser(username);
  if (!user) user = await userStore.createUser(username);
  res.json(user);
});

app.post('/api/bonus', async (req, res) => {
  const { username } = req.body;
  const result = await userStore.giveDailyBonus(username);
  res.json(result);
});

app.get('/api/leaderboard', async (req, res) => {
  const users = await userStore.getAllUsers();
  res.json(users);
});

app.get('/', (req, res) => {
  res.send('Mo’z Max Backend en ligne.');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
