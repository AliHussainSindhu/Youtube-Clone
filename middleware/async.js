module.exports = function(handler)
{
    return async function (req,res,next) {
        try { 
            await handler(req,res);
        } catch (err) {
            next(err);
        }
    }
}