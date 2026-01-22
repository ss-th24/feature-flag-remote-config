class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}

module.exports = AppError;