const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },
    userId : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true,
        index : true
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
});

const PlayList = mongoose.model('PlayList' , playlistSchema);

module.exports = PlayList;