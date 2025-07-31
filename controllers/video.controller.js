const Video = require('../models/video.model');
const fs = require('fs');
const asyncMiddleware = require('../middleware/async');

exports.getAllVideos = asyncMiddleware(async (req,res) => {


    //IMPLEMENTING PAGINATION MEANING THAT NOT THE ENTIRE VIDEOS IN THE DATABASE
    //WOULD BE SENT TO THE CLIENT IN ONE GO RATHER A LIMIT WOULD BE SET TO DISPLAY
    //THE VIDEOS BASED ON HOW MUCH THE USER WANTS TO SEE
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const videos = await Video.find()
                    .sort({views:1})
                    .skip(skip)
                    .limit(limit);
                    
    if(videos.length===0)return res.status(200).send([]);

    return res.status(200).send(videos);
})

exports.uploadVideo = asyncMiddleware(async (req,res) => {

    //ALL THIS PARSING OF BOTH FORM-DATA AND FILE-DATA DONE BY MULTER
    if(error)
    {
        if(req.file)
            fs.unlinkSync(req.file.path);
        return res.status(400).send(error.details[0].message);
    }

    const title = req.body.title;// THE NAME OF THE VIDEO SENT AS PART OF THE 
    const filePath = req.file.path; //THE PATH TO THE UPLOADED FILE 



    const video = new Video({
        userId : req.user._id,
        title : title,
        location : filePath
    });

    await video.save();


    res.status(200).json({success : true , message : 'Video uploaded successfully'});
})

exports.getSpecificVideo = asyncMiddleware(async (req,res) => {

    //FIRST CHECK IF THE VIDEO WITH GIVEN ID EXISTS OR NOT
    const video = await Video.findById(req.params.id);
    if(!video)return res.status(404).send('Video not found');

    const range = req.headers.range;
    if(!range)return res.status(400).send('Requires range headers');

    const filePath = video.location; //THE PATH TO OUR VIDEO
    const videoSize = fs.statSync(filePath).size; //TOTAL SIZE OF OUR VIDEO
    
    const CHUNK_SIZE = 10 ** 6 //SIZE OF ONE CHUNK SENT=1MB
    const start = Number(range.replace(/\D/g,'')); //REPLACE ALL NON-DIGITS WITH EMPTY STRING(A.K.A DELETE ALL NON-DIGITS)
    if (isNaN(start)) return res.status(400).send('Invalid range header');
    

    const end  = Math.min(start + CHUNK_SIZE,videoSize-1);

    const contentLength = end - start + 1;

    const headers = {
        'Content-Range' : `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges' : 'bytes',
        'Content-Length' : contentLength,
        'Content-Type' : 'video/mp4'
    }

    //WRITE TO THE HEADERS WITH THE STATUS CODE 206 MEANING PARTIAL CONTENT
    //THE HEADER WILL HAVE THE RANGE OF THE CONTENT AND THE TOTAL LENGTH OF THE CONTENT
    res.writeHead(206 , headers);
    //CREATE A STREAM A PIPE AND SEND DATA FROM THE GIVEN FILE TO THE CLIENT
    fs.createReadStream(filePath , {start,end}).pipe(res);

})

exports.deleteVideo = asyncMiddleware(async (req, res) => {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).send('Video not found.');

        if (req.user._id.toString() !== video.userId.toString())
            return res.status(401).send('Warning! You can only delete your own video.');


        if (video.location) {
            fs.unlink(video.location, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        await Video.findByIdAndDelete(req.params.id);
        res.status(200).send('Video successfully deleted.');
});


exports.likeAVideo = asyncMiddleware(async (req,res) => {

    const video = await Video.findById(req.params.id);
    if(!video)return res.status(404).send('Video not found');

    video.likes++;

    await video.save();
    res.status(200).json({success:true , likes : video.likes}); 
})


exports.viewOnAVideo = asyncMiddleware(async (req,res) => {

    const video = await Video.findById(req.params.id);
    if(!video)return res.status(404).send('Video not found');

    video.views++;

    await video.save();
    res.status(200).json({success:true , views:video.views});

})


exports.searchVideos = asyncMiddleware(async (req, res) => {
    const query = req.query.query;

    if (!query) return res.status(400).send('Search query missing');

    const videos = await Video.find({
        title: { $regex: query, $options: 'i' }
    });

    res.status(200).json({success:true , videos});
});