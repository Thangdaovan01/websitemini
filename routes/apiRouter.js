const express = require('express');
const apiController = require('../controllers/apiController');
const apiRouter = express.Router();
const {removeVietnameseTones, renameImageFile, renameDocumentFile} = require('../utils/util')
 
//login logout
apiRouter.get('/style', apiController.getStyle); //chưa dùng 
apiRouter.get('/user', apiController.getUser); 

apiRouter.post('/login', apiController.login);
apiRouter.post('/register', apiController.register);

apiRouter.get('/row', apiController.getRow);//chưa dùng 
apiRouter.post('/post', apiController.createPost);
apiRouter.put('/post', apiController.updatePost);
apiRouter.delete('/post', apiController.deletePost);
// apiRouter.get('/authentication', apiController.authentication);

apiRouter.put('/userprofile', apiController.updateUserProfile);

apiRouter.post('/like', apiController.createLike);
apiRouter.delete('/like', apiController.deleteLike);

apiRouter.post('/comment', apiController.createComment);
apiRouter.put('/comment', apiController.updateComment);
apiRouter.delete('/comment', apiController.deleteComment);

apiRouter.post('/friend', apiController.createFriend);
apiRouter.put('/friend', apiController.updateFriend);
apiRouter.delete('/friend', apiController.deleteFriend);


const multer = require('multer');

const storageImagePost = multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log("fileimage", file);
      cb(null, './uploads/postImg/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      const cleanName = renameImageFile(file.originalname); 
      cb(null,uniqueSuffix + '-' + cleanName);
    }
  })
  
const uploadImagePost = multer({ storage: storageImagePost })

const storageImageUser = multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log("fileimage", file);
      cb(null, './uploads/userImg/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      const cleanName = renameImageFile(file.originalname); 
      cb(null,uniqueSuffix + '-' + cleanName);
    }
  })
  
const uploadImageUser = multer({ storage: storageImageUser })


// Xử lý yêu cầu tải ảnh lên
apiRouter.post('/uploadPostImg', uploadImagePost.single('image'), apiController.uploadPostImg);
apiRouter.post('/uploadUserImg', uploadImageUser.single('image'), apiController.uploadUserImg);

module.exports = apiRouter;