const Joi = require('joi');


module.exports = function (comment) {

    const schema = Joi.object({
        videoId : Joi.string().required().custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                            return helpers.error("any.invalid");
                        }
                    return value;
                }, 'ObjectId validation'),
        content : Joi.string().min(1).max(200).required()
        });

    return schema.validate(comment);
}