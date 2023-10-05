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

    console.log('a user connected: ' + (users.length+1) + ' users connected');

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

    socket.on("sync-users-asked", (callback) => {
        callback({users: users, nbUsers: users.length})
    })

    socket.on("disconnect", () => {
        users.splice(users.indexOf(thisUser), 1)
    })

    socket.on("kick-user", (username, password) => {
        if(password == "12345"){
            users.splice(users.indexOf(username), 1)
            io.sockets.emit("kicked", username)
        }
    })

});



server.listen(3000, () => {
    console.log('listening on *:3000');
});

setInterval(() => {
    io.sockets.emit("sync-users", {users: users, nbUsers: users.length})
}, 5000)
