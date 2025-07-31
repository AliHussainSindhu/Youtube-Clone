const Comment = require('../models/comments.model');
const asyncMiddleware = require('../middleware/async');


//THERE WILL BE A DROP-DOWN BUTTON UNDER THE 
exports.getVideoComments = asyncMiddleware(async (req,res) => {

    const comments = await Comment.find({videoId : req.params.id})
                                 .populate({
                                    path : 'userId',
                                    select : 'name'
                                 })
                                 .select('-videoId');
    if(comments.length===0)return res.status(200).send([]);

    //NOW WE KNOW THAT WHEN DISPLAYING COMMENTS UNDER A VIDEO WE ALSO NEED
    //THE NAMES OF THE USERS WHO HAVE MADE A SPECIFIC COMMENT
    //SO ANOTHER QUERY TO MAP THE ARRAY INTO AN ARRAY WHERE WE HAVE NAMES IN PLACE OF ID'S

    //CHANGE THIS WITH A SIMPLE POPULATE TO POPULATE THE 'userId' NAME 
    //I'LL SEND AN ARRAY OF COMMENTS ALONG WITH THEIR NAMES AND DATE ADDED TO THE CLIENT
    //AND THEY MAY USE HOWEVER THEY WANT
    res.status(200).json({success:true, comments});
})


//THIS API WILL BE FETCHED WHEN THE USER WILL ADD COMMENT ON A VIDEO
exports.addCommentOnAVideo = asyncMiddleware(async (req,res) => {

    //SINCE THIS API WILL BE CALLED WHEN STREAMING ON THE API 
    //GET /api/videos/:id SO THE COMMENT MUST BE MADE ON THE SAME VIDEO
    //if(value.videoId!==req.params.id)return res.status(400);

    //THE COMMENT BEING MADE ON THE VIDEO THE ID OF THAT VIDEO TO BE SUPPLIED IN THE
    //'params' PROPERTY OF THE REQUEST AND TO BE SUPPLIED BY THE CLIENT IN THE PARAMETER
    //OF THE REQUEST WHEN THE CLIENT/FRONT-END FETCHES THAT API

    //THE USER ID WILL BE OF THE CURRENTLY LOGGED IN
    const comment = new Comment({
            userId : req.user._id,
            videoId : req.params.id,
            content : req.body.content
    });

    await comment.save();
    res.status(200).json({success:true,message:'Comment added'});
})

exports.deleteAComment = asyncMiddleware(async (req,res) => {

    const comment = await Comment.findById(req.params.id);

    if(req.user._id!==comment.userId)return res.status(400).json({success:false,  message:'You can only delete your own comments'});

    await Comment.deleteOne({_id : comment._id});
    return res.status(200).json({success:true, message:'Comment deleted'});
    
})