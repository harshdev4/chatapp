import Message from "../models/Message.js";

export const fetchMessages = async (req, res) =>{
    const {sender, receiver} = req.query;
    try {
        const messages = await Message.find({ $or:[{sender, receiver}, {sender:receiver, receiver: sender}],});
        
        return res.status(200).json({allMessages: messages});
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error})
    }
}

export const latestMessage = async (req, res)=>{
    const senderId = req.user.userId;
    const receiverId = req.params.id;
    
    try {
        const messages = await Message.find({ $or:[{sender: senderId, receiver: receiverId}, {sender: receiverId, receiver: senderId}],}).sort({timestamp: -1});
        
        if (messages.length > 0) {
            return res.status(200).json({message: messages[0]});
        }
        else{
            return res.status(200).json({sender: senderId, receiver: receiverId, message: ''});
        }
        
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error})
    }
}