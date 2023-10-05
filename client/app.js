
let socket = io();


let everAsked = false
let username;

users = []

function askUsername() {
    if (everAsked) {
        username = prompt("Username not valid, please enter your username");
        if (username == "" || username == null) {
            askUsername()
        }
        else{CSSMathMax
            socket.emit("add-user", username)
        }
    } else {
        username = prompt("Please enter your username");
        if (username == "" || username == null) {
            everAsked = true
            askUsername()
        }else{
            socket.emit("add-user", username)
        }
    }
}

askUsername()



socket.on("sync-users" , (remote_users) => {
    users = remote_users
    console.log(remote_users)
})

socket.on("newMessage", (content) => {
    createMessage(content.user, content.msg)
})

socket.on("usersCount", (nbUsers) => {
    document.getElementById("chat-users-connected").textContent = nbUsers + " online"
})

function createMessage(senderName, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message";

    const usernameSpan = document.createElement("span");
    usernameSpan.textContent = senderName;
    if(senderName == "You"){
        usernameSpan.className = "chat-message-user self-send-user"
    }else{
        usernameSpan.className = "chat-message-user"
    }

    const separator = document.createElement("span");
    separator.textContent = ":"

    let messageSpan;
    if (message.slice(0, 8) == "https://"){
        messageSpan = document.createElement("a");
        messageSpan.href = message
        messageSpan.target = "_blank"
    }else{
        messageSpan = document.createElement("span");
    }

    messageSpan.textContent = message;
    messageSpan.className = "chat-message-txt"
    

    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(separator);
    messageDiv.appendChild(messageSpan);

    document.getElementById("chat-div").appendChild(messageDiv);

    var objDiv = document.getElementById("chat-div");
    objDiv.scrollTop = objDiv.scrollHeight;

}

function sendMessageFromClient() {
    const message = document.getElementById("chat-input-text").value
    document.getElementById("chat-input-text").value = ""
    if (username === null) {
        return -2
    }
    if (message !== "") {
        socket.emit("message", {"msg": message, "user": username})
        createMessage("You", message)
        return 0
    } else {
        return -1
    }
}

document.getElementById("chat-input-button").addEventListener("click", () => {
    let err = sendMessageFromClient()
    if (err === -1) {
        document.getElementById("chat-input-text").classList.add("chat-shake-element")
        setTimeout(() => {
            document.getElementById("chat-input-text").classList.remove("chat-shake-element")
        }, 350)
    } else if (err === -2) {
        askUsername()
        console.log("ask")
    }

})

document.addEventListener('keydown', (event) => {
    if (event.code === "Enter") {
        let err = sendMessageFromClient()
        if (err === -1) {
            document.getElementById("chat-input-text").classList.add("chat-shake-element")
            setTimeout(() => {
                document.getElementById("chat-input-text").classList.remove("chat-shake-element")
            }, 350)
        } else if (err === -2) {
            askUsername()
        }
    }
}, false);


document.getElementById("chat-users-btn").addEventListener("click", () => {
    alert("Users connected: " + users.join(", "))
})
