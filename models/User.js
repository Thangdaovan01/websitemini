const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    user_name: { type: String,unique:true, default: '', required: true, maxlength: 100 },
    password: {type: String, minlength: 8, maxlength: 100, required: true},
    fullname: {type: String, maxlength: 100},
    role: { type: String, default: '',  enum: ['user', 'admin'] },
    gender: { type: String, default: 'other',  enum: ['male', 'female', 'other'] },
    dateJoined: { type: Date, default: Date.now },
    profilePicture: { type: String, default: 'avatar.jpg'},
    coverPicture: { type: String, default: 'cover.jpg'},
    bio: {type: String, maxlength: 500},
    userId: {type: String},
    active: {type: Boolean, default: true },
    birthday: { type: Date },

}, {
    timestamps: true,
});


module.exports = mongoose.model('User', User);