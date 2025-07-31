const jwt = require('jsonwebtoken');

module.exports = function (req,res,next) {

    const token = req.header('x-auth-token');
    if(!token)return res.status(401).send('Access not provided');



    const decode = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decode;
    next();
}