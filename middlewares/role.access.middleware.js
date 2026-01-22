const AppError = require('../errors/AppError');

const roleAccessMiddleware = (page, action) => {
    return (req, res, next) => {
        const hasPermission = req.user.permissions[page][action];
        
        if(hasPermission) return next();
        return next(new AppError("Forbidden", 403));
    }
}

module.exports = roleAccessMiddleware;