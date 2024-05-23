const passport = require('passport');
const { Strategy } = require('passport-github2');
const { verifyToken } = require('../../utils/jwt');
const { clientID, clientSecret, callbackURL } = require('../github.private');
const UserManager = require('../../dao/mongo/daoUsers');

const githubStrategy = () => {

    passport.use('github', new Strategy({ clientID, clientSecret, callbackURL },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const { accessToken, user } = await new UserManager().githubLogin(profile);

                verifyToken({ cookies: { accessToken } }, null, (err) => {
                    if (err) {
                        return done(err);
                    }

                    return done(null, { accessToken, user }, { message: 'Authentication successful' });
                });
            } catch (e) {
                done(e);
            }
        }
    ));
}

module.exports = githubStrategy