const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

app.use("/client", express.static(__dirname + "/client"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

users = []

io.on('connection', (socket) => {
    setTimeout(() => {
        io.emit("usersCount", io.engine.clientsCount)
    }, 100)

    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected')
        io.emit("usersCount", io.engine.clientsCount)
    });

    socket.on("ping", (callback) => {
        callback();
    });

    socket.on("message", (content) => {
        socket.broadcast.emit("newMessage", content);
    })

    let thisUser;

    socket.on("add-user", (username) => {
        thisUser = username
        users.push(username)
    })

    setInterval(() => {
        socket.emit("sync-users", users)
    }, 5000)

    socket.on("disconnect", () => {
        users.splice(users.indexOf(thisUser), 1)
    })

});


server.listen(3000, () => {
    console.log('listening on *:3000');
});

