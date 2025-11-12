import dotenv from 'dotenv'; // if using ES modules
dotenv.config();

import fs from "fs";
import path from "path";

import https from "https";
import http from "http";
import express from "express";
import { Server } from "socket.io";

import { loadJSONSync } from './loadJSONSync.js';
import { loadTXTSync } from './loadTXTSync.js';

const waves = loadJSONSync('./waves.json');
console.log("waves", waves);

const uniqueWords = [...new Set(Object.values(waves).flatMap(c => c.words))];
console.log("uniqueWords", uniqueWords);

let words = loadTXTSync('./words.txt');
// console.log(words.length);

function removeShortWords(words) {

  let tc = 0;
  words.forEach((w) => {
    if (w.length == 2) {
      tc++;
      if (twoLetterWords.includes(w)) {
      } else {
        console.log("missing:", w)
      }
    }
  });
  console.log("two letter words original", tc)

  return words.filter(word => word.length > 2);

}

const twoLetterWords = [
  "aa", "ab", "ad", "ae", "ag", "ah", "ai", "al", "am", "an", "ar", "as", "at", "aw", "ax", "ay",
  "ba", "be", "bi", "bo", "by",
  "da", "de", "do",
  "ed", "ef", "eh", "el", "em", "en", "er", "es", "et", "ew", "ex",
  "fa", "fe",
  "gi", "go",
  "ha", "he", "hi", "hm", "ho",
  "id", "if", "in", "is", "it",
  "jo",
  "ka", "ki",
  "la", "li", "lo",
  "ma", "me", "mi", "mm", "mo",
  "na", "ne", "no", "nu",
  "od", "oe", "of", "oh", "oi", "ok", "om", "on", "op", "or", "os", "ow", "ox", "oy",
  "pa", "pe", "pi",
  "qi",
  "re",
  "sh", "si", "so",
  "ta", "te", "ti", "to",
  "uh", "um", "un", "up", "us", "ut",
  "we", "wo",
  "xi", "xu",
  "ya", "ye", "yo"
];


words = removeShortWords(words);

words = [...twoLetterWords, ...words];

console.log("words", words.length);

console.log("two letter words", twoLetterWords.length);

let boardColsMagnitude = 55;
let boardRowsMagnitude = 55;

let wordLetterValues = [
  {
    "letter": "A",
    "quantity": 9,
    "points": 1
  },
  {
    "letter": "B",
    "quantity": 2,
    "points": 3
  },
  {
    "letter": "C",
    "quantity": 2,
    "points": 3
  },
  {
    "letter": "D",
    "quantity": 4,
    "points": 2
  },
  {
    "letter": "E",
    "quantity": 12,
    "points": 1
  },
  {
    "letter": "F",
    "quantity": 2,
    "points": 4
  },
  {
    "letter": "G",
    "quantity": 3,
    "points": 2
  },
  {
    "letter": "H",
    "quantity": 2,
    "points": 4
  },
  {
    "letter": "I",
    "quantity": 9,
    "points": 1
  },
  {
    "letter": "J",
    "quantity": 1,
    "points": 8
  },
  {
    "letter": "K",
    "quantity": 1,
    "points": 5
  },
  {
    "letter": "L",
    "quantity": 4,
    "points": 1
  },
  {
    "letter": "M",
    "quantity": 2,
    "points": 3
  },
  {
    "letter": "N",
    "quantity": 6,
    "points": 1
  },
  {
    "letter": "O",
    "quantity": 8,
    "points": 1
  },
  {
    "letter": "P",
    "quantity": 2,
    "points": 3
  },
  {
    "letter": "Q",
    "quantity": 1,
    "points": 10
  },
  {
    "letter": "R",
    "quantity": 6,
    "points": 1
  },
  {
    "letter": "S",
    "quantity": 4,
    "points": 1
  },
  {
    "letter": "T",
    "quantity": 6,
    "points": 1
  },
  {
    "letter": "U",
    "quantity": 4,
    "points": 1
  },
  {
    "letter": "V",
    "quantity": 2,
    "points": 4
  },
  {
    "letter": "W",
    "quantity": 2,
    "points": 4
  },
  {
    "letter": "X",
    "quantity": 1,
    "points": 8
  },
  {
    "letter": "Y",
    "quantity": 2,
    "points": 4
  },
  {
    "letter": "Z",
    "quantity": 1,
    "points": 10
  }
];

