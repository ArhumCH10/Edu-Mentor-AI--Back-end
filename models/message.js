const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
    },
    message: {
        type: String,
    },
    type: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    data: {
        type: Object,
    },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
