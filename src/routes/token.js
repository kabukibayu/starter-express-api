const postRouter = require('express').Router();
const { generateJwtToken} = require('../utils/middleware');
const { createResponse } = require('../utils/response');
const jwt = require('jsonwebtoken');

postRouter.get('', async (req, res) => {
    if (req.cookies){
        const token = req.cookies.token
        if (!token) return createResponse(res, 401, {'message' : 'Empty Token'});
        decoded = jwt.decode(token);
        delete decoded.exp;
        delete decoded.iat;
        console.log(decoded);
        return createResponse(res, 200, {message : generateJwtToken(decoded, expiresInMinutes = 15)});
    }
    else{
        return createResponse(res, 401, {'message' : 'Empty Token'});
    }
})

module.exports = postRouter;