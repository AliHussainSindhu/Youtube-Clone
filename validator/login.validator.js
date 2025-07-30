const Joi = require('joi');

module.exports = function(credentials) {
    
    const schema = Joi.object({
        email : Joi.string().min(10).max(50).required().email(),
        password : Joi.string().required()
    });
    return schema.validate(credentials);

}