const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const videoController = require('../controllers/video.controller');
const upload = require('../middleware/multer');
const validate = require('../validator/validate.validator');
const videoValidator = require('../validator/video.validator');


router.get('/' , auth , videoController.getAllVideos);
router.post('/' , [auth , upload.single('video') , validate(videoValidator)] , videoController.uploadVideo);
router.get('/search' , auth , videoController.searchVideos);
router.get('/:id' ,auth , videoController.getSpecificVideo);
router.delete('/:id' ,auth , videoController.deleteVideo);
router.post('/likes/:id' , auth, videoController.likeAVideo);
router.post('/views/:id' , auth , videoController.viewOnAVideo);



module.exports = router;