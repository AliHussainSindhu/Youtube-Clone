const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config= require('config');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 50
    },
    email : {

        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
});


userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id : this._id} , config.get('jwtPrivateKey') , {expiresIn : '1h'});
    return token;
}

const User = mongoose.model('User' , userSchema);

module.exports = User;