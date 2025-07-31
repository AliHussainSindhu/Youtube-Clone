const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Video = require('../models/video.model');
const PlayList = require('../models/playlists.model');
const Comment = require('../models/comments.model');
const asyncMiddleware = require('../middleware/async');
const transporter = require('../services/mailer.service');


exports.registerUser = asyncMiddleware(async (req,res) => {

    //NOW CHECK IF EMAIL ALREADY REGISTERED
    const exists = await User.findOne({email : req.body.email});
    if(exists)return res.status(400).json({success:false , message:'Email already registered!Try another mail'});

    //AN OBJECT(DOCUMENT) BASED ON THE USER MODEL
    const user = new User({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password
    });

    //NOW HASH THE PASSWORD USING BCRYPT AND SALT
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    res.status(200).json({success:true , message:'User successfully registered'});
})


exports.loginUser = asyncMiddleware(async (req,res) => {

    const user = await User.findOne({email : req.body.email});
    if(!user)return res.status(401).json({success:false , message : 'Invalid Email or password'});

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword)return res.status(401).json({success:false , message : 'Invalid email or password'});

    const token = user.generateAuthToken();
    res.header('x-auth-token' , token).status(200).json({success:true , message : 'Login Successful'});

})


exports.getUserData = asyncMiddleware(async (req,res) => {

    const user = await User.findById(req.user._id)
                            .select('-password -__v')
    res.status(200).json({success : true , user});
})


exports.getUserVideos = asyncMiddleware(async (req,res) => {

    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;
    const sortOrder = req.query.sort === 'asc' ? 1 : -1

    const videos = await Video.find({userId : req.user._id})
                                .sort({createdOn : sortOrder})
                                .skip((page - 1) * limit)
                                .limit(limit)
                              .select('-__v -userId -location')


    if(videos.length === 0) return res.status(404).send([]);

    const totalVideos = await Video.countDocuments({userId:req.user._id});
    const totalPages = Math.ceil(totalVideos/limit);


    res.status(200).json({success:true, videos , totalVideos, totalPages , count : limit});
})


exports.getUserPlayLists =asyncMiddleware( async (req,res) => {

    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;
    const sortOrder = req.query.sort === 'asc' ? 1 : -1

    let playlists = await PlayList.find({userId : req.user._id})
                                  .sort({createdAt : sortOrder})
                                  .skip((page - 1) * limit)
                                  .limit(limit)
                                  .select('-userId');

    if(playlists.length===0)return res.status(404).send([]);

    const totalPlaylists = await PlayList.countDocuments({userId : req.user._id});
    const totalPages = Math.ceil(totalPlaylists/limit);


    res.status(200).json({success:true , playlists , totalPlaylists , totalPages , count : limit});
})


exports.deleteUser = asyncMiddleware(async (req,res) => {


    const session = await mongoose.startSession();


    try{

    await session.withTransaction(async() => {

    const user = await User.findByIdAndDelete(req.user._id);

    //NOW DELETE ALL THE VIDEOS, PLAYLISTS AND COMMENTS OF THE DELETED USER
    await Video.deleteMany({userId : user._id},{session});
    await PlayList.deleteMany({userId:user._id},{session});
    await Comment.deleteMany({userId:user._id}, {session});
    res.status(200).send('User successfully deleted');
    })
}
    finally{
        await session.endSession();
    }
})


exports.forgotPassword = asyncMiddleware(async (req, res) => {

  const user = await User.findOne({ email : req.body.email });
  if (!user) return res.status(400).send('User not found.');

  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: '15m' } 
  );

  const url = 'http://localhost:3000/api/users'

  const resetLink = `${url}/reset-password?token=${token}`;

  const mailOptions = {
    from: 'mariacooper1900@getMaxListeners.com',
    to: email,
    subject: 'Reset Your Password',
    html: `<p>Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>This link expires in 15 minutes.</p>`
  };

  await transporter.sendMail(mailOptions);
  res.send('Password reset email sent.');
});


exports.resetPassword = asyncMiddleware(async (req,res) => {

     const  token = req.query.token;
     const newPassword = req.body.newPassword;

    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    const user = await User.findById(decoded._id);

    if (!user) return res.status(400).send('Invalid user.');


    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword , salt);

    await user.save();

    res.send('Password has been reset successfully.');
    
})