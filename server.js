import dotenv from 'dotenv'; // if using ES modules
dotenv.config();

import fs from "fs";
import path from "path";

import https from "https";
import http from "http";
import express from "express";
import { Server } from "socket.io";

import { loadJSON } from './loadJSON.js';
import { loadJSONSync } from './loadJSONSync.js';

const waves = loadJSONSync('./waves.json');
console.log(waves);

// const waves = await loadJSON('./waves.json');
// console.log(waves);

let keys = Object.keys(waves);

keys.forEach((k) => {
  console.log(waves[k].description);
  let words = waves[k].words;
  for (let i = 0; i < words.length; i++) {
    console.log(i + " " + " : " + words[i]);
  }
});

const NODE_ENV = process.env.NODE_ENV || '';

console.log({ "NODE_ENV": NODE_ENV });

// --- Express setup ---
const app = express();

let server;

// --- Adjust these paths to match your Let's Encrypt certificate files ---
let privateKey;// = fs.readFileSync("/etc/letsencrypt/live/pasciak.com/privkey.pem");
let certificate;// = fs.readFileSync("/etc/letsencrypt/live/pasciak.com/fullchain.pem");

try {
  privateKey = fs.readFileSync("/etc/letsencrypt/live/pasciak.com/privkey.pem");
  certificate = fs.readFileSync("/etc/letsencrypt/live/pasciak.com/fullchain.pem");
  // --- Create HTTPS server ---
  server = https.createServer({ key: privateKey, cert: certificate }, app);
} catch (err) {
  //console.error("❌ Failed to load SSL certs. Falling back to HTTP:", err);
  server = http.createServer(app);
}

app.get("/", (req, res) => {
  res.send("Socket.IO HTTPS server is running!");
});

// --- Create Socket.IO server with CORS enabled for all origins ---
const io = new Server(server, {
  cors: {
    origin: "*", // allow all external sites
    methods: ["GET", "POST"],
  },
});

let room = '';

// Map socket.id => { nickname, room }
const users = new Map();

// You can define rooms here or manage dynamically
const availableRooms = ['room1', 'room2', 'room3'];

function getUsersInRoom(room) {
  return Array.from(users.values())
    .filter(user => user.room === room)
    .map(user => user.nickname);
}

// --- Handle socket connections ---
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on('getRooms', (data) => {
    console.log(data);
    console.log({ availableRooms, users })
    socket.emit('roomsList', availableRooms);
  });

  // Example event handlers
  // socket.on("message", (msg) => {
  //   console.log("Message from client:", msg);
  //   socket.emit("reply", `Server received: ${msg}`);
  // });

  // Example event handlers
  socket.on("message", (msg) => {

    console.log("Message from client:", msg);

    // Send a reply only to the sender
    socket.emit("reply", `Server received: ${msg}`);

    // Broadcast to all other connected clients
    // socket.broadcast.emit("broadcast", `Someone said: ${msg}`);

    io.to(room).emit('message', ` ${msg}`);
  });

  socket.on('joinRoom', ({ roomName, nickname }) => {
    if (!availableRooms.includes(roomName)) {
      socket.emit('message', `Room "${roomName}" does not exist.`);
      return;
    }

    room = roomName;

    const oldUser = users.get(socket.id);
    const oldRoom = oldUser ? oldUser.room : null;

    // Update user info with new room and nickname
    users.set(socket.id, { nickname, room: roomName });

    // Leave old room(s) except own socket room and new room
    const rooms = [...socket.rooms];
    rooms.forEach(r => {
      if (r !== socket.id && r !== roomName) {
        socket.leave(r);
        // Notify old room that user left
        if (oldRoom === r && oldUser) {
          io.to(r).emit('message', `${oldUser.nickname} left the room.`);
          io.to(r).emit('roomUsers', getUsersInRoom(r));
        }
      }
    });

    socket.join(roomName);

    console.log(`${nickname} joined room: ${roomName}`);

    socket.emit('message', `You joined room: ${roomName}`);
    socket.to(roomName).emit('message', `${nickname} joined the room.`);

    io.to(roomName).emit('roomUsers', getUsersInRoom(roomName));
  });


  // Listen for chat message
  socket.on('chatMessage', ({ room, msg }) => {
    const user = users.get(socket.id);
    if (!user || user.room !== room) return;

    console.log(`Message from ${user.nickname} in room ${room}: ${msg}`);

    // Private message syntax: /pm nickname message
    if (msg.startsWith('/pm ')) {
      const parts = msg.split(' ');
      const targetNickname = parts[1];
      const privateMsg = parts.slice(2).join(' ');
      if (!targetNickname || !privateMsg) {
        socket.emit('message', 'Invalid private message format. Use: /pm nickname message');
        return;
      }

      // Find socket id of target user by nickname
      const targetEntry = Array.from(users.entries())
        .find(([_, u]) => u.nickname === targetNickname);

      if (targetEntry) {
        const [targetSocketId] = targetEntry;
        // Send private msg to target and sender
        io.to(targetSocketId).emit('message', `(Private) ${user.nickname}: ${privateMsg}`);
        socket.emit('message', `(Private to ${targetNickname}) You: ${privateMsg}`);
      } else {
        socket.emit('message', `User "${targetNickname}" not found in this room.`);
      }
    } else {
      io.to(room).emit('message', `${user.nickname}: ${msg}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`${user.nickname} disconnected`);
      users.delete(socket.id);

      // Notify others in the room and update user list
      io.to(user.room).emit('message', `${user.nickname} left the room.`);
      io.to(user.room).emit('roomUsers', getUsersInRoom(user.room));
    }
  });

});

// --- Start the HTTPS server ---
const PORT = 4433; // or 3001 if you’re testing locally
server.listen(PORT, () => {
  console.log(`✅ HTTPS Socket.IO server running on port ${PORT}`);
});
