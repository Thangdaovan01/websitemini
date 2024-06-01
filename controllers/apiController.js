const express = require('express');
const { generateToken, decodeToken } = require('../middleware/authentication');
const { config } = require('../config/config.js');
const mongoose = require('mongoose');

const User = require('../models/User')
const Excel = require('../models/Excel')
const Post = require('../models/Post')
const Like = require('../models/Like')
const Comment = require('../models/Comment')
const Friend = require('../models/Friend')

const style = [];
const usersArr = [];
const postsArr = [];
const likesArr = [];


const login = async (req, res) => {
    try {
        const account = req.body;
        // console.log("Account",account);

        if (!account.user_name || !account.password) {
            return res.status(400).json({ message: 'Account không nhận được ở phía Server' })
        }

        const existingUser = await User.findOne({ user_name: account.user_name });
        // console.log("existingUser",existingUser);

        if (!existingUser) {
            return res.status(400).json({ message: 'Username không tồn tại trong hệ thống' }); // user_name đã tồn tại
        } else {
            if(existingUser.password !== account.password) {
                return res.status(400).json({ message: 'Mật khẩu không đúng' });
            } else {
                // Mật khẩu khớp, tiếp tục xử lý đăng nhập
                const token = generateToken(account);

                return res.status(200).json({ message: 'Đăng nhập thành công', token: token, role: existingUser.role});
            }
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}
 
const register = async (req, res) => {
    try {
        const account = req.body;
        if (!account.fullname || !account.user_name || !account.password) {
            return res.status(400).json({ message: 'Thông tin tài khoản đăng kí không được gửi đầy đủ về phía server' });
        }

        const existingUser = await User.findOne({ user_name: account.user_name });
        // console.log("existingUser",existingUser);

        if (existingUser) {
            return res.status(400).json({ message: 'Tài khoản đã tồn tại' }); // user_name đã tồn tại
        } else {
            const userNew = new User(account);
            // console.log("userNew", userNew);
            const token = generateToken(account);

            await userNew.save();
            return res.status(200).json({ message: 'Đăng kí thành công', token: token });
        }
                
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const getUser = async (req, res) => {
    try {

        // const token = req.header('Authorize');
        const token = decodeToken(req.header('Authorize'));
        const existingUser = await User.findOne({ user_name: token.user_name });
        const users = await User.find({  });
        const likes = await Like.find({  });
        const friends = await Friend.find({  });
        const posts = await Post.find({  }).sort({ createdAt: -1 }).exec();
        const comments = await Comment.find({  });

        // console.log("posts",posts);
        return res.status(200).json({user : existingUser, posts : posts, users: users, likes: likes, comments: comments, friends : friends });
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const getStyle = async (req, res) => {
    try {
        Excel.find({}) 
        .lean() 
        .then((excels) => {
            return res.status(200).json(excels);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình xử lý 2' });
        }); 
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

const getRow = async (req, res) => {
    
    try {
        const searchValue = req.query.key;
        // console.log("searchValue",searchValue);

        if (!searchValue) {
            return res.status(400).json({ message: 'Vui lòng nhập giá trị tìm kiếm'});
        }
        const excels = await Excel.find({
            $or: [
                { website: { $regex: searchValue, $options: 'i' } }, // Tìm theo tiêu đề, không phân biệt hoa thường
                { position: { $regex: searchValue, $options: 'i' } },
                { dimensions: { $regex: searchValue, $options: 'i' } },
                { platform: { $regex: searchValue, $options: 'i' } },
                { buying_method: { $regex: searchValue, $options: 'i' } },
            ]
        });


        // console.log("excels",excels);


        if (!excels || !excels.length) {
            return res.status(400).json({ message: 'Không có giá trị cần tìm kiếm'});
        } else {
            return res.status(200).json(excels);
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
    }
}

const createPost = async (req, res) => {
    try {
        const newPost = req.body;
        const token = req.header('Authorize');
        // console.log("token",token);
        // console.log("newPost",newPost);

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const checkAcc = decodeToken(token);
        
        const existingUser = await User.findOne({ user_name: checkAcc.user_name });
        // console.log("existingUser", existingUser)


        if (newPost.description == '' && newPost.photo.length == 0 && newPost.video.length == 0) {
            return res.status(400).json({ message: 'Dữ liệu được gửi về Server không đầy đủ.' })
        }

        newPost.createdBy = existingUser._id;
        newPost.updatedBy = null;

        const excel = new Post(newPost);
        await excel.save();
        return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const updatePost = async (req, res) => {
    try {
        const updatePost = req.body;
        const token = req.header('Authorize');

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const checkAcc = decodeToken(token);
        
        if (updatePost.description == '' && updatePost.photo.length == 0 && updatePost.video.length == 0) {
            return res.status(400).json({   message: 'Dữ liệu được gửi về Server không đầy đủ.' })
        }

        const existingUser = await User.findOne({ user_name: checkAcc.user_name });
        // console.log("existingUser", existingUser)
        updatePost.createdBy = existingUser._id;
        updatePost.updatedBy = existingUser._id;
        // console.log("updatePost",updatePost);

        await Post.updateOne({ _id: updatePost._id }, updatePost);
        
        return res.status(200).json({ message: 'Cập nhật thành công.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const deletePost = async (req, res) => {
    try {
        // const idRow = req.body.idRow;
        const idPost = req.body.idPost;
        console.log(idPost);
        if (!idPost) {
            return res.status(400).json({ message: 'Thông tin về dữ liệu bạn muốn xóa không được gửi về server.'});
        }
        const postsArr = await Post.find({  });
        const delPost = postsArr.filter(item => item._id == idPost);
        const postsArr1 = postsArr.filter(item => !(item._id == idPost));
        const likesArr = await Like.find({  });
        const likePost = likesArr.filter(item => item.likePostId == idPost);
        const likePostIds = likePost.map(post => post._id);
        const commentsArr = await Comment.find({  });
        const commentPost = commentsArr.filter(item => item.postId == idPost);
        const commentPostIds = commentPost.map(post => post._id);

        if (likePostIds && likePostIds.length > 0) {
            try {
                await Like.deleteMany({ _id: { $in: likePostIds } });
                console.log('Đã xóa thành công các bài viết!');
            } catch (error) {
                console.error('Có lỗi xảy ra khi xóa các bài viết:', error);
            }
        }

        if (commentPostIds && commentPostIds.length > 0) {
            try {
                await Comment.deleteMany({ _id: { $in: commentPostIds } });
                console.log('Đã xóa thành công các bài viết!');
            } catch (error) {
                console.error('Có lỗi xảy ra khi xóa các bài viết:', error);
            }
        }

        if(delPost){
            await Post.deleteOne({ _id: idPost });
            return res.status(200).json({ postsArr1: postsArr1 });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi từ phía server' });
    }
}

function getIdFromtUsername(username, array) {
    // Duyệt qua mảng để tìm kiếm website và lấy giá trị type
    for (var i = 0; i < array.length; i++) {
        if (array[i].user_name === username) {
            return array[i]._id;
        }
    }
    // Nếu không tìm thấy, trả về null hoặc giá trị mặc định khác
    return null; // hoặc trả về một giá trị mặc định khác tùy theo yêu cầu của bạn
}

const updateUserProfile = async (req, res) => {
    try {
        const updateInfo = req.body;
        const token = req.header('Authorize');
        console.log("updateInfo",updateInfo)
        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const checkAcc = decodeToken(token);
        
        if (updateInfo.fullname == '' && updateInfo.coverPicture == '' && updateInfo.profilePicture == 0) {
            return res.status(400).json({   message: 'Dữ liệu được gửi về Server không đầy đủ.' })
        }

        const existingUser = await User.findOne({ _id: updateInfo._id });

        await User.updateOne({ _id: updateInfo._id }, updateInfo);
        
        return res.status(200).json({ message: 'Cập nhật thành công.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const createLike = async (req, res) => {
    try {
        const createLike = req.body;
        const token = req.header('Authorize');
        console.log("createLike",createLike);
        const likeArr = await Like.find({  });

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const userIdToCheck = createLike.userId;
        const likePostIdToCheck = createLike.likePostId;
        const likeCommentIdToCheck = createLike.likeCommentId;

        if(likePostIdToCheck){
            if (createLike.userId == '' && createLike.likePostId == '') {
                return res.status(400).json({ message: 'Dữ liệu được gửi về Server không đầy đủ.' })
            }
    
            const isExistPost = likeArr.some(item => item.userId == userIdToCheck && item.likePostId == likePostIdToCheck);
    
            if (isExistPost) {
                return res.status(400).json({ message: 'Bạn đã like bài viết này.' });
            } else {
                const like = new Like(createLike);
                await like.save();
                const likeArr1 = await Like.find({  });
                return res.status(200).json({ likeArr1: likeArr1 });
            }
        }

        if(likeCommentIdToCheck){
            if (createLike.userId == '' && createLike.likeCommentId == '') {
                return res.status(400).json({ message: 'Dữ liệu được gửi về Server không đầy đủ.' })
            }
    
            const isExistComment = likeArr.some(item => item.userId == userIdToCheck && item.likeCommentId == likeCommentIdToCheck);
    
            if (isExistComment) {
                return res.status(400).json({ message: 'Bạn đã like comment này.' });
            } else {
                const like1 = new Like(createLike);
                console.log("like1",like1);
                await like1.save();
                const likeArr1 = await Like.find({  });
                return res.status(200).json({ likeArr1: likeArr1 });
            }
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const deleteLike = async (req, res) => {
    try {
        // const idRow = req.body.idRow;
        const deleteLike = req.body;
        const likeArr = await Like.find({  });
        const userIdToCheck = deleteLike.userId;
        const likePostIdToCheck = deleteLike.likePostId;
        const delLike = likeArr.filter(item => item.userId == userIdToCheck && item.likePostId == likePostIdToCheck);
        const likeArr1 = likeArr.filter(item => !(item.userId == userIdToCheck && item.likePostId == likePostIdToCheck));

        console.log("delLike._id",delLike[0]._id);
        const delLikeId = delLike[0]._id;
        if (deleteLike.userId == '' && deleteLike.likePostId == 0) {
            return res.status(400).json({ message: 'Thông tin về dữ liệu bạn muốn xóa không được gửi về server.'});
        }
        if(delLike){
            await Like.deleteOne({ _id: delLikeId });
            // const likeArr1 = await Like.find({  });
            return res.status(200).json({ likeArr1: likeArr1 });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi từ phía server' });
    }
}

const createComment = async (req, res) => {
    try {
        const newComment = req.body;
        const token = req.header('Authorize');
        console.log("token",token);
        console.log("newComment",newComment);

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const checkAcc = decodeToken(token);
        
        const existingUser = await User.findOne({ user_name: checkAcc.user_name });
        // console.log("existingUser", existingUser)

        if (newComment.commentText == '') {
            return res.status(400).json({ message: 'Bạn chưa điền Comment.' })
        }

        const comment = new Comment(newComment);
        await comment.save();
        return res.status(200).json({ message: 'Đã thêm comment mới.' });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const updateComment = async (req, res) => {
    try {
        const updateComment = req.body;
        const token = req.header('Authorize');

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        if (updateComment.commentText == '') {
            return res.status(400).json({   message: 'Dữ liệu được gửi về Server không đầy đủ.' })
        }

        console.log("updateComment", updateComment);

        const commentArr = await Comment.find({  });
        const commentValue = commentArr.find(element => element._id == updateComment._id);
        if(commentValue){
            await Comment.updateOne({ _id: updateComment._id }, updateComment);
            const commentArr1 = await Comment.find({  });
            return res.status(200).json({ commentArr1: commentArr1 });
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const deleteComment = async (req, res) => {
    try {
        // const idRow = req.body.idRow;
        const idComment = req.body.idComment;
        console.log(idComment);
        if (!idComment) {
            return res.status(400).json({ message: 'Thông tin về dữ liệu bạn muốn xóa không được gửi về server.'});
        }

        const commentArr = await Comment.find({  });
        const commentValue = commentArr.find(element => element._id == idComment);
        const commentArr1 = commentArr.filter(element => element._id !== idComment);
        
        const commentReply = commentArr.filter(item => item.repCommentId == idComment);
        const commentReplyIds = commentReply.map(comment => comment._id);

        if (commentReplyIds && commentReplyIds.length > 0) {
            try {
                await Comment.deleteMany({ _id: { $in: commentReplyIds } });
                console.log('Đã xóa thành công các comment phản h!');
            } catch (error) {
                console.error('Có lỗi xảy ra khi xóa các bài viết:', error);
            }
        }

        if(commentValue){
            await Comment.deleteOne({ _id: idComment });
            return res.status(200).json({ commentArr1: commentArr1 });
        }

        // const commentsArr = await Comment.find({  });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi từ phía server' });
    }
}

const createFriend = async (req, res) => {
    try {
        const newFriend = req.body;
        const token = req.header('Authorize');
        // console.log("token",token);
        // console.log("newFriend",newFriend);

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const checkAcc = decodeToken(token);
        
        // const existingUser = await User.findOne({ user_name: checkAcc.user_name });
        // console.log("existingUser", existingUser)

        // if (newComment.commentText == '') {
        //     return res.status(400).json({ message: 'Bạn chưa điền Comment.' })
        // }

        const friend = new Friend(newFriend);
        await friend.save();
        return res.status(200).json({ message: 'Đã thêm comment mới.' });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const updateFriend = async (req, res) => {
    try {
        const updateFriend = req.body;
        const token = req.header('Authorize');

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        // if (updateComment.commentText == '') {
        //     return res.status(400).json({   message: 'Dữ liệu được gửi về Server không đầy đủ.' })
        // }

        console.log("updateFriend", updateFriend);
        const updateFriendId = updateFriend._id;
        const friendsArr = await Friend.find({  });
        const friendsValue = friendsArr.find(element => element._id == updateFriendId);
        if(friendsValue){
            await Friend.updateOne({ _id: updateFriendId }, updateFriend);
            const friendsArr1 = await Comment.find({  });
            return res.status(200).json({ friendsArr: friendsArr1 });
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const deleteFriend = async (req, res) => {
    try {
        // const idRow = req.body.idRow;
        const cancelFriend = req.body;
        var userId = cancelFriend.userId;
        var friendId = cancelFriend.friendId;
        console.log("cancelFriend",cancelFriend);
        if (!cancelFriend) {
            return res.status(400).json({ message: 'Thông tin về dữ liệu bạn muốn xóa không được gửi về server.'});
        }

        const friendArr = await Friend.find({  });
        const friend = friendArr.find(f => f.userId == userId && f.friendId == friendId);
        const friend2 = friendArr.find(f => f.userId == friendId && f.friendId == userId);
        
        // console.log("friend",friend);
        // console.log("userId",userId);
        // console.log("friendId",friendId);

        if(friend){
            await Friend.deleteOne({ _id: friend._id });
            const friend1 = friendArr.filter(f => !(f.userId == userId && f.friendId == friendId));
            return res.status(200).json({ friendsArr: friend1 });
        }

        if(friend2){
            await Friend.deleteOne({ _id: friend2._id });
            const friend3 = friendArr.filter(f => !(f.userId == friendId && f.friendId == userId));
            return res.status(200).json({ friendsArr: friend3 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi từ phía server' });
    }
}

const uploadPostImg =  async (req, res) => {
    try {
        res.status(200).json({ filename: req.file.filename });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary' });
    }
};

const uploadUserImg =  async (req, res) => {
    try {
        res.status(200).json({ filename: req.file.filename });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary' });
    }
};


module.exports = {
    login, register, getUser,
    getStyle, 
    deletePost, createPost, updatePost, getRow,
    updateUserProfile,
    createLike, deleteLike,
    createComment, updateComment, deleteComment,
    createFriend, updateFriend, deleteFriend,
    uploadPostImg, uploadUserImg
}