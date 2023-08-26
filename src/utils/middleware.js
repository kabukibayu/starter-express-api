
const jwt = require('jsonwebtoken');
const secretKey = 'Z25zTmEkR08j7DLoIVfPB9qzrNxwUph2c6KGQlFQy1X9sU7lIiVXv7noLJqPbQ79FEShq07yfZwDCsGTOTdZcPfN3hxqJ9nMvfQsvGZHRBvHQANMbNH29xwmyHVMz9UZ9';
const { createResponse } = require('../utils/response');

function generateJwtToken(payload, expiresInMinutes = 15) {
    const expiresIn = expiresInMinutes * 60; 
    const options = {
      expiresIn,
    };
    return jwt.sign(payload, secretKey, options);
}

function validateJwtToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        return createResponse(res, 401, {'message' : 'Unauthorized'});
    }
    if(token.split(' ')[0] != 'Bearer'){
        return createResponse(res, 403, {'message' : 'Forbidden'});
    }
      jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
        if (err) {
          return createResponse(res, 403, {'message' : 'Forbidden'});
        }
        req.user = decoded;
        next(); 
      });
}

module.exports = {generateJwtToken, validateJwtToken}