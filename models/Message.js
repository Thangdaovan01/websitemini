const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Message = new Schema({
    senderId: {type: Schema.Types.ObjectId, ref: 'User'},
    receiverId: {type: Schema.Types.ObjectId, ref: 'User'}, 
    messageText: { type: String },
    
}, {
    timestamps: true,
});


module.exports = mongoose.model('Message', Message);