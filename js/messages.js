import config from "./config.js";

const userId = parseInt(localStorage.getItem("userId")); // Ensure userId is a number

if (!userId) {
    alert("User not logged in!");
    window.location.href = "/account-stuff/login-page.html"; // Redirect to login if no user ID found
}

let chatWithUserId = null; // User that we are chatting with
let pageNumber = 1;
const pageSize = 10;
const displayedMessageIds = new Set(); 
let isLoading=false;

// Load messages between logged-in user and selected chat partner
async function loadMessages() {

    if (isLoading) {
        return; // Prevent further requests if one is already in progress
    }

    isLoading = true

    if (!chatWithUserId) {
        alert("Please select a chat partner first!");
        return;
    }

    try {
        const apiUrl = config.useRealAPI 
        ? `${config.API_ENDPOINTS.messagesBase}/chat/${userId}/${chatWithUserId}/${pageNumber}/${pageSize}`
        : config.API_ENDPOINTS.messagesBase; // JSON file
    
    const response = await fetch(apiUrl);
    let information = await response.json();
    
    // If using JSON, filter messages manually
    if (!config.useRealAPI) {
        information = information.filter(msg =>
            (msg.senderId === userId && msg.receiverId === chatWithUserId) ||
            (msg.senderId === chatWithUserId && msg.receiverId === userId)
        );
    }

    
    if (pageNumber === 1 && config.useRealAPI) {
        displayRecipientName(information);
    }    
        
        displayMessages(information.messages);
        pageNumber++; // Load next page on button click
    if (!config.useRealAPI) {
        document.getElementById("load-more").style.display = "none";
    } else {
        
        // Hide "Load More" if we get fewer messages than pageSize
        if (information.messages.length < pageSize) {
            document.getElementById("load-more").style.display = "none";
        } else{
            document.getElementById("load-more").style.display ="block"
        }
    }
    } catch (error) {
        console.error("Error loading messages:", error);
    }
    isLoading = false;
}

// Display messages in the list
function displayMessages(messages) {
    const messageList = document.getElementById("message-list");
   

    messages.forEach(msg => {
        if (displayedMessageIds.has(msg.messageId)) {
            return; // Prevent duplicate messages
        }
        displayedMessageIds.add(msg.messageId);
        
        const listItem = document.createElement("li");
        listItem.innerHTML = `[${msg.sentAt}] <br> ${msg.messageText}`;
        
        // Add class based on sender
        if (msg.senderId === userId) {
            listItem.classList.add("sender");
        } else {
            listItem.classList.add("receiver");
        }

        messageList.appendChild(listItem);
    });
}
function displayRecipientName(information) {
    let roleDisplay = information.chatting_with_Role;
    if (roleDisplay === "Doctor" && information.chatting_with_Specialty) {
        roleDisplay = `Doctor - ${information.chatting_with_Specialty}`;
        document.getElementById("chat-header").innerHTML = 
        `${information.chatting_with_LastName} ${information.chatting_with_FirstName}<br>(${roleDisplay})`;
    }else{
        document.getElementById("chat-header").textContent = 
            `${information.chatting_with_LastName} ${information.chatting_with_FirstName} (${roleDisplay})`;
    }

}



// Set chat partner and load messages
function selectChatPartner(otherUserId) {
    chatWithUserId = otherUserId;
    pageNumber = 1; 
    displayedMessageIds.clear();
    document.getElementById('message-container').classList.remove('hidden');
    document.getElementById("message-list").innerHTML = ""; // Clear UI
    loadMessages();
}
window.selectChatPartner = selectChatPartner;

// Send a message
document.getElementById("send-message-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page refresh

    if (!chatWithUserId) {
        alert("Please select a chat partner first!");
        return;
    }

    const messageText = document.getElementById("message-text").value;

    if (!messageText) {
        alert("Please enter a message.");
        return;
    }

    const messageData = {
        senderId: userId,  // Use logged-in user's ID
        receiverId: chatWithUserId,
        messageText: messageText
    };
    // add sending message box

    try {
        const response = await fetch(config.API_ENDPOINTS.send, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });

        if (response.ok) {
            // close sendign message box
            // add message sent box
            document.getElementById("message-text").value = ""; // ✅ Clear input
            pageNumber = 1; 
            displayedMessageIds.clear();
            document.getElementById("message-list").innerHTML = ""; // Clear UI
            loadMessages();
        } else {
            alert("Error sending message.");
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
});

function getPeople(params) {
    
}

// ✅ Load more messages when button is clicked
document.getElementById("load-more").addEventListener("click", loadMessages);
