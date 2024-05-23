require('dotenv').config(); // Carga las variables de entorno desde .env
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');

const cookieExtractor = req => req && req.cookies ? req.cookies['accessToken'] : null;

const jwtStrategy = () => {

    passport.use('current', new Strategy({ secretOrKey: process.env.JWT_SECRET, jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]) },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (e) {
                done(e)
            }
        }
    ))
}

module.exports = jwtStrategy;