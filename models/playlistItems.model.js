const mongoose = require('mongoose');

const playlistItemSchema = new mongoose.Schema({
    playlistId : {
        type : mongoose.Types.ObjectId,
        ref : 'PlayList',
        required : true,
        index : true
    },
    videoId : {
        type : mongoose.Types.ObjectId,
        ref : 'Video',
        required : true
    },
    addedOn : {
        type : Date,
        default : Date.now(),
        index : true
    }
})


const PlayListItem = mongoose.model('PlayListItem' ,playlistItemSchema);

module.exports = PlayListItem;