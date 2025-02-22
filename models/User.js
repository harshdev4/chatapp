import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    profilePic: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    socketId: {
        type: [String],
        default: [],
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);