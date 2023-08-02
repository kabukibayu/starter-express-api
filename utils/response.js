const { STATUS_CODES } = require('http');

const createResponse = (res, statusCode, data) => {
    return res.status(statusCode).json({
        code: statusCode,
        status: STATUS_CODES[statusCode],
        ...(statusCode >= 200 && statusCode < 300 ? { message: data } : { errors: data })
    });
};

module.exports = { createResponse }