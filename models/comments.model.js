const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({

    userId : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true
    },
    videoId : {
            type : mongoose.Types.ObjectId,
            ref : 'Video',
            required : true
    },
    content : {
        type : String,
        required : true,
        minlength : 1,
        maxlength : 200
    },
    addedOn : {
        type : Date,
        default : Date.now()
    }
});

const Comment = mongoose.model('Comment' , commentsSchema);

module.exports = Comment;