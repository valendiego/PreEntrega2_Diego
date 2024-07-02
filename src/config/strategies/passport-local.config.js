const passport = require('passport');
const { Strategy } = require('passport-local');
const { UserRepository } = require('../../repository/user.repository');

const localStrategy = () => {
    passport.use('register', new Strategy({ passReqToCallback: true, usernameField: 'email', passwordField: 'password' },
        async (req, email, password, done) => {
            const { firstName, lastName } = req.body;
            try {
                const user = await new UserRepository().registerUser(firstName, lastName, email, password);
                done(null, user, { message: 'Registrado correctamente.' });
            } catch (error) {
                done(null, false, { message: error.message });
            }
        }
    ));

    passport.use('login', new Strategy({ usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await new UserRepository().loginUser(username, password);
                done(null, user, { message: 'Logueado correctamente.' })
            } catch (error) {
                done(null, false, { message: error.message });
            }
        }
    ))
}

module.exports = localStrategy