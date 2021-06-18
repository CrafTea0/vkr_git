const keys = require('../keys')
const User = require('../models/user')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.JWT
}

module.exports = passport => {
    passport.use('auth_JWT', new JwtStrategy(options, async (payload, done) => {

        try {
            user_db = await User.findByPk(payload.id)
            if (user_db) {
                const user = { ...user_db.dataValues }
                if (user.email === payload.email && user.id_partner === payload.id_partner) {
                    done(null, user)
                } else {
                    //email или id партнера не совпадают
                    done(null, false)
                }
            } else {
                //не найден с таким id 
                done(null, false)
            }
        } catch (e) {
            console.log('Ошибка при выполнении команды findByPk по id=' + payload.id + '. Описание ошибки:' + e)
        }

    })
    )
}