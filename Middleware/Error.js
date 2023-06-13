const ErrorHandler = require("./../Utils/errorHandler")


module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500
  err.message = err.message || "Internal server error"


  //Wrong mongodb id////////////////////////////////////////////// 
  if (err.name === "CastError") {

    const message = `Resource not found, Invalid ${err.path}`
    err = new ErrorHandler(message, 404)

  }

  // Mongoose duplicate key error(this error basically means that user with this email already exsist in database)

  if (err.code === 11000) {

    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`

    err = new ErrorHandler(message, 404)
  }

  // Wrong JWT error

  if (err.code === "JsonWebTokenError") {

    const message = `Json web token invalid, try again`

    err = new ErrorHandler(message, 404)
  }

  //JWT has expired

  if (err.code === "TokenExpireError") {

    const message = `Json web token expired, try again`

    err = new ErrorHandler(message, 404)
  }

  //////////////////////////////////////////////////////////////

  res.status(err.statusCode).json({

    success: false,
    message: err.message,
    //err:err

  })


}