const appError = require('./../utils/appError')
// controllers/errorControllers.js


const handleCastError = (err) => {
    const message =  `Invalid database Id:${err.value}`
    return new appError(message , 400)
}


const handleDuplicateFieldError = err => {
    const message = `Document with this name:${err.keyValue.name} is already created`
    return new appError(message , 400)
}

const handleValidationError = err => {
    const message = err.message
    return new appError(message , 400)
}

const handleJsonWebTokenError = () => {
     return new appError('Invalid token please login with valid token', 401)
}

const handleTokenExpiredError = () => {
     return new appError('Invalid token expired, please login with valid token', 401)
}


const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err , res) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    else{
        console.log("ERROR" , err)
        res.status(err.statusCode).json({
            status: err.status,
            message: 'something went wrong'
        });
    }
}






module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);

    }
    else if(process.env.NODE_ENV === 'production'){
        if(err.name === 'CastError')  err = handleCastError(err)
        if(err.code === 11000)  err = handleDuplicateFieldError(err)
        if(err.name === 'ValidationError') err = handleValidationError(err)
        if(err.name === 'JsonWebTokenError') err  = handleJsonWebTokenError(err)
        if(err.name === 'TokenExpiredError') err = handleTokenExpiredError(err)

        sendErrorProd(err , res)


    }

}
