import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/User.js';
import messageRoutes from './routes/Message.js';
import connectDB from './config/db.js';
import cors from 'cors';
import setupSocket from './utils/socket.js';
import http from 'http';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const server = http.createServer(app);

dotenv.config(); 

connectDB();

const PORT = process.env.PORT;

app.use(express.json());

app.use(cookieParser());

// app.disable('etag'); // Completely disable ETags

// app.use((req, res, next) => {
//     res.set({
//         'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0',
//         'Surrogate-Control': 'no-store'
//     });
//     next();
// });


// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true,
// }))

app.use('/api/user', userRoutes);
app.use('/api/message', messageRoutes);

app.use(express.static('Client/dist'));

app.get('*', (req, res)=>{
    res.sendFile(path.resolve('Client/dist', 'index.html'));
})

global.io = setupSocket(server);

server.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`);
    
})