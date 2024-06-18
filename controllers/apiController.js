const express = require('express');
const { generateToken, decodeToken } = require('../middleware/authentication');
const { config } = require('../config/config.js');
const mongoose = require('mongoose');
const pdf = require('pdf-parse');
const pathA = require('path');
const elasticsearch = require('elasticsearch');
const fs = require('fs');

const client = new elasticsearch.Client({
    host: 'localhost:9200'
});

async function checkElasticsearchConnection() {
    try { 
        // Gửi yêu cầu ping đến Elasticsearch
        const body = await client.ping();
        console.log('Kết nối với Elasticsearch thành công:', body);
    } catch (error) {
        console.error('Lỗi khi kết nối đến Elasticsearch:', error);
    }
}

// Gọi hàm kiểm tra kết nối
checkElasticsearchConnection();

const User = require('../models/User')
const Post = require('../models/Post')
const Like = require('../models/Like')
const Comment = require('../models/Comment')
const Friend = require('../models/Friend')
const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const Notification = require('../models/Notification')

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
                // chuyển trạgn thái
                existingUser.active = true;
                await User.updateOne({ _id: existingUser._id }, existingUser);
                const token = generateToken(account);

                return res.status(200).json({ message: 'Đăng nhập thành công', token: token, role: existingUser.role});
            }
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const logout = async (req, res) => {
    try {
        const userId = req.body.userId;
        const existingUser = await User.findOne({ _id: userId });
        // console.log("existingUser",existingUser);

        if (!existingUser) {
            return res.status(400).json({ message: 'Username không tồn tại trong hệ thống' }); // user_name đã tồn tại
        } else {
                // chuyển trạgn thái
                existingUser.active = false;
                await User.updateOne({ _id: userId }, existingUser);
                return res.status(200).json({ message: 'Đăng xuất thành công'});
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
            const token = generateToken(account);

            const checkIndex1 = await client.indices.exists({
                index: 'users'  
            });

            if (checkIndex1) {
                // Nếu đã tồn tại index 'posts'
                const response = await client.index({
                    index: 'users',
                    body: {
                        fullname: account.fullname,
                    }
                });
                console.log("response",response)
                account.userId = response._id;
                console.log("account",account)

                const userNew = new User(account);
                console.log("userNew",userNew)

                await userNew.save();
                return res.status(200).json({ message: 'Đăng kí thành công', token: token });
            } else {
                // Nếu index 'documents' chưa tồn tại, tạo mới và thêm dữ liệu
                await client.indices.create({
                    index: 'users',
                });
                const response = await client.index({
                    index: 'users',
                    body: {
                        fullname: account.fullname,
                    }
                });
                account.userId = response._id;
                const userNew = new User(account);
                await userNew.save();
                return res.status(200).json({ message: 'Đăng kí thành công', token: token });
            }
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

const getUsers = async (req, res) => {
    try {

        // const token = req.header('Authorize');
        const token = decodeToken(req.header('Authorize'));
        const existingUser = await User.findOne({ user_name: token.user_name });
        const users = await User.find({  });

        // console.log("posts",posts);
        return res.status(200).json({user : existingUser, users: users });
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
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

const getSearchPost = async (req, res) => {

    // console.log("Get Search getSearchDocument");

    try {
        const { query } = req.query;
        // console.log("query",query);
        const body = await client.search({
            index: 'documents',
            body: {
                query: {
                    bool: {
                        should: [
                            { match_phrase: { title: query } },
                            { match_phrase: { description: query } },
                            { match_phrase: { documentText: query } },
                            { match_phrase: { subject: query } },
                            { match_phrase: { school: query } }
                        ]
                    }
                }
            }
        });
        // console.log("body",body.hits.hits);
        const searchLength=body.hits.total.value;
        const newArrayDocument = body.hits.hits.map(item => ({
            _id: item._id,
            _score: item._score,
            type: 'document',
            title: item._source.title,
            subject: item._source.subject,
            school: item._source.school,
            document: item._source.document,
            documentImage: item._source.documentImage,
            createdAt: item._source.createdAt,
            createdBy: item._source.createdBy,
            description: item._source.description,
        }));
          
        //tìm kiếm bài đăng
        const bodyPost = await client.search({
            index: 'posts',
            body: {
                query: {
                    bool: {
                        should: [
                            { match: { description: query } },
                        ]
                    }
                }
            }
        });
        // console.log("bodyPost",bodyPost.hits.hits);
        const newArrayPost = bodyPost.hits.hits.map(item => ({
            _id: item._id,
            _score: item._score,
            type: 'post',
            description: item._source.description,
        }));
        // console.log("newArrayPost",newArrayPost);

        //tìm kiếm user
        const bodyUser = await client.search({
            index: 'users',
            body: {
                query: {
                    bool: {
                        should: [
                            { match: { fullname: query } },
                        ]
                    }
                }
            }
        });
        const newArrayUser = bodyUser.hits.hits.map(item => ({
            _id: item._id,
            _score: item._score,
            type: 'user',
            description: item._source.fullname,
        }));

        let newArray1 = newArrayDocument.concat(newArrayPost)
        newArray1.sort((a, b) => b._score - a._score);
        let newArray = newArray1.concat(newArrayUser)
        newArray.sort((a, b) => b._score - a._score);
        return res.status(200).json({ data: newArray });
        
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({  });
        return res.status(200).json({posts : posts });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const getPost = async (req, res) => {
    try {
        const id = req.header('postId');
        // console.log("id",id)
        const post = await Post.findById(id);
        // console.log("post",post)

        return res.status(200).json({post : post });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
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

        if (newPost.description == '' && newPost.photo.length == 0 && newPost.video.length == 0) {
            return res.status(400).json({ message: 'Dữ liệu được gửi về Server không đầy đủ.' })
        }

        newPost.createdBy = existingUser._id;
        newPost.updatedBy = null;

       if(newPost.description !== ''){
            // Lưu tài liệu và thông tin vào Elasticsearch
            const checkIndex1 = await client.indices.exists({
                index: 'posts'  
            });

            console.log("checkIndex1", checkIndex1)

            if (checkIndex1) {
                // Nếu đã tồn tại index 'posts'
                const response = await client.index({
                    index: 'posts',
                    body: {
                        description: newPost.description,
                    }
                });
                console.log("response", response);
                newPost.postId = response._id;
                var excel = new Post(newPost);
                await excel.save();
                return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
            } else {
                // Nếu index 'documents' chưa tồn tại, tạo mới và thêm dữ liệu
                await client.indices.create({
                    index: 'posts',
                });
                const response = await client.index({
                    index: 'posts',
                    body: {
                        description: newPost.description,
                    }
                });
                newPost.postId = response._id;
                var excel = new Post(newPost);
                await excel.save();
                return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
            }
       }else{
            var excel = new Post(newPost);
            await excel.save();
            return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
       }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const updatePost = async (req, res) => {
    try {
        const updatePost = req.body;
        const postId1 = updatePost.postId;
        const description = updatePost.description;
        
        const token = req.header('Authorize');
        console.log("updatePost",updatePost);

        var newImage = updatePost.photo[0];
        var oldImage = updatePost.oldPicture;

        if(newImage != oldImage){
            // Tạo đường dẫn đầy đủ đến file cần xóa
            const filePath = pathA.resolve(__dirname, '../uploads/postImg', oldImage);

            // Xóa file một cách không đồng bộ
            fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
            }
            });
        }
        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const checkAcc = decodeToken(token);
        
        if (updatePost.description == '' && updatePost.photo.length == 0 && updatePost.video.length == 0) {
            return res.status(400).json({   message: 'Dữ liệu được gửi về Server không đầy đủ.' })
        }

        const existingUser = await User.findOne({ user_name: checkAcc.user_name });
        updatePost.createdBy = existingUser._id;
        updatePost.updatedBy = existingUser._id;

        

        if(postId1){
            await Post.updateOne({ _id: updatePost._id }, updatePost);
            const documentValue = await client.get({
                index: 'posts',
                id: postId1
            });
            // console.log("documentValue", documentValue);
                
            if(documentValue){
                const response = await client.update({
                    index: 'posts',
                    id: postId1,
                    body: {
                        doc: {
                            description: description,
                        }
                    }
                });
            return res.status(200).json({ message: 'Cập nhật thành công' });
            }
        } else {
            const checkIndex1 = await client.indices.exists({
                index: 'posts'  
            });

            if (checkIndex1) {
                // Nếu đã tồn tại index 'posts'
                const response = await client.index({
                    index: 'posts',
                    body: {
                        description: description,
                    }
                });
                // console.log("response", response);
                updatePost.postId = response._id;
                await Post.updateOne({ _id: updatePost._id }, updatePost);
                return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
            } else {
                // Nếu index 'documents' chưa tồn tại, tạo mới và thêm dữ liệu
                await client.indices.create({
                    index: 'posts',
                });
                const response = await client.index({
                    index: 'posts',
                    body: {
                        description: description,
                    }
                });
                updatePost.postId = response._id;
                await Post.updateOne({ _id: updatePost._id }, updatePost);
                return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
            }
        } 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const deletePost = async (req, res) => {
    console.log("deletePost");

    try {
        // const idRow = req.body.idRow;
        const idPost = req.body.idPost;
        console.log("idPost",idPost);
        if (!idPost) {
            return res.status(400).json({ message: 'Thông tin về dữ liệu bạn muốn xóa không được gửi về server.'});
        }
        const postsArr = await Post.find({  });
        const delPost = postsArr.filter(item => item._id == idPost);
        const delPostId = delPost[0].postId;
        const delDocId = delPost[0].documentId;
        console.log("postsArr",postsArr)
        console.log("delPost",delPost)
        console.log("delPostId",delPostId)
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

        if(delPostId){
            const checkIndex1 = await client.indices.exists({
                index: 'posts'  
            });
            console.log("checkIndex1",checkIndex1);
            if(checkIndex1){
                const response = await client.delete({
                    index: 'posts',
                    id: delPostId
                });
            }
        }

        if(delDocId){
            const checkIndex2 = await client.indices.exists({
                index: 'documents'  
            });
            console.log("checkIndex2",checkIndex2);
            if(checkIndex2){
                const response1 = await client.delete({
                    index: 'documents',
                    id: delDocId
                });
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

        var oldProfilePicture = updateInfo.oldProfilePicture;
        var profilePicture = updateInfo.profilePicture;
        var oldCoverPicture = updateInfo.oldCoverPicture;
        var coverPicture = updateInfo.coverPicture;

        if(oldProfilePicture != profilePicture && oldProfilePicture != 'avatar.jpg'){
            console.log('Xoá avatar');

            // Tạo đường dẫn đầy đủ đến file cần xóa
            const filePath = pathA.resolve(__dirname, '../uploads/userImg', oldProfilePicture);

            // Xóa file một cách không đồng bộ
            fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
            }
            });
        }

        if(oldCoverPicture != coverPicture && oldCoverPicture != 'cover.jpg'){
            console.log('Xoá cover');

            // Tạo đường dẫn đầy đủ đến file cần xóa
            const filePath = pathA.resolve(__dirname, '../uploads/userImg', oldCoverPicture);

            // Xóa file một cách không đồng bộ
            fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
            }
            });
        }

        const existingUser = await User.findOne({ _id: updateInfo._id });
        // console.log("existingUser",existingUser);
        const userId = existingUser.userId;
        await User.updateOne({ _id: updateInfo._id }, updateInfo);

        if(userId){
            const documentValue = await client.get({
                index: 'users',
                id: userId
            });
            // console.log("documentValue", documentValue);
                
            if(documentValue){
                const response = await client.update({
                    index: 'users',
                    id: userId,
                    body: {
                        doc: {
                            fullname: updateInfo.fullname,
                        }
                    }
                });
            return res.status(200).json({ message: 'Cập nhật thành công' });
            }
        }         
        // return res.status(200).json({ message: 'Cập nhật thành công.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}



const getLikes = async (req, res) => {
    try {
        const likes = await Like.find({  });
        return res.status(200).json({likes : likes });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const createLike = async (req, res) => {
    try {
        const createLike = req.body;
        const token = req.header('Authorize');
        // console.log("createLike",createLike);
        const likeArr = await Like.find({  });

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const userIdToCheck = createLike.userId;
        const likePostIdToCheck = createLike.likePostId;
        const likeCommentIdToCheck = createLike.likeCommentId;
        // console.log("likePostIdToCheck",likePostIdToCheck);
        // console.log("likeCommentIdToCheck",likeCommentIdToCheck);

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

                var post = await Post.findById(likePostIdToCheck);
                var targetId = post.createdBy;
                var notification = {
                    type: 'like',
                    initiatorId: userIdToCheck,
                    targetId: targetId,
                    link: likePostIdToCheck
                }
                // console.log("notification",notification);
                const notification1 = new Notification(notification);
                await notification1.save();
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
                // console.log("like1",like1);
                await like1.save();

                var comment = await Comment.findById(likeCommentIdToCheck);
                // console.log("comment",comment);
                // var postId = comment.postId;
                // var post = await Post.findById(postId);
                var targetId = comment.userId;
                var notification = {
                    type: 'comment-like',
                    initiatorId: userIdToCheck,
                    targetId: targetId,
                    link: likeCommentIdToCheck
                }
                // console.log("notification",notification);
                const notification2 = new Notification(notification);
                await notification2.save();

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
        // console.log("deleteLike",deleteLike)
        const likeArr = await Like.find({  });
        const userIdToCheck = deleteLike.userId;
        const likePostIdToCheck = deleteLike.likePostId;
        const likeCommentIdToCheck = deleteLike.likeCommentId;
        
        
        if (deleteLike.userId == '' && deleteLike.likePostId == 0) {
            return res.status(400).json({ message: 'Thông tin về dữ liệu bạn muốn xóa không được gửi về server.'});
        }
        if(likePostIdToCheck){
            const delPostLike = likeArr.filter(item => item.userId == userIdToCheck && item.likePostId == likePostIdToCheck);
            const likeArr1 = likeArr.filter(item => !(item.userId == userIdToCheck && item.likePostId == likePostIdToCheck));
            // console.log("delPostLike",delPostLike);
            const delPostLikeId = delPostLike[0]._id;
            await Like.deleteOne({ _id: delPostLikeId });
            var notification = await Notification.findOne({ link: likePostIdToCheck });
            // console.log("notification",notification);
            var notificationId = notification._id;
            await Notification.deleteOne({ _id: notificationId });

            // const likeArr1 = await Like.find({  });
            return res.status(200).json({ likeArr1: likeArr1 });
        }

        if(likeCommentIdToCheck){
            const delCommentLike = likeArr.filter(item => item.userId == userIdToCheck && item.likeCommentId == likeCommentIdToCheck);
            const likeArr2 = likeArr.filter(item => !(item.userId == userIdToCheck && item.likeCommentId == likeCommentIdToCheck));
            // console.log("delCommentLike",delCommentLike);
            // console.log("delLike._id",delLike[0]._id);
            const delCommentLikeId = delCommentLike[0]._id;

            await Like.deleteOne({ _id: delCommentLikeId });
            var notification = await Notification.findOne({ link: likeCommentIdToCheck });
            // console.log("notification",notification);

            var notificationId = notification._id;
            await Notification.deleteOne({ _id: notificationId });            
            return res.status(200).json({ likeArr1: likeArr2 });
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
        // console.log("token",token);
        // console.log("newComment",newComment);
        const userId = newComment.userId;
        const postId = newComment.postId;

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

        var post = await Post.findById(postId);
        var targetId = post.createdBy;
        var notification = {
            type: 'comment',
            initiatorId: userId,
            targetId: targetId,
            link: comment._id
        }
        // console.log("notification",notification);
        const notification1 = new Notification(notification);
        await notification1.save();

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
        // console.log("commentValue",commentValue);
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

            var notification = await Notification.findOne({ link: idComment });
            // console.log("notification",n/otification);
            var notificationId = notification._id;
            await Notification.deleteOne({ _id: notificationId });

            return res.status(200).json({ commentArr1: commentArr1 });
        }

        // const commentsArr = await Comment.find({  });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi từ phía server' });
    }
}

const getFriends = async (req, res) => {
    try {
        const friends = await Friend.find({  });
        return res.status(200).json({friends : friends });
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const createFriend = async (req, res) => {
    try {
        const newFriend = req.body;
        const token = req.header('Authorize');
        // console.log("token",token);
        console.log("newFriend",newFriend);
        const initiatorId = newFriend.userId;
        const targetId = newFriend.friendId;

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

        var notification = {
            type: 'friend',
            initiatorId: initiatorId,
            targetId: targetId,
            link: friend._id
        }
        // console.log("notification",notification);
        const notification1 = new Notification(notification);
        await notification1.save();

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
            const friendsArr1 = await Friend.find({  });

            // var notification = await Notification.findOne({ link: updateFriendId });
            // console.log("notification",notification);
            // var notificationId = notification._id;
            // await Notification.deleteOne({ _id: notificationId });

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

        let conversation = await Conversation.findOne({
			participants: { $all: [userId, friendId] },
		});
        const messages = conversation.messages;
        const ids = messages.map(message => message._id);
        await Conversation.deleteOne({ _id: conversation._id });
        await Message.deleteMany({ _id: { $in: ids } });

        if(friend){
            await Friend.deleteOne({ _id: friend._id });
            const friend1 = friendArr.filter(f => !(f.userId == userId && f.friendId == friendId));

            var notification = await Notification.findOne({ link: friend._id });
            // console.log("notification",notification);
            if(notification){
                var notificationId = notification._id;
                await Notification.deleteOne({ _id: notificationId });
            }
            
            return res.status(200).json({ friendsArr: friend1 });
        }

        if(friend2){
            await Friend.deleteOne({ _id: friend2._id });
            const friend3 = friendArr.filter(f => !(f.userId == friendId && f.friendId == userId));

            var notification = await Notification.findOne({ link: friend2._id });
            if(notification){
                var notificationId = notification._id;
                await Notification.deleteOne({ _id: notificationId });
            }

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



const getSearchDocument = async (req, res) => {

    console.log("Get Search getSearchDocument");

    try {
        const { query } = req.query;
        console.log("query",query);

      
        // res.json(hits.hits.map(hit => hit._source));
        const body = await client.search({
            index: 'documents',
            body: {
                query: {
                    bool: {
                        should: [
                            { match_phrase: { title: query } },
                            { match_phrase: { description: query } },
                            { match_phrase: { documentText: query } },
                            { match_phrase: { subject: query } },
                            { match_phrase: { school: query } }
                        ]
                    }
                }
            }
        });
        // console.log("body",body.hits.hits);
        const searchLength=body.hits.total.value;
        const newArray = body.hits.hits.map(item => ({
            _id: item._id,
            title: item._source.title,
            subject: item._source.subject,
            school: item._source.school,
            document: item._source.document,
            documentImage: item._source.documentImage,
            createdAt: item._source.createdAt,
            createdBy: item._source.createdBy,
            description: item._source.description,
        }));
          
        // console.log(newArray);
        return res.status(200).json({ data: newArray, searchLength:searchLength });
        
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const createDocument = async (req, res) => {

    console.log("Get createDocument");

    try {
        const newDocument = req.body.newDocument;
        console.log("newDocument", newDocument);

        const documentPath = pathA.resolve(__dirname, '../uploads/documents', newDocument.document);

        // Đọc nội dung của tệp PDF
        let dataBuffer = fs.readFileSync(documentPath);
        let documentText;
        try {
            const data = await pdf(dataBuffer);
            documentText = data.text;
        } catch (err) {
            console.error('Đã xảy ra lỗi trong quá trình chuyển đổi:', err);
            return res.status(500).json({ message: 'Lỗi trong quá trình chuyển đổi PDF' });
        }

        const token = req.header('Authorize');
        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }
        const checkAcc = decodeToken(token);
        const existingUser = await User.findOne({ user_name: checkAcc.user_name });

        //Tạo bài đăng mới
        var photo = [ newDocument.documentImage ];
        var newPost = {
            title: newDocument.title,
            description: newDocument.description,
            photo: photo,
            privacy: 'public',
        }
        newPost.createdBy = existingUser._id;
        newPost.updatedBy = null;

        // Lưu tài liệu và thông tin vào Elasticsearch
        const checkIndex1 = await client.indices.exists({
            index: 'documents'  
        });

        console.log("checkIndex1", checkIndex1)

        if (checkIndex1) {
            // Nếu đã tồn tại index 'documents'
            const response = await client.index({
                index: 'documents',
                body: {
                    title: newDocument.title,
                    description: newDocument.description,
                    documentText: documentText,
                    subject: newDocument.subject,
                    school: newDocument.school,
                    document: newDocument.document,
                    documentImage: newDocument.documentImage,
                    createdAt: Date.now(),
                    createdBy: existingUser ? existingUser._id : null
                }
            });
            console.log("response", response);
            newPost.documentId = response._id;
            var excel = new Post(newPost);
            await excel.save();
            return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
        } else {
            // Nếu index 'documents' chưa tồn tại, tạo mới và thêm dữ liệu
            await client.indices.create({
                index: 'documents',
            });
            const response = await client.index({
                index: 'documents',
                body: {
                    title: newDocument.title,
                    description: newDocument.description,
                    documentText: documentText,
                    subject: newDocument.subject,
                    school: newDocument.school,
                    document: newDocument.document,
                    documentImage: newDocument.documentImage,
                    createdAt: Date.now(),
                    createdBy: existingUser ? existingUser._id : null
                }
            });
            newPost.documentId = response._id;
            var excel = new Post(newPost);
            await excel.save();
            return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const updateDocument = async (req, res) => {

    console.log("Get updateDocument");

    try {
        const documentId = req.body.documentId;
        console.log("documentId", documentId);

        const token = req.header('Authorize');
        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }
        const checkAcc = decodeToken(token);
        const existingUser = await User.findOne({ user_name: checkAcc.user_name });
        var currId = existingUser._id;

        const documentValue = await client.get({
            index: 'documents',
            id: documentId
        });
        // console.log("documentValue", documentValue);
        var viewValue = documentValue._source.viewValue;
        var viewCount = documentValue._source.viewCount;
        // console.log("viewValue", viewValue);
        // console.log("viewCount", viewCount);

        if(!documentValue._source.viewValue){
            viewValue = [
                {
                    viewAt: Date.now(),
                    viewBy: existingUser ? currId : null,
                }
            ];
            viewCount = 1;
        } else {
            viewValue = viewValue.filter(obj => obj.viewBy != currId);
            viewValue.push(
                {
                    viewAt: Date.now(),
                    viewBy: existingUser ? currId : null
                }
            )
            viewCount += 1;
        }
        // console.log("viewValue1", viewValue);
        // console.log("viewCount1", viewCount);

        if(documentValue){
            const response = await client.update({
                index: 'documents',
                id: documentId,
                body: {
                    doc: {
                        viewValue: viewValue,
                        viewCount: viewCount
                    }
                }
            });
            return res.status(200).json({ message: 'Cập nhật view document thành công' });

        }
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const getDocuments = async (req, res) => {
    // const documentId = req.params.id;
    // console.log("documentId",documentId);

    try {
        const checkIndex = await client.indices.exists({
            index: 'documents'  // Tên của index cần kiểm tra
        });
    
        if(checkIndex){
            const body = await client.search({
                index: 'documents',
                body: {
                    query: {
                        match_all: {}
                    },
                    size: 1000
                }
            });
            const newArray = body.hits.hits.map(({ _id, _source: { title, description, school , subject, document, documentImage, createdAt, createdBy, viewValue, viewCount } }) => ({ _id, title, description, school , subject, document, documentImage, createdAt, createdBy, viewValue, viewCount }));
            return res.status(200).json({ documents: newArray });

        } else {
            return res.status(400).json({ message: 'Không có tài liệu nào' })
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const getDocument= async (req, res) => {
    const documentId = req.params.id;

    try {
        const checkIndex = await client.indices.exists({
            index: 'documents'  // Tên của index cần kiểm tra
        });
    
        if(checkIndex){
            const findDocument = await client.get({
                index: 'documents',
                id: documentId
            });
            // console.log("findDocument",findDocument);
            // const newArray = body.hits.hits.map(({ _id, _source: { title, description, school , subject, document, documentImage, createdAt, createdBy } }) => ({ _id, title, description, school , subject, document, documentImage, createdAt, createdBy }));

            const { _id, _source: { title, description, school , subject, document, documentImage, createdAt, createdBy, viewValue, viewCount } } = findDocument;
            const resultObject = { _id, title, description, school , subject, document, documentImage, createdAt, createdBy, viewValue, viewCount };
            return res.status(200).json({ document: resultObject });
        } else {
            return res.status(400).json({ message: 'Không có tài liệu nào' })
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const uploadDocumentFile =  async (req, res) => {
    try {
        res.status(200).json({ filename: req.file.filename });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary' });
    }
};

const uploadDocumentImageFile =  async (req, res) => {
    console.log("uploadDocumentImageFile")
    try {
        res.status(200).json({ filename: req.file.filename });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary' });
    }
};

//chưa dùng
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({  });
        return res.status(200).json({messages : messages });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const getMessage = async (req, res) => {
    try {
        // const messages = await Message.find({  });
        const senderId = req.header('senderId');
        const receiverId = req.header('receiverId');

        const conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES
        // console.log("conversation",conversation);

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;
        // console.log("messages",messages);

        return res.status(200).json({messages : messages });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const createMessage = async (req, res) => {
    console.log("createMessage");

    try {
        const newMess = req.body.newMess;
        const token = req.header('Authorize');
        console.log("newMess",newMess);
        const senderId = newMess.senderId;
        const receiverId = newMess.receiverId;
        const messageText = newMess.messageText;
        
        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

        // console.log("conversation",conversation)
		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

        const newMessage = new Message({
			senderId,
			receiverId,
			messageText,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

        await Promise.all([conversation.save(), newMessage.save()]);
        return res.status(200).json({messages : newMessage });
        
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}
//chưa dùng
const deleteMessage = async (req, res) => {
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
//chưa dùng
const getConversations = async (req, res) => {
    try {
        const messages = await Message.find({  });
        return res.status(200).json({messages : messages });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}
//chưa dùng
const createConversation = async (req, res) => {
    try {
        const createMessage = req.body;
        const token = req.header('Authorize');
        console.log("createMessage",createMessage);
        
        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({  });
        return res.status(200).json({notifications : notifications });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const getNotification = async (req, res) => {
    try {
        const userId = req.header('userId');
        const notifications = await Notification.find({ targetId : userId, unread: true });
        return res.status(200).json({notifications : notifications });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const deleteNotification = async (req, res) => {
    try {
        // const idRow = req.body.idRow;
        const notificationId = req.body.notificationId;
        
        const notification = await Notification.findById(notificationId);
        
        if(notification){
            await Notification.deleteOne({ _id: notificationId });
            // const likeArr1 = await Like.find({  });
            return res.status(200).json({ message: 'Xoá thành công' });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi từ phía server' });
    }
}


module.exports = {
    login, register, logout, getUser, getUsers,
    deletePost, createPost, updatePost, getRow, getPosts, getSearchPost, getPost,
    updateUserProfile,
    createLike, deleteLike, getLikes,
    createComment, updateComment, deleteComment,
    getFriends, createFriend, updateFriend, deleteFriend,
    uploadPostImg, uploadUserImg,
    createDocument, getDocuments, getDocument, getSearchDocument, updateDocument,
    uploadDocumentFile, uploadDocumentImageFile,
    getMessages, createMessage, deleteMessage, getMessage,
    getConversations, getNotifications, getNotification, deleteNotification
}