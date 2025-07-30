const PlayList = require('../models/playlists.model');
const Video = require('../models/video.model');
const playlistValidator = require('../validator/playlist.validator');

//TO MAKE A NEW PLAY-LIST
exports.makeNewPlaylist = async (req,res) => {

    const {error,value} = playlistValidator(req.body);
    if(error)return res.status(400).send(error.details[0].message);

    const playList = new PlayList({
        title : value.title,
        userId : req.user._id
    });

    await playList.save();
    res.status(200).json({success : true, message:'Playlist created successfully'})
}

//TO GET THE DETAILS OF A SPECIFIC PLAYLIST
exports.getPlayListDetail = async (req,res) => {

    const playlist = await PlayList.findById(req.params.id);
    if(!playlist)return res.status(404).json({success : false , message : 'Playlist not found'});

    playlist.videos = playlist.videos.map(async (videoId) => {

        const video = await Video.findById(videoId);
        return {_id : video._id,
            title:video.title,
            userId : video.userId,
            createdOn : video.createdOn
        };
    })

    res.status(200).json({success : true,  playlist});
}


//TO ADD A NEW VIDEO TO A PLAY-LIST
exports.addToAPlaylist = async function (req,res) {

    const playlist = await PlayList.findById(req.params.id);
    if(!playlist)return res.status(404).json({success:false,message:'Playlist not found'});

    if(playlist.userId!==req.user._id)return res.status(404).json({success:false,message:'You can only add to your own playlist'})

    const videoId = await Video.findById(req.body.videoId);
    if(!videoId)return res.status(404).json({success:false,message:'No such video exists'});

    playlist.videos.push(req.body.videoId);
    await playlist.save();
    res.status(200).json({success:true,message:'Video added to playlist'});
    
}

//TO DELETE A VIDEO FROM PLAYLIST
exports.deletVideoFromPlaylist = async (req,res) => {

    const playlist = await PlayList.findById(req.params.id);
    if(!playlist)return res.status(404).json({success:false,message:'No such playlist exists'});

    if(playlist.userId!==req.user._id)return res.status(400).json({success:false , message : 'You can only delete videos from your play-list'});

    const index = playlist.videos.findIndex((videoId) =>  videoId===req.body.videoId);
    if(index===-1)return res.status(404).json({success:false,message:'No video found'});

    playlist.videos.splice(index,1);
    await playlist.save();
    res.status(200).json({success:true,message:'Video successfully deleted'});
}

//TO DELETE AN ENTIRE PLAY-LIST
exports.deletePlaylist = async (req,res) => {

    const playlist = await PlayList.findById(req.params.id);
    if(!playlist)return res.status(404).json({success:false, message : 'No such playlist exists'});

    if(playlist.userId!==req.user._id)return res.status(400).json({success:false , message:'You can only delete your own videos'});

    await PlayList.deleteOne({_id:req.params.id});
    res.status(200).json({success:true,message:'Video successfully deleted from play-list'});
    
}
