const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const commentController = require('../controllers/comments.controller');

router.get('/video/:id' , auth , commentController.getVideoComments);
router.post('/video/:id' ,auth, commentController.addCommentOnAVideo);
router.delete('/:id' , auth , commentController.deleteAComment);

module.exports = router;