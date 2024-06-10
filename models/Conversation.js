const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Conversation = new Schema({
    participants: [{type: Schema.Types.ObjectId, ref: 'User'}],
    messages: [{type: Schema.Types.ObjectId, ref: 'Message'}], 
}, {
    timestamps: true,
});


module.exports = mongoose.model('Conversation', Conversation);