let socket = io();

let everAsked = false;
let username;

users = [];
nbUsers = 0;

fetch(window.location.href + "version").then((res) => {
    if (res.status == 200){ // Cancel error happening when debugging 
    res.text().then((txt) => {
        document.getElementById("chat-version").textContent = "v" + txt;
    });}
});

function askUsername() {
    if (everAsked) {
        username = prompt("Username not valid, please enter your username");
        if (
            username == "" ||
            username == null ||
            users.some((e) => e.username == username)
        ) {
            askUsername();
        } else {
            socket.emit("add-user", username);
            document.getElementById("chat-title").textContent =
                "ChatBox - " + username;
        }
    } else {
        username = prompt("Please enter your username");
        if (
            username == "" ||
            username == null ||
            users.some((e) => e.username == username)
        ) {
            everAsked = true;
            askUsername();
        } else {
            socket.emit("add-user", username);
            document.getElementById("chat-title").textContent =
                "ChatBox - " + username;
        }
    }
}

socket.emit("sync-users-asked", (res) => {
    users = res.users;
    nbUsers = res.nbUsers;
    askUsername();
});

socket.on("sync-users", (args) => {
    users = args.users;
    nbUsers = args.nbUsers;
    document.getElementById("chat-users-connected").textContent =
        nbUsers + " online";

    const userObject = users.find((user) => user.username === username);
    if (userObject) {
        document.getElementById("chat-badge-status").className = "badge-green";
    }

    let htmlUsersList = document.getElementById("chat-user-connected-list-users").getElementsByTagName("li");

    users.forEach((user) => {
        let userFound = false;

        for (let htmlUser = 0; htmlUser < htmlUsersList.length; htmlUser++) {
            if (htmlUsersList[htmlUser].textContent == user.username) {
                userFound = true;
            }
        }

        if (!userFound) {
            let li = document.createElement("li");
            li.textContent = user.username;
            li.className = "txt-" + user.color;
            document.getElementById("chat-user-connected-list-users").appendChild(li);
        }
    });

    for(let htmlUser = 0; htmlUser < htmlUsersList.length; htmlUser++) {
        let userFound = false;

        users.forEach((user) => {
            if (htmlUsersList[htmlUser].textContent == user.username) { 
                userFound = true;
            }
        })

        if (!userFound) {
            htmlUsersList[htmlUser].remove();
        }
    };
});

socket.on("newMessage", (content) => {
    createMessage(content.user, content.msg);
});

function createMessage(senderName, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message chat-message-appear";

    const usernameSpan = document.createElement("span");

    if (senderName.username == username) {
        usernameSpan.className =
            "chat-message-user" + " txt-" + senderName.color;
        messageDiv.classList.add("chat-message-self-user");
        usernameSpan.textContent = username;
    } else {
        usernameSpan.className =
            "chat-message-user " + "txt-" + senderName.color;
        usernameSpan.textContent = senderName.username;
    }

    const separator = document.createElement("span");
    separator.textContent = ":";

    let messageSpan;
    let otherText;

    if (message.slice(0, 8) == "https://") {
        if (message.indexOf(" ") != -1) {
            messageSpan = document.createElement("a");
            messageSpan.href = message.slice(0, 1 + message.indexOf(" "));
            messageSpan.textContent = message.slice(
                0,
                1 + message.indexOf(" ")
            );

            otherText = document.createElement("span");
            otherText.textContent = message.slice(1 + message.indexOf(" "));
            messageSpan.target = "_blank";
        } else {
            messageSpan = document.createElement("a");
            messageSpan.href = message;
            messageSpan.textContent = message;
            messageSpan.target = "_blank";
        }
    } else {
        messageSpan = document.createElement("pre");
        messageSpan.textContent = message;
    }

    messageSpan.className = "chat-message-txt";

    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(separator);
    messageDiv.appendChild(messageSpan);
    if (otherText) {
        messageDiv.appendChild(otherText);
    }

    document.getElementById("chat-div").appendChild(messageDiv);

    var objDiv = document.getElementById("chat-div");
    objDiv.scrollTop = objDiv.scrollHeight;
}

function sendMessageFromClient() {
    const message = document.getElementById("chat-input-text").value;
    document.getElementById("chat-input-text").value = "";
    if (username === null) {
        return -2;
    }
    if (message !== "") {
        const userObject = users.find((user) => user.username === username);
        socket.emit("message", { msg: message, user: userObject });
        createMessage(userObject, message);
        return 0;
    } else {
        return -1;
    }
}

document.getElementById("chat-input-button").addEventListener("click", () => {
    let err = sendMessageFromClient();
    if (err === -1) {
        document
            .getElementById("chat-input-text")
            .classList.add("chat-shake-element");
        setTimeout(() => {
            document
                .getElementById("chat-input-text")
                .classList.remove("chat-shake-element");
        }, 350);
    } else if (err === -2) {
        askUsername();
        console.log("ask");
    }
});

document.addEventListener(
    "keydown",
    (event) => {
        // Send message on enter
        if (event.code === "Enter") {
            let err = sendMessageFromClient();
            if (err === -1) {
                document
                    .getElementById("chat-input-text")
                    .classList.add("chat-shake-element");
                setTimeout(() => {
                    document
                        .getElementById("chat-input-text")
                        .classList.remove("chat-shake-element");
                }, 350);
            } else if (err === -2) {
                askUsername();
            }
        }

        // CTRL + V
        if (event.key === "v" && event.ctrlKey) {
            sendClipBoard();
        }
    },
    false
);

document.getElementById("chat-users-btn").addEventListener("click", () => {
    document.getElementById("chat-user-connected-list").classList.toggle("show-users-list");
});

socket.on("kicked", (remote_username) => {
    if (remote_username == username) {
        alert("You have been kicked");
        window.location.reload();
    }
    createMessage("Server", username + " has been kicked");
});

socket.on("force-reload", () => {
    window.location.reload();
});

socket.on("disconnect", () => {
    let statusBadge = document.getElementById("chat-badge-status");
    statusBadge.className = "badge-red";
});

function kickUser() {
    const username = prompt("Enter the username of the user you want to kick");
    const password = prompt("Enter the password");
    socket.emit("kick-user", username, password);
}

function reloadLobby() {
    const password = prompt("Enter the password");
    socket.emit("reload-lobby", password);
}

function sendClipBoard() {
    navigator.clipboard.readText().then((clipText) => {
        if (clipText != "") {
            console.log;
            const userObject = users.find((user) => user.username === username);
            socket.emit("message", { msg: clipText, user: userObject });
            createMessage(userObject, clipText);
            document.getElementById("chat-input-text").innerHTML = "";
        }
    });
}

document.getElementById("chat-version").addEventListener("click", () => {
    window.open("https://github.com/lo-opix/ChatBoxApp/commits/master/", "_blank");
})

document.getElementById("chat-div").addEventListener("click", () => {
    document.getElementById("chat-user-connected-list").classList.remove("show-users-list");
})