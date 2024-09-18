window.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let username = '';

    // Removed the EmojiButton references for now
    // Dark/light theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    // Joining the chat
    document.getElementById('joinChat').addEventListener('click', () => {
        username = document.getElementById('username').value;
        console.log("Join chat clicked, username: ", username);
        if (username) {
            document.querySelector('.user-section').style.display = 'none';
            document.querySelector('.chat-section').style.display = 'block';

            // Notify server that the user joined the chat
            socket.emit('joinRoom', username);
        }
    });

    // Sending a message
    document.getElementById('sendMessage').addEventListener('click', () => {
        const msg = document.getElementById('chatMessage').value;
        console.log("Sending message: ", msg);
        if (msg.trim()) {
            socket.emit('chatMessage', msg);
            document.getElementById('chatMessage').value = ''; // Clear input
        }
    });

    // Receiving messages from the server
    socket.on('message', (message) => {
        console.log("Received message: ", message);
        const messageContainer = document.getElementById('message-container');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (message.username === username) {
            messageElement.classList.add('user');
        } else {
            messageElement.classList.add('other');
        }
        messageElement.innerHTML = `<strong>${message.username}:</strong> ${message.text}`;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight; // Auto-scroll
    });

    // Handle private message
    document.getElementById('sendPrivateMessage').addEventListener('click', () => {
        const recipient = document.getElementById('recipientUsername').value;
        const msg = document.getElementById('privateMessage').value;
        console.log("Sending private message to: ", recipient, " message: ", msg);
        if (msg.trim() && recipient.trim()) {
            socket.emit('privateMessage', { recipient, message: msg });
            document.getElementById('privateMessage').value = ''; // Clear input
        }
    });

    socket.on('privateMessageReceived', ({ from, message }) => {
        console.log("Received private message from: ", from, " message: ", message);
        const messageContainer = document.getElementById('message-container');
        const privateMessageElement = document.createElement('div');
        privateMessageElement.classList.add('message', 'private');
        privateMessageElement.innerHTML = `<strong>Private from ${from}:</strong> ${message}`;
        messageContainer.appendChild(privateMessageElement);
    });

    // Load previous messages on join
    socket.on('loadMessages', (messages) => {
        console.log("Loading previous messages: ", messages);
        const messageContainer = document.getElementById('message-container');
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${message.username}: ${message.text}`;
            messageContainer.appendChild(messageElement);
        });
    });

    // Notifications when users join or leave
    socket.on('userJoined', (notification) => {
        console.log("User joined: ", notification);
        const messageContainer = document.getElementById('message-container');
        const notificationElement = document.createElement('div');
        notificationElement.classList.add('message', 'notification');
        notificationElement.innerHTML = notification;
        messageContainer.appendChild(notificationElement);
    });

    socket.on('userLeft', (notification) => {
        console.log("User left: ", notification);
        const messageContainer = document.getElementById('message-container');
        const notificationElement = document.createElement('div');
        notificationElement.classList.add('message', 'notification');
        notificationElement.innerHTML = notification;
        messageContainer.appendChild(notificationElement);
    });

    // Profile picture upload
    document.getElementById('profilePicture').addEventListener('change', (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('profilePicture', file);

        fetch('/uploadProfilePicture', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            const profilePictureUrl = data.imageUrl;
            console.log("Profile picture uploaded, URL: ", profilePictureUrl);
            socket.emit('updateProfilePicture', { profilePictureUrl });
        });
    });
});