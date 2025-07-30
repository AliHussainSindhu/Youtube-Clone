const Joi = require('joi');

module.exports = function(user) {
    
    const schema = Joi.object({
        name : Joi.string().min(5).max(50).required(),
        email : Joi.string().min(10).max(50).required().email(),
        password : Joi.string().required()
    });

    return schema.validate(user);

}