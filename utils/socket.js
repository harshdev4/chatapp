import {Server} from 'socket.io';
import User from '../models/User.js';
import Message from '../models/Message.js';

const setupSocket = (server)=>{
    const io = new Server(server, {
        cors:{
            origin: '*'
        }
    });

    const clearSocketIds = async () => {
        try {
            await User.updateMany({}, { socketId: [] });
            console.log("Cleared all socket IDs on server startup.");
        } catch (error) {
            console.error("Error clearing socket IDs:", error);
        }
    };

    clearSocketIds();

    io.on('connection', (socket)=>{
        console.log("User connected:", socket.id);
          
        // register socket id
        socket.on('register', async({userId})=>{     
            try {
                await User.findByIdAndUpdate(userId, { $push: { socketId: socket.id } });
                socket.broadcast.emit('getStatus', { userId, status: 'Online' });
                const messages = await Message.find({receiver: userId, delivered: false});
                if(messages.length > 0){
                    messages.forEach(async (message) => {
                        socket.emit('receiveMessage', {
                            sender: message.sender,
                            message: message.message
                        })
                        await Message.findByIdAndUpdate(message._id, { delivered: true });
                    });
                }
            } catch (error) {
                console.log('error in registering', error);
                
            }
        });

        socket.on('sendMessage', async ({sender, receiver, message})=>{
            try {
                const me = await User.findById(sender);
                me.socketId.forEach((socketone)=>{
                    if (socketone !== socket.id) {
                        socket.to(socketone).emit('sendMessage', {sender, receiver, message});
                    }
                })
                me.socketId.forEach((socketone)=>{
                    if (socketone !== socket.id) {
                        socket.to(socketone).emit('latestSendMessage', {sender, receiver, message});
                    }
                    else{
                        socket.emit('latestSendMessage', {sender, receiver, message});
                    }
                });
                const user = await User.findById(receiver);
                const receiverSocketIds = user.socketId;
                if (receiverSocketIds.length > 0) {
                    receiverSocketIds.forEach((receiverSocketId)=>{
                    socket.to(receiverSocketId).emit('receiveMessage', {message, sender, receiver});
                })
                const newMessage = await Message.create({ sender, receiver, message, delivered: true});
                }
                else{
                    console.log("User is offline, saving message...");
                    const newMessage = await Message.create({ sender, receiver, message, delivered: false});
                }
            } catch (error) {
                console.error("Error in operations:", error);
            }
        });

        socket.on('checkStatus', async (userId)=>{
            try {
                const user = await User.findById(userId);
                let status;
                status = user.socketId.length > 0 ? 'Online' : 'Offline';
                socket.emit('getStatus', { status });
            } catch (error) {
                console.error("Error in operations:", error);
            }
        })

        socket.on('messageSeen', async ({me, user})=>{
            try {
                const sender = await User.findById(user);
                await Message.updateMany(
                    { sender: user, receiver: me },
                    { $set: { seen: true } }
                );  
                if (sender.socketId.length > 0) {
                    sender.socketId.forEach(socketId => socket.to(socketId).emit('messageSeen'));
                }              
            } catch (error) {
                console.error('Error in message seen:',error);
            }
        })


        socket.on('disconnect', async ()=>{
            console.log("User disconnected:", socket.id);
            try {
                const user = await User.findOneAndUpdate({ socketId: {$in: [socket.id]} }, { $pull:{socketId: socket.id}},{new: true});
                let status;
                if (user.socketId.length > 0) {
                    status = 'Online'
                }
                else{
                    status = 'Offline'
                }
                socket.broadcast.emit('getStatus', {userId:user._id, status});
            } catch (error) {
                console.error("Error in disconnect event:", error); 
            }
        });
    })

    return io;
};

export default setupSocket;
