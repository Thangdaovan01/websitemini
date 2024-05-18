const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Comment = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', default: ''},
    postId: {type: Schema.Types.ObjectId, ref: 'Post', default: ''}, 
    // likeComment: {type: Schema.Types.ObjectId, ref: 'Comment', default: ''},
    commentText: { type: String, default: '' },
    isEdited: { type: Boolean, default: 'false' },

}, {
    timestamps: true,
});


module.exports = mongoose.model('Comment', Comment);