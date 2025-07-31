const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const commentController = require('../controllers/comments.controller');
const validate = require('../validator/validate.validator');
const commentValidator = require('../validator/comment.validator');

router.get('/video/:id' , auth , commentController.getVideoComments);
router.post('/video/:id' ,[auth , validate(commentValidator)], commentController.addCommentOnAVideo);
router.delete('/:id' , auth , commentController.deleteAComment);

module.exports = router;