import config from "./config.js";

const userId = parseInt(localStorage.getItem("userId"));

async function fetchUsers() {
    try {
        const response = await fetch(`${config.API_ENDPOINTS.message_buttons}?currentUserId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch users');

        const users = await response.json();
        const userList = document.getElementById('user-list'); // Ensure there's a <ul id="userList"> in HTML

        userList.innerHTML = ''; // Clear previous entries

        users.forEach(user => {
            if (user.userId !== userId) {
                const listItem = document.createElement('li');
                const button = document.createElement('button');

                if (user.role === "Doctor" && user.specialty) {
                    button.textContent = `${user.firstName} ${user.lastName} (${user.role} - ${user.specialty})`;
                } else {
                    button.textContent = `${user.firstName} ${user.lastName} (${user.role})`;
                }
                
                button.setAttribute('onclick', `selectChatPartner(${user.userId})`);

                listItem.appendChild(button);
                userList.appendChild(listItem);
            }
        });

    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Function to handle selecting a chat partner
function selectChatPartner(userId) {
    console.log('Chat partner selected:', userId);
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchUsers);
