module.exports = function (err,req,res,next) {
    
    console.log('Error : ' , err.message);
    res.status(500).json({status:false,message:'Something failed..'})
}