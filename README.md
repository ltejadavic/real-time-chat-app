Real-Time Chat Application

This is a real-time chat application built using Node.js, Socket.io, Express, and MongoDB Atlas. It allows users to join a chat room, send messages, and communicate in real-time. Users can also send private messages, upload profile pictures, toggle between light and dark themes, and view chat history stored in a MongoDB database.

Features:

	•	Real-time communication using Socket.io.
	•	Join chat rooms with a custom username.
	•	Send public and private messages.
	•	Upload and display profile pictures.
	•	Toggle between light and dark themes.
	•	View chat history retrieved from MongoDB.
	•	Responsive and clean user interface.

Technologies:

	•	Frontend: HTML, CSS, Vanilla JavaScript
	•	Backend: Node.js, Express.js, Socket.io
	•	Database: MongoDB Atlas for message storage
	•	File Upload: Multer for profile picture uploads

Setup Instructions:

	1.	Clone the repository:
git clone https://github.com/ltejadavic/real-time-chat-app.git
cd real-time-chat-app

	2.	Install dependencies:
npm install

	3.	Set up MongoDB Atlas and update the MongoDB connection string in server.js.
	4.	Start the server:
node server.js

	5.	Open your browser and go to http://localhost:4000 to use the chat application.
