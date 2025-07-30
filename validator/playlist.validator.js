const Joi = require('joi');

module.exports = function(playList) {

    const schema = Joi.object({
        title : Joi.string().min(1).max(50).required()
    });


    return schema.validate(playList);
}