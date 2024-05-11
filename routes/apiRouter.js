const express = require('express');
const apiController = require('../controllers/apiController');
const apiRouter = express.Router();

//login logout
apiRouter.post('/login', apiController.login);
apiRouter.get('/style', apiController.getStyle); 
apiRouter.get('/user', apiController.getUser); 

apiRouter.post('/register', apiController.register);

apiRouter.get('/row', apiController.getRow);
apiRouter.post('/post', apiController.createPost);
apiRouter.put('/row', apiController.updateRow);
apiRouter.delete('/row', apiController.deleteRow);
// apiRouter.get('/authentication', apiController.authentication);

module.exports = apiRouter;