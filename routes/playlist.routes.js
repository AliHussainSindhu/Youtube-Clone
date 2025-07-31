const express = require('express');
const router = express.Router();
const auth = require('../middleware/authenticate');
const playlistController = require('../controllers/playlist.controller');
const validate = require('../validator/validate.validator');
const playlistValidator = require('../validator/playlist.validator');

router.get('/:id' , auth ,playlistController.getPlayListDetail); //GET VIDEOS IN A PLAY-LIST AND OTHER DETAILS
router.post('/' , [auth , validate(playlistValidator)] , playlistController.makeNewPlaylist); //CREATE A NEW PLAYLIST
router.post('/videos/:id/:videoId' , auth, playlistController.addToAPlaylist);//ADD NEW VIDEO TO A PLAY-LIST
router.delete('/videos/:id/:videoId', auth, playlistController.deletVideoFromPlaylist)//DELETE VIDEO FROM PLAY-LIST
router.delete('/:id' , auth , playlistController.deletePlaylist);


module.exports = router;