
let socket = io();


let everAsked = false
let username;

users = []
nbUsers = 0

function askUsername() {
    if (everAsked) {
        username = prompt("Username not valid, please enter your username");
        console.log(username, users, users.includes(username))
        if (username == "" || username == null || users.includes(username)) {
            askUsername()
        }
        else{
            socket.emit("add-user", username)
        }
    } else {
        username = prompt("Please enter your username");
        console.log(username, users, users.includes(username))
        if (username == "" || username == null || users.includes(username)) {
            everAsked = true
            askUsername()
        }else{
            socket.emit("add-user", username)
        }
    }
}

socket.emit("sync-users-asked", (res) =>{
    users = res.users
    nbUsers = res.nbUsers
    askUsername()
})




socket.on("sync-users" , (args) => {
    users = args.users
    nbUsers = args.nbUsers
    document.getElementById("chat-users-connected").textContent = nbUsers + " online"
})

socket.on("newMessage", (content) => {
    createMessage(content.user, content.msg)
})


function createMessage(senderName, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "chat-message chat-message-appear";

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
    let otherText;


    if (message.slice(0, 8) == "https://"){
        if(message.indexOf(" ") != -1){
            messageSpan = document.createElement("a");
            messageSpan.href = message.slice(0, 1+message.indexOf(" "))
            messageSpan.textContent = message.slice(0, 1+message.indexOf(" "))

            otherText = document.createElement("span");
            otherText.textContent = message.slice(1+message.indexOf(" "))
            messageSpan.target = "_blank"
        }else{
            messageSpan = document.createElement("a");
            messageSpan.href = message
            messageSpan.textContent = message
            messageSpan.target = "_blank"
        }
    }else{
        messageSpan = document.createElement("span");
        messageSpan.textContent = message;
    }

    
    messageSpan.className = "chat-message-txt"
    

    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(separator);
    messageDiv.appendChild(messageSpan);
    if(otherText){
        messageDiv.appendChild(otherText);
    }


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

socket.on("kicked", (remote_username) => {
    if(remote_username == username){
        alert("You have been kicked")
        window.location.reload()
    }
    createMessage("Server", username + " has been kicked")
})

function kickUser() {
    const username = prompt("Enter the username of the user you want to kick")
    const password = prompt("Enter the password")
    socket.emit("kick-user", username, password)
}

