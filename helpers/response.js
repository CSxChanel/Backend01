// helper/response.js
const response = (
    res,
    statusCode,
    success,
    message,
    data = null,
    error = null
) => {
    res.status(statusCode).json({
        status: statusCode,
        success,
        message,
        data,
        error
    });
};

module.exports = response;
