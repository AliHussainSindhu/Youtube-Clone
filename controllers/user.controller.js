const validateUser = require('../validator/user.validator');
const validateLogin = require('../validator/login.validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Video = require('../models/video.model');
const PlayList = require('../models/playlists.model');
const Comment = require('../models/comments.model');
const config = require('config');


exports.registerUser = async (req,res) => {
    
    const {error,value} = validateUser(req.body);
    if(error)return res.status(400).send(error.details[0].message);

    //NOW CHECK IF EMAIL ALREADY REGISTERED
    const exists = await User.findOne({email : value.email});
    if(exists)return res.status(400).json({success:false , message:'Email already registered!Try another mail'});

    //AN OBJECT(DOCUMENT) BASED ON THE USER MODEL
    const user = new User({
        name : value.name,
        email : value.email,
        password : value.password
    });

    try{
    //NOW HASH THE PASSWORD USING BCRYPT AND SALT
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    res.status(200).json({success:true , message:'User successfully registered'});
    }
    catch(err)
    {
        res.status(500).send('Something went wrong');
    }
}


exports.loginUser = async (req,res) => {

    const {error,value} = validateLogin(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email : value.email});
    if(!user)return res.status(401).json({success:false , message : 'Invalid Email or password'});

    const validPassword = await bcrypt.compare(value.password, user.password);
    if(!validPassword)return res.status(401).json({success:false , message : 'Invalid email or password'});

    const token = user.generateAuthToken();
    res.header('x-auth-token' , token).status(200).json({success:true , message : 'Login Successful'});

}


exports.getUserData = async (req,res) => {

    const user = await User.findById(req.user._id)
    res.status(200).json({success : true , user : _.pick(user, ['name' , 'email' , '_id'])});
}


exports.getUserVideos = async (req,res) => {

    const videos = await Video.find({userId : req.user._id});
    if(videos.length === 0) return res.status(404).send([]);

    const cleanVideos = videos.map(video => _.omit(video.toObject(), ['__v', 'userId', 'location']));
    res.status(200).json({success:true, cleanVideos});
}


exports.getUserPlayLists = async (req,res) => {

    let playlists = await PlayList.find({userId : req.user._id});
    if(playlists.length===0)return res.status(404).send([]);


    const finalPlaylists = await Promise.all(playlists.map(async (playList) => {
    const videos = await Promise.all(playList.videos.map(async (id) => {
        const video = await Video.findById(id);
        return _.omit(video.toObject(), ['__v', 'userId', 'location']);
    }));
    playList = playList.toObject(); 
    playList.videos = videos;
    return playList;
}));

    res.status(200).json({success:true , playlist : finalPlaylists});
    
}


exports.deleteUser = async (req,res) => {


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
}


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User not found.');

  const token = jwt.sign(
    { _id: user._id },
    config.get('jwtPrivateKey'),
    { expiresIn: '15m' } 
  );

  const url = 'http://localhost:3000/api/users'

  const resetLink = `${url}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mariacooper1900@gmail.com',
      pass: 'vylz mxdx uqfq mbvi',
    },
  });

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
};


exports.resetPassword = async (req,res) => {

     const  token = req.query.token;
     const newPassword = req.body.newPassword;
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const user = await User.findById(decoded._id);

    if (!user) return res.status(400).send('Invalid user.');


    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword , salt);

    await user.save();

    res.send('Password has been reset successfully.');
  } catch (err) {
    res.status(400).send('Invalid or expired token.');
  }
    
}