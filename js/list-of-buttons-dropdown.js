// Ensure the dropdown toggles visibility
document.getElementById('dropdown-toggle').addEventListener('click', function () {
    document.getElementById('user-list').classList.toggle('hidden');
});

// Close the dropdown when clicking outside
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('message-who');
    if (!dropdown.contains(e.target)) {
        document.getElementById('user-list').classList.add('hidden');
    }
});

// FIX: Use Event Delegation for dynamic buttons
document.getElementById('user-list').addEventListener('click', function (e) {
    if (e.target.tagName === 'BUTTON') {
        document.getElementById('message-who').classList.add('hidden');
    }
});

// Hide message-sent container
document.querySelector('#message-sent-container button').addEventListener('click', function () {
    document.getElementById('message-sent-container').classList.add('hidden');
});

// Show message-who again when closing message-container
document.querySelector('#message-container button').addEventListener('click', function () {
    document.getElementById('message-container').classList.add('hidden');
    document.getElementById('message-who').classList.remove('hidden');
});

