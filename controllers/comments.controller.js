const Comment = require('../models/comments.model');
const User = require('../models/user.model');
//const Video = require('../models/video.model');
const commentValidator = require('../validator/comment.validator');

//THERE WILL BE A DROP-DOWN BUTTON UNDER THE 
exports.getVideoComments = async (req,res) => {

    const comments = await Comment.find({videoId : req.params.id})
    if(comments.length===0)return res.status(200).send([]);

    //NOW WE KNOW THAT WHEN DISPLAYING COMMENTS UNDER A VIDEO WE ALSO NEED
    //THE NAMES OF THE USERS WHO HAVE MADE A SPECIFIC COMMENT
    //SO ANOTHER QUERY TO MAP THE ARRAY INTO AN ARRAY WHERE WE HAVE NAMES IN PLACE OF ID'S

    const commentsWithNames = comments.map(async (comment) => {

        const userName  = await User.findById(comment.userId);
        return {user : userName, videoId : comment.videoId,content : comment.content,
            addedOn : comment.addedOn
        };
    })
    //I'LL SEND AN ARRAY OF COMMENTS ALONG WITH THEIR NAMES AND DATE ADDED TO THE CLIENT
    //AND THEY MAY USE HOWEVER THEY WANT
    res.status(200).json({success:true, commentsWithNames});
}


//THIS API WILL BE FETCHED WHEN THE USER WILL ADD COMMENT ON A VIDEO
exports.addCommentOnAVideo = async (req,res) => {

    const {error,value} = commentValidator(req.body);
    if(error)return res.send(error.details[0].message);

    //SINCE THIS API WILL BE CALLED WHEN STREAMING ON THE API 
    //GET /api/videos/:id SO THE COMMENT MUST BE MADE ON THE SAME VIDEO
    if(value.videoId!==req.params.id)return res.status(400);

    //THE USER ID WILL BE OF THE CURRENTLY LOGGED IN
    const comment = new Comment({
            userId : req.user._id,
            videoId : value.videoId,
            content : value.content
    });

    await comment.save();
    res.status(200).json({success:true,message:'Comment added'});
}

exports.deleteAComment = async (req,res) => {

    const comment = await Comment.findById(req.params.id);

    if(req.user._id!==comment.userId)return res.status(400).json({success:false,  message:'You can only delete your own comments'});

    await Comment.deleteOne({_id : comment._id});
    return res.status(200).json({success:true, message:'Comment deleted'});
    
}