// let lettersCollection = [];

function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// function createLetterCollection() {
//   for (let i = 0; i < wordLetterValues.length; i++) {
//     let current = wordLetterValues[i];
//     for (let j = 0; j < current.quantity; j++) {
//       lettersCollection.push(current?.letter || "_");
//     }
//   }
//   shuffleInPlace(lettersCollection);
//   console.log("lettersCollection");
//   console.log(lettersCollection.length);
// }

// function getLetterFromCollection() {
//   if (lettersCollection.length <= 0) {
//     createLetterCollection();
//   }
//   return lettersCollection.shift();
// }

// createLetterCollection();

function randomLetter() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_';
  return letters[Math.floor(Math.random() * letters.length)];
}

function tileKey(col, row) {
  return `${col},${row}`;
}

function createMap(mapRef) {
  for (let i = -boardColsMagnitude; i < boardColsMagnitude; i++) {
    for (let j = -boardRowsMagnitude; j < boardRowsMagnitude; j++) {
      let powerUpType = ['brainwave', 'crimewave', 'shockwave'][Math.floor(Math.random() * 3)];

      if (Math.random() > 0.98) {
        setTile(i, j, mapRef, { letter: '_', type: powerUpType });
      } else {
        setTile(i, j, mapRef, { letter: '_', type: 'normal' });
      }

      if (Math.random() > .98) {
        setTile(i, j, mapRef, { letter: randomLetter(), type: Math.random() < .58 ? 'normal' : powerUpType });
      }
    }
  }
  // console.log(mapRef);
  return mapRef;
}

function getTile(col, row, mapRef, allowNew = true) {
  const key = tileKey(col, row);
  if (!mapRef.has(key)) {
    // Lazy-generate a new tile with defaults
    const newTile = {
      col,
      row,
      letter: "_",
      color: 'cyan', // getTileColor(col, row),
      status: "empty",
      type: "normal"
    };
    if (allowNew) { mapRef.set(key, newTile); }
  }
  return mapRef.get(key);
}

function setTile(col, row, mapRef, tileObj) {
  const key = tileKey(col, row);
  const updated = { col, row, ...tileObj };
  mapRef.set(key, updated);
}

let keys = Object.keys(waves);

let maps = {};

