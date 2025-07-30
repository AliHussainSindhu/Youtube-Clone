const express = require('express');
const app = express();
const config = require('config');
const users = require('./routes/user.routes');
const videos = require('./routes/videos.routes');
const comments = require('./routes/comments.routes');
const playlists = require('./routes/playlist.routes');
const connectToDatabase = require('./start/db');


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/users' , users);
app.use('/api/videos' , videos);
app.use('/api/comments' , comments);
app.use('/api/playlists' , playlists);


if(!config.get("jwtPrivateKey"))
{
    console.error('WARNING : FATAL ERROR! jwtPrivateKey not defined');
    process.exit(1);
}


//CONNECTING TO THE DATABASE
connectToDatabase();


const port = process.env.PORT || 3000;
app.listen(port , console.log(`Listening on port ${port}`));