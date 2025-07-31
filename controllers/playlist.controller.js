const PlayList = require('../models/playlists.model');
const PlayListItem = require('../models/playlistItems.model');
const Video = require('../models/video.model');
const asyncMiddleware = require('../middleware/async');

//TO MAKE A NEW PLAY-LIST
exports.makeNewPlayList = asyncMiddleware(async (req,res) => {

    const playlist = new PlayList({
        title : req.body.title,
        userId : req.user._id
    });

    await playlist.save();
    res.status(200).json({success:true,message:'New playlist successfully created'});
})

//TO GET THE DETAILS OF A SPECIFIC PLAYLIST
exports.getPlayListDetail = asyncMiddleware(async (req,res) => {



    //FIRST FETCH THE RELEVANT DETAILS OF THAT PLAY-LIST
    const playlist = await PlayList.findById(req.params.id);
    if(!playlist)return res.status(404).send([]);

    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;
    const searchOrder = req.query.sort === 'asc' ? 1 : -1

    //NOW FETCH ALL THE VIDEOS BELONGING TO THAT PLAY-LIST
    const items = await PlayListItem.find({playlistId : playlist._id})
                                    .sort({addedOn : searchOrder})
                                    .skip((page - 1) * limit)
                                    .limit(limit)
                                    .populate({
                                        path : 'videoId',
                                        select : '-__v -location -userId'
                                    })
                                    .select('-playListId -__v -_id')
    
    //NOW TO DISPLAY AT THE FRONT-END THE TOTAL PAGES WE HAVE AS WELL AS THE PAGE WE ARE CURRENTLY ON
    const total = await PlayListItem.countDocuments({playlistId:playlist._id});
    const totalPages = Math.ceil(total/limit);

    res.status(200).json({success : true , videos : items , total , totalPages , count : limit});

})


//TO ADD A NEW VIDEO TO A PLAY-LIST
exports.addToAPlaylist = asyncMiddleware(async function (req,res) {

    const playlist = await PlayList.findById(req.params.id);
    if(!playlist)return res.status(404).json({success : false, message:'PlayList not found'});

    if(playlist.userId!==req.user._id)return res.status(401).json({success:false,message:'You can only add to your own play-list'});

    const video = await Video.findById(req.params.videoId);
    if(!video)return res.status(404).json({success:false , message:'No such video exists'});

    const playlistItem = new PlayListItem({
        playlistId : playlist._id,
        videoId : video._id
    });

    await playlistItem.save();
    res.status(200).json({success:true , message:'Video successfully added'});
    
})

//TO DELETE A VIDEO FROM PLAYLIST
exports.deletVideoFromPlaylist = asyncMiddleware(async (req,res) => {

    const playlist = await PlayList.findById(req.params.id);
    if(!playlist)return res.status(404).json({success:false,message:'No such playlist exists'});

    //VALIDATING IF THE USER IS DELETING FROM HIS OWN PLAYLIST OR NOT
    if(playlist.userId!==req.user._id)return res.status(400).json({success:false , message : 'You can only delete videos from your play-list'});

    const video = await Video.findById(req.params.videoId);
    if(!video)return res.status(404).json({success:false,message:'No such video exists'});

    await PlayListItem.deleteOne({playlistId : playlist._id , videoId : video._id});
    res.status(200).json({success:true , message:'Video successfully deleted'});
})

//TO DELETE AN ENTIRE PLAY-LIST
exports.deletePlaylist = asyncMiddleware(async (req,res) => {

    const playlist = await PlayList.findById(req.params.id);
    if(!playlist)return res.status(404).json({success:false, message : 'No such playlist exists'});

    if(playlist.userId!==req.user._id)return res.status(400).json({success:false , message:'You can only delete your own videos'});

    await PlayList.deleteOne({_id:req.params.id});
    res.status(200).json({success:true,message:'Video successfully deleted from play-list'});
    
})
