const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Friend = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    friendId: {type: Schema.Types.ObjectId, ref: 'User'}, 
    status: { type: String, default: 'pending',  enum: ['pending', 'accepted', 'rejected'] },
    
}, {
    timestamps: true,
});


module.exports = mongoose.model('Friend', Friend);