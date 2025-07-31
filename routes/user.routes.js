const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate')
const validate = require('../validator/validate.validator');
const userValidator = require('../validator/user.validator');
const userController = require('../controllers/user.controller');
const loginValidator = require('../validator/login.validator');

router.post('/register' ,validate(userValidator) , userController.registerUser);
router.post('/logins' , validate(loginValidator), userController.loginUser);
router.get('/me' , auth , userController.getUserData);
router.get('/me/videos' , auth , userController.getUserVideos);
router.get('/me/playlists',auth,userController.getUserPlayLists);
router.delete('/me/delete' , auth , userController.deleteUser);
router.post('/forgot-password' , userController.forgotPassword);
router.post('/reset-password' , userController.resetPassword);


module.exports = router;
