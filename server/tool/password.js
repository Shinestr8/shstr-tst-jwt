let crypto = require('crypto');

function getSalt(length) {
    console.log("getSalt");
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
   }
   return result;
}

function encrypt(password, secret) {
     let result = [];
     let salt = getSalt(32);
     password = password + salt + secret;
     password = crypto.createHash('sha256').update(password).digest('hex');
     console.log(salt, " ", password);
     return [salt, password];
}

function check(password, salt,secret, hash){
    const salted = password + salt + secret;
    const newHash = crypto.createHash('sha256').update(salted).digest('hex');
    if(hash === newHash){
        return true
    }
    return false
}

exports.encrypt = encrypt;
exports.check = check;