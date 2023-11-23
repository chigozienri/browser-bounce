const express = require('express');
const app = express();
const PORT = 4000;
const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());

const users = [];

const socketIO = require('socket.io')(http, {
  cors: {
      origin: "http://localhost:3000"
  }
});

socketIO.on('connection', (socket) => {
  if (users.length == 0) {
    socket.emit('first');
  }
  console.log(`⚡: ${socket.id} user just connected!`);
  users.push({id: socket.id, position: {}}); // Add the user to the array
  setTimeout(() => {
    console.log(users); // Log the updated users array
    socketIO.emit('users', users); // Emit the updated users array
  }, 0);

  socket.on('windowChange', (data) => {
    let userIdx = users.map((u) => u.id).indexOf(socket.id);
    users[userIdx]['position'] = data;
    socketIO.emit('users', users);
    console.log(users);
  } )

  socket.on('disconnect', () => {
    let userIdx = users.map((u) => u.id).indexOf(socket.id); 

    console.log(`🔥: User ${userIdx} disconnected`);
    users.splice(userIdx, 1);
    if ((userIdx == 0) && (users.length > 0)) {
      console.log(users[0]["id"])
      socketIO.to(users[0]["id"]).emit('first');
    }
    console.log(users); // Log the updated users array
    socketIO.emit('users', users); // Emit the updated users array
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