keys.forEach((k) => {
  // console.log(waves[k].description);
  let words = waves[k].words;
  for (let i = 0; i < words.length; i++) {
    // console.log(i + " " + " : " + words[i]);
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

// Map socket.id => { nickname, room }
const users = new Map();

// You can define rooms here or manage dynamically
const availableRooms = ['room1', 'room2', 'room3', 'room4', 'room5', 'room6', 'room7', 'room8', 'room9', 'room10'];

availableRooms.forEach((r) => {
  maps[r] = new Map();
  createMap(maps[r]);
})

function getUsersInRoom(room) {
  return Array.from(users.values())
    .filter(user => user.room === room)
    .map(user => user.nickname);
}

// --- Handle socket connections ---
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("addWords", (data) => {
    console.log(data);
    let arrayOfWords = data?.wordsToAdd || [];

    for (let i = 0; i < arrayOfWords.length; i++) {
      let w = arrayOfWords[i];
      let cw = w.toLowerCase().trim();
      if (cw && cw?.length > 1 && words.indexOf(cw) == -1) {
        console.log("added word:", cw);
        words.push(cw);
      }
    }

    console.log(words.length);

    // note: consider just adding words to a room dictionary .. more to do it doing that though

  });

  socket.on("bonusWordFound", (data) => {
    console.log('bonusWordFound', data);
    io.to(data?.myRoom).emit('bonusWordResult', data);
  })

  socket.on("eraseBoard", (data) => {
    createMap(maps[data?.myRoom]);
    console.log(data);
    const obj2 = Object.fromEntries(maps[data?.myRoom]); // Map → Object
    const json = JSON.stringify(obj2); // Object → JSON string
    io.to(data?.myRoom).emit('tileObjects', json);
  })

  socket.on('proposedTile', (data) => {
    console.log("----proposedTile------");
    console.log("data");
    console.log(data);

    let theRoom = data?.myRoom || '';

    let mapRef = maps[theRoom];

    console.log(data.myRoom);

    setTile(data.col, data.row, mapRef, data);

    const obj2 = Object.fromEntries(maps[theRoom]); // Map → Object

    const json = JSON.stringify(obj2); // Object → JSON string

    io.to(theRoom).emit('tileObjects', json);

  });

  function sendBoardDataToRoom(theRoom) {
    console.log("------sendBoardDataToRoom------");
    // const obj2 = Object.fromEntries(maps[theRoom]); // Map → Object
    // const json = JSON.stringify(obj2); // Object → JSON string
    // io.to(theRoom).emit('tileObjects', json);
    // return;
    // Filter the Map first before converting it to an object
    console.log(Array.from(maps[theRoom]).length);
    const filtered = Array.from(maps[theRoom]).filter(
      ([key, value]) => value.letter !== "_"
    );
    console.log(filtered.length);
    const obj2 = Object.fromEntries(filtered); // Map → Object
    const json = JSON.stringify(obj2); // Object → JSON string
    io.to(theRoom).emit('tileObjects', json);
  }

  function findLeft(col, row, mapRef) {
    const testCase = getTile(col, row, mapRef, false);
    // console.log(testCase);
    if (!testCase) {
      return { col, row };
    }
    return testCase?.letter != '_' ? findLeft(col - 1, row, mapRef) : { col, row };
  }

  function findRight(col, row, mapRef) {
    const testCase = getTile(col, row, mapRef, false);
    // console.log(testCase);
    if (!testCase) {
      return { col, row };
    }
    return testCase?.letter != '_' ? findRight(col + 1, row, mapRef) : { col, row };
  }

  function findTop(col, row, mapRef) {
    const testCase = getTile(col, row, mapRef, false);
    // console.log(testCase);
    if (!testCase) {
      return { col, row };
    }
    return testCase?.letter != '_' ? findTop(col, row - 1, mapRef) : { col, row };
  }

  function findBottom(col, row, mapRef) {
    const testCase = getTile(col, row, mapRef, false);
    // console.log(testCase);
    if (!testCase) {
      return { col, row };
    }
    return testCase?.letter != '_' ? findBottom(col, row + 1, mapRef) : { col, row };
  }


  socket.on('submitWord', (data) => {

    let { is_microWave, is_radioWave, is_soundWave, is_ElectromagneticWave, is_energyWave, sendTiles, myName, myRoom } = data;

    let theRoom = myRoom || data?.myRoom || '';

    let mapRef = maps[theRoom];

    //console.log(data.myRoom);

    let wasInvalid = false;

    let oldTiles = [];

    for (let i = 0; i < sendTiles.length; i++) {
      let cw = sendTiles[i];
      let oldTile = getTile(cw.col, cw.row, mapRef, false);
      oldTiles.push(oldTile)
      setTile(cw.col, cw.row, mapRef, { ...oldTile, letter: cw.letter })
    }

    let newCrime = 0;
    let newShock = 0;
    let newBrain = 0;

    let tempWordScore = 0;
    let bonusWords = 0;
    let theBonusWords = [];

    let theL = 0;
    let wasFound = false;

    for (let i = 0; i < sendTiles.length; i++) {

      let cw = sendTiles[i];

      let currentTile = getTile(cw.col, cw.row, mapRef, false);

      console.log({ currentTile });

      let objForScore = wordLetterValues.find((i) => i?.letter == currentTile?.letter?.toUpperCase());

      tempWordScore += objForScore?.points || 0;

      console.log("tempWordScore", tempWordScore);

      if (currentTile?.type == 'brainwave') {
        newBrain++;
      }

      if (currentTile?.type == 'crimewave') {
        newCrime++;
      }

      if (currentTile?.type == 'shockwave') {
        newShock++;
      }

      let left = (findLeft(cw.col - 1, cw.row, mapRef));
      let right = (findRight(cw.col + 1, cw.row, mapRef));
      let top = (findTop(cw.col, cw.row - 1, mapRef));
      let bottom = (findBottom(cw.col, cw.row + 1, mapRef));

      // console.log({ left, right, top, bottom })

      let hzWord = "";
      for (let hz = left.col; hz <= right.col; hz++) {
        let tempLetter = getTile(hz, cw.row, mapRef, false)?.letter || "";
        if (hz == cw.col) {
          tempLetter = cw.letter;

        }
        if (tempLetter == "_") { tempLetter = "" };
        hzWord += tempLetter;
      }

      if (hzWord.length <= 1) {
        // wasInvalid = true;
        theL += hzWord.length;
      }

      console.log({ hzWord, wasInvalid, theL });

      if (hzWord.length > 1) {
        console.log(hzWord);
        if (words.indexOf(hzWord.toLowerCase()) > -1) {
          console.log('hzWordfound', hzWord);

          wasFound = true;

          //if (uniqueWords.some(w => w.toLowerCase() == hzWord.toLowerCase())) {
          console.log("Found (case-insensitive)!");
          if (!theBonusWords.includes(hzWord)) {
            bonusWords++;
            theBonusWords.push(hzWord);
          }
          //}

        } else {
          console.log('hzWord not found', hzWord);
          wasInvalid = true;
        }
      } else {
        // wasInvalid = true;
      }

      let vtWord = "";
      for (let vt = top.row; vt <= bottom.row; vt++) {
        let tempLetter = getTile(cw.col, vt, mapRef, false)?.letter || "";
        if (vt == cw.row) {
          tempLetter = cw.letter;

        }
        if (tempLetter == "_") { tempLetter = "" };
        vtWord += tempLetter;
      }

      if (vtWord.length <= 1) {
        // wasInvalid = true;
        theL += vtWord.length;
      }
      console.log({ vtWord, wasInvalid, theL });

      if (vtWord.length > 1) {
        console.log(vtWord);
        if (words.indexOf(vtWord.toLowerCase()) > -1) {
          console.log('vtWord found', vtWord);

          wasFound = true;

          // if (uniqueWords.some(w => w.toLowerCase() == vtWord.toLowerCase())) {
          console.log("Found (case-insensitive)!");
          if (!theBonusWords.includes(vtWord)) {
            bonusWords++;
            theBonusWords.push(vtWord);
          }
          // }

        } else {
          console.log('vtWord not found', vtWord);
          wasInvalid = true;
        }
      } else {
        // wasInvalid = true;
      }

      setTile(cw.col, cw.row, mapRef, cw);
    }

    if (!wasFound) {
      wasInvalid = true;
      console.log({ wasFound, wasInvalid })
    }

    if (wasInvalid) {
      // not a good word somewhere
      console.log("was invalid");
      // for (let i = 0; i < sendTiles.length; i++) {
      //   let cw = sendTiles[i];
      //   cw.letter = "_";
      //   setTile(cw.col, cw.row, mapRef, cw);
      // }
      for (let i = 0; i < oldTiles.length; i++) {
        let cw = oldTiles[i];
        setTile(cw.col, cw.row, mapRef, { ...cw });
      }
    } else {
      // all good
      console.log("was all good");
      for (let i = 0; i < sendTiles.length; i++) {
        let cw = sendTiles[i];
        setTile(cw.col, cw.row, mapRef, cw);
      }
    }

    // setTile(data.col, data.row, mapRef, data);

    console.log({ wasInvalid, sendTiles, newBrain, newShock, newCrime, tempWordScore, bonusWords, theBonusWords });

    socket.emit("word_result", { wasInvalid, sendTiles, newBrain, newShock, newCrime, tempWordScore, bonusWords, theBonusWords });

    if (!wasInvalid) {
      let random = Math.floor(Math.random() * 5)
      if (random == 0) { socket.emit("is_microWave", { wasInvalid, sendTiles, newBrain, newShock, newCrime, tempWordScore }); }
      if (random == 1) { socket.emit("is_radioWave", { wasInvalid, sendTiles, newBrain, newShock, newCrime, tempWordScore }); }
      if (random == 2) { socket.emit("is_soundWave", { wasInvalid, sendTiles, newBrain, newShock, newCrime, tempWordScore }); }
      if (random == 3) { socket.emit("is_ElectromagneticWave", { wasInvalid, sendTiles, newBrain, newShock, newCrime, tempWordScore }); }
      if (random == 4) { socket.emit("is_energyWave", { wasInvalid, sendTiles, newBrain, newShock, newCrime, tempWordScore }); }
    }

    sendBoardDataToRoom(theRoom);

    //const obj2 = Object.fromEntries(maps[theRoom]); // Map → Object
    //const json = JSON.stringify(obj2); // Object → JSON string
    //io.to(theRoom).emit('tileObjects', json);

  });

  socket.on('getMap', (data) => {

    console.log("------getMap------");
    let theUser;
    users.forEach((u) => {
      if (u.id == socket.id) {
        theUser = u;
      }
    })

    let roomName = theUser?.room || data?.room || '';

    const obj2 = Object.fromEntries(maps[roomName]); // Map → Object
    const json = JSON.stringify(obj2); // Object → JSON string
    socket.emit('tileObjects', json);

  });

  // socket.on('getLetters', (number) => {
  //   let s = "";
  //   for (let i = 0; i < number; i++) {
  //     let t = getLetterFromCollection();
  //     s += t;
  //   }
  //   socket.emit('gotLetters', s);
  // });

  socket.on('getRooms', (data) => {
    // console.log(data);
    if (data?.data?.command == 'updatePlayer') {
      console.log("--updatePlayer--");
      users.forEach((u) => {
        console.log("user found: ", u);

        if (u.nickname == data?.data?.myName) {
          u.playerCol = data?.data?.playerCol;
          u.playerRow = data?.data?.playerRow;
          users.set(socket.id, { ...u, dateTime: Date.now(), playerCol: data?.data?.playerCol, playerRow: data?.data?.playerRow });
        }
      })
    }

    data.users = [...users];

    io.to(data?.data?.myRoom).emit('data', data);

    console.log({ availableRooms, users })
    // socket.emit('roomsList', availableRooms); // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  });

  // Example event handlers
  // socket.on("message", (msg) => {
  //   console.log("Message from client:", msg);
  //   socket.emit("reply", `Server received: ${msg}`);
  // });

  // Example event handlers
  // socket.on("message", (msg) => {
  //   console.log("Message from client:", msg);
  //   // Send a reply only to the sender
  //   socket.emit("reply", `Server received: ${msg}`);
  //   // Broadcast to all other connected clients
  //   // socket.broadcast.emit("broadcast", `Someone said: ${msg}`);
  //   io.to(room).emit('message', ` ${msg}`);
  // });

  socket.on('joinRoom', ({ roomName, nickname }) => {
    console.log("joinRom");
    //console.log(tileMap)
    let obj;

    // try {
    //   obj = JSON.parse(tileMap);
    //   console.log(obj["-25,-25"]); // { col: -25, row: -25, letter: "_" }
    // } catch (e) {
    //   //
    // }


    if (!availableRooms.includes(roomName)) {
      socket.emit('message', `Room "${roomName}" does not exist.`);
      return;
    }

    //room = roomName;

    if (maps[roomName]) {
      console.log('roomName...', roomName);
      console.log("maps... line ~ 203 ")
      console.log(Object.keys(maps));
    } else {
      //maps[roomName] = tileMap;
      //console.log('roomName...', roomName);
      //console.log(maps);
    }

    const oldUser = users.get(socket.id);
    const oldRoom = oldUser ? oldUser.room : null;

    // Update user info with new room and nickname
    users.set(socket.id, { nickname, room: roomName, dateTime: Date.now() });

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

    const obj2 = Object.fromEntries(maps[roomName]); // Map → Object

    const json = JSON.stringify(obj2); // Object → JSON string

    socket.emit('tileMap', json);

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
