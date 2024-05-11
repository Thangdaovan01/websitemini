const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Post = new Schema({
    createdBy: {type: Schema.Types.ObjectId, ref: 'User', default: ''},
    updatedBy: {type: Schema.Types.ObjectId, ref: 'User', default: ''},
    privacy: { type: String, default: 'public',  enum: ['public', 'friend', 'only'] },
    description: { type: String, default: '' },
    photo: [{ type: String, default: '' }],
    video: [{ type: String, default: '' }], 

}, {
    timestamps: true,
});


module.exports = mongoose.model('Post', Post);