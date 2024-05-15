const express = require('express');
const { generateToken, decodeToken } = require('../middleware/authentication');
// import { deleteImageFromStorage, multer, uploadImageToStorage } from '../storage/cloudinary';
// const { deleteImageFromStorage, multer, uploadImageToStorage } = require('../storage/cloudinary');
const { config } = require('../config/config.js');

const cloudinary = require('cloudinary').v2;

const User = require('../models/User')
const Excel = require('../models/Excel')
const Post = require('../models/Post')

const style = [];

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
        // console.log("account",account);

        // const userNew = new User(account);

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

        const posts = await Post.find({  }).sort({ createdAt: -1 }).exec();

        // console.log("posts",posts);
        return res.status(200).json({user : existingUser, posts : posts, users: users });
        
    } catch (error) {
        console.error(error);
        return res.status(404).json('Server error');
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

        Post.deleteOne({ _id: idPost })
            .lean()
            .then(() => {return res.status(200).json({message: "Xóa thành công"})}) //Khi thành công thì thực thi
            .catch(error => {
                console.error(error);
                return res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình xử lý' });
            });
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


const uploadImage =  async (req, res) => {
    console.log("apiRouter.post");

    try {
        // console.log("REQ",req.body.imageUrl);
        // Tải ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(req.body.imageUrl);
        // const result = await cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg");
        console.log("result",result);
        // Lấy link ảnh từ Cloudinary
        const imageUrl = result.secure_url;

        // Trả về link ảnh cho client
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary' });
    }
};

const updateUserProfile = async (req, res) => {
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

module.exports = {
    login, register, getUser,
    getStyle, 
    deletePost, createPost, updatePost, getRow,
    uploadImage, 
    updateUserProfile
}