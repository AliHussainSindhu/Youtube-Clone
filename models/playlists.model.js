const { required } = require('joi');
const mongoose = require('mongoose');

const playListSchema = new mongoose.Schema({

    title : {
        type : String,
        required : true,
        minlength : 1,
        maxlength : 50
    },
    userId : {
            type : mongoose.Types.ObjectId,
            ref : 'User',
            required : true
    },
    videos : [{
        type : mongoose.Types.ObjectId,
        ref : 'Video',
        default : []
    }],
    createdOn : {
        type : Date,
        default : Date.now()
    }

});

const PlayList = mongoose.model('PlayList' , playListSchema);

module.exports = PlayList;