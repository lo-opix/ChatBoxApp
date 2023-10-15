const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const ADMIN_PASSWORD = "12345";

const COLORS = ["red", "yellow", "green", "blue", "orange", "purple", "pink"];

let usernameColorsRemaining = COLORS;


app.use("/client", express.static(__dirname + "/client"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

users = [];

io.on("connection", (socket) => {
    console.log("a user connected: " + (users.length + 1) + " users connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
        io.emit("usersCount", io.engine.clientsCount);
    });

    socket.on("ping", (callback) => {
        callback();
    });

    socket.on("message", (content) => {
        socket.broadcast.emit("newMessage", content);
    });

    let thisUser;

    socket.on("add-user", (username) => {
        thisUser = username;
        let color = usernameColorsRemaining[Math.floor(Math.random() * usernameColorsRemaining.length)];
        usernameColorsRemaining.splice(usernameColorsRemaining.indexOf(color), 1);
        users.push({username: username, color: color});
    });

    socket.on("sync-users-asked", (callback) => {
        callback({ users: users, nbUsers: users.length });
    });

    socket.on("disconnect", () => {
        try{
            usernameColorsRemaining.push(users[users.findIndex(user => user.username === thisUser)].color)
        }catch{
            console.log("Error when trying to add color back to the array, resetting the Color Array")
            usernameColorsRemaining = COLORS;
        }
        users.splice(users.findIndex(user => user.username === thisUser), 1);
    });

    socket.on("kick-user", (username, password) => {
        if (password == ADMIN_PASSWORD) {
            users.splice(users.findIndex(user => user.username === thisUser), 1);
            io.sockets.emit("kicked", username);
        }
    });

    socket.on("reload-lobby", (password) => {
        if (password == ADMIN_PASSWORD) {
            io.sockets.emit("force-reload");
        }
    });
});

server.listen(3000, () => {
    console.log("listening on *:3000");
});

setInterval(() => {
    io.sockets.emit("sync-users", { users: users, nbUsers: users.length });
}, 5000);
