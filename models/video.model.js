const { required } = require('joi');
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    userId : {
            type : mongoose.Types.ObjectId,
            ref : 'User',
            required : true 
    },
    title : {
        type : String,
        required : true,
        minlength : 4,
        maxlength : 100
    },
    likes : {
        type : Number,
        default : 0
    },
    views : {
        type : Number,
        default : 0
    },
    location : {
        type : String,
        required : true
    },
    createdOn : {
        type : Date,
        default : Date.now()
    }

});

const Video = mongoose.model('Video' , videoSchema);

module.exports = Video;