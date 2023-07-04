const ErrorHandler = require('../utils/errorhandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.code = err.code || 500;
  err.message = err.message || 'Internal Server Error';

  //wrong mongodb id error

  if (err.name == 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //mongoose duplicate key error

  if (err.code == 11000 || err.statusCode == 11000) {
    let message = err.keyValue
      ? `Duplicate ${Object.keys(err.keyValue)} Entered`
      : `Duplicate property entered`;
    err = new ErrorHandler(message, 400);
  }

  //Wrong JWT error
  if (err.name == 'JsonWebTokenError') {
    const message = `Json Web Token is invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  //JWT Expire Error
  if (err.name == 'TokenExpiredError') {
    const message = `Json Web Token is Expired, try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
