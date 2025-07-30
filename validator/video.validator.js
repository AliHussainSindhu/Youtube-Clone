const Joi = require('joi');


module.exports = function(video) {
    
    const schema = Joi.object({
        title : Joi.string().min(4).max(100).required()
    });

    return schema.validate(video);
}