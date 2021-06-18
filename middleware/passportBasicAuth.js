const BasicStrategy = require('passport-http').BasicStrategy;
const keys = require('../keys')

module.exports = passport => {
    passport.use('auth_1C', new BasicStrategy(
        function (username, password, done) {           
            if(username === keys.LOGIN_API_USERS && password === keys.PASSWORD_API_USERS){
                done(null, {
                          user: keys.LOGIN_1C
                       })
            } else {
                done(null,false) 
            }           
        
        }
     ))
}