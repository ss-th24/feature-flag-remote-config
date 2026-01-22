const AppError = require('../errors/AppError');

const centralErrorhandler = (err, req, res, next)=>{
    let statusCode = 500;
    let message = "Internal Server Error";

    if(err.name === "ZodError"){
        statusCode = 400;
        message = "Invalid Input Format";
    }

    if(err instanceof AppError || err.name === "AppError"){
        statusCode = err.statusCode || 500;
        message = err.message || message;
    }
    
    res.status(statusCode).json({message: message, err: err});
}


module.exports = centralErrorhandler;