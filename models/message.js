const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        required: true,
    },
    senderId:{
        type:String,
    },
    message:{
        type:String,
    },
    type:{
        type:String,
    },

})
const Message = mongoose.model('Message',messageSchema);
module.exports = Message;