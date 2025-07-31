module.exports = function validate(validatorFn)
{
    return function (req,res,next){
        const {error} = validatorFn(req.body);
        if(error)return res.status(400).send(error.details[0].message);
        next();
    }
}