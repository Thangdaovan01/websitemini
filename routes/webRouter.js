const express = require('express');
const webController = require('../controllers/webController');
const webRouter = express.Router();

webRouter.get('/', webController.getHomepage);
webRouter.get('/login-register', webController.getLoginPage);
// webRouter.get('/admin', webController.getAdminPage); 
webRouter.get('/user', webController.getUserPage);
webRouter.get('/document', webController.getDocument);
webRouter.get('/document/:id', webController.getDocumentFilename);

module.exports = webRouter; 