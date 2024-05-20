const express = require('express');
const apiController = require('../controllers/apiController');
const apiRouter = express.Router();

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

// Định cấu hình Multer để tải ảnh lên
const upload = multer({ dest: 'uploads/',
        limits: {
            fileSize: 5 * 1024 * 1024 // no larger than 2mb
        } 
});

// Xử lý yêu cầu tải ảnh lên
apiRouter.post('/upload', upload.single('image'), apiController.uploadImage);

module.exports = apiRouter;