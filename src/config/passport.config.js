const passport = require('passport');
const UserManager = require('../dao/mongo/daoUsers');
const { localStrategy, githubStrategy, jwtStrategy } = require('./strategies');

const initializeStrategy = () => {

    localStrategy();
    githubStrategy();
    jwtStrategy();

    passport.serializeUser((user, done) => {
        console.log('Serailized: ', user);
        done(null, user._id);
    })

    passport.deserializeUser(async (id, done) => {
        console.log('Deserialized: ', id)
        const user = await new UserManager().getUser(id);
        done(null, user)
    })
}

module.exports = initializeStrategy;