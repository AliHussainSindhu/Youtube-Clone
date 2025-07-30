const mongoose = require('mongoose');


module.exports = async function(){
    

try{
    await mongoose.connect('mongodb://localhost:27017/project')

    console.log('Connected to Database...');
    }
    catch(err)
    {
        console.log('Could not connect to database',err)
    }
}