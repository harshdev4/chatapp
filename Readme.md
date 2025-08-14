# Echo - Real-Time Messaging Web App

## Overview

**Echo** is a real-time messaging web application built using the **MERN stack** (MongoDB, Express, React, Node.js). It provides seamless communication with modern features like user authentication, online/offline status, and profile picture updates.

## Features

- ✅ **User Authentication** (JWT-based authentication)
- ✅ **Real-Time Messaging** powered by WebSockets
- ✅ **Profile Picture Update** (Stored on Cloudinary)
- ✅ **Online/Offline Status Visibility**
- ✅ **Multi-Device Support** for seamless access

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary
- **Real-Time Communication:** Socket.io

## Installation & Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- MongoDB
- A Cloudinary account

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/harshdev4/echo.git
   cd echo
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**\
   Create a `.env` file in the root directory and configure the following:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   SALT_ROUND = your_salt_round
   SECRET_KEY = your_secret_key
   PORT = 3000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Build the Client**

   The client is inside the `server` folder. Run the following command from the `server` directory:

   ```bash
   npm run build
   ```

5. **Run the Server**

   The `dist` folder is already being served as static in Node.js. Start the server with:

   ```bash
   npm run start
   ```

6. **Access the App**
   Open your browser and go to `http://localhost:3000`

## Usage

- **Sign up or log in** to start chatting.
- **Send real-time messages** to connected users.
- **Update your profile picture** using Cloudinary integration.
- **See online/offline status** of other users.
- **Access from multiple devices** seamlessly.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Added new feature"`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

---

Feel free to modify this as per your requirements! 🚀

