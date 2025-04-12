const errorResponse = (res, statusCode, error, message) => {
    res.status(statusCode).json({ success: false, message, error });
};

module.exports= errorResponse
