const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Notification = new Schema({
    initiatorId: {type: Schema.Types.ObjectId, ref: 'User'},
    targetId: {type: Schema.Types.ObjectId, ref: 'User'}, 
    type: { type: String, enum: ['friend', 'like', 'comment-like', 'comment', 'reply'], },
    unread: { type: Boolean, default: true},
    link: { type: String },
}, {
    timestamps: true,
});


module.exports = mongoose.model('Notification', Notification);