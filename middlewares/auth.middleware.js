const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const pool = require('../config/db');

const JWTSECRETKEY = process.env.JWTSECRETKEY;

const authMiddleware = async(req, res, next) => {
    try{
    
        // input validation
    const header = req.headers.authorization;

    if(!header) throw new AppError("Empty Authorization Header", 401);
    
    const parts = header.split(" ");

    if(parts.length != 2 || parts[0] != "Bearer") throw new AppError("Invalid Authentication Format", 401);

    // jwt verification
    const payload = jwt.verify(parts[1], JWTSECRETKEY);
    
    // fetching permissions
    const permissions = await pool.query(
        `SELECT permissions
        FROM roles
        WHERE role_name = $1`,
        [payload.role]
    );
    req.user = {
        role : payload.role,
        permissions : permissions.rows[0].permissions
    };
    next();
    }
    catch(err){
        next(err);
    }
}


module.exports = authMiddleware;