
const crypto = require('crypto');
const bcrypt  = require('bcrypt');


const generateToken = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
};

const isUUID = (input)=>  {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(input);
  }

async function hashPassword(password) {
    const saltRounds = 12; 
    return bcrypt.hash(password, saltRounds);
  }
  

async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = {generateToken, isUUID, hashPassword, comparePassword}