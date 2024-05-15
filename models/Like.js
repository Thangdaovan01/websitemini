const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Like = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', default: ''},
    likePostId: {type: Schema.Types.ObjectId, ref: 'Post', default: ''}, 
    // likeComment: {type: Schema.Types.ObjectId, ref: 'Comment', default: ''},
}, {
    timestamps: true,
});


module.exports = mongoose.model('Like', Like);