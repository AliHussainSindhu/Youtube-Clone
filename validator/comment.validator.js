const Joi = require('joi');


module.exports = function () {

    const schema = Joi.object({
        content : Joi.string().min(1).max(200).required()
        });

    return schema.validate(req.body);
}