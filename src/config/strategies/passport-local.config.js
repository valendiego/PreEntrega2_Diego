const passport = require('passport');
const { Strategy } = require('passport-local');
const UserManager = require('../../dao/mongo/daoUsers');

const localStrategy = () => {
    passport.use('register', new Strategy({ passReqToCallback: true, usernameField: 'email', passwordField: 'password' },
        async (req, email, password, done) => {
            const { firstName, lastName} = req.body;
            try {
                const user = await new UserManager().registerUser(firstName, lastName, email, password);
                done(null, user, { message: 'Registrado correctamente.' });
            } catch (error) {
                done(error);
            }
        }
    ));

    passport.use('login', new Strategy({ usernameField: 'email' },
        async (username, password, done) => {
            try {
                const user = await new UserManager().loginUser(username, password);
                done(null, user, { message: 'Logueado correctamente.' })
            } catch (e) {
                done(e)
            }
        }
    ))

    passport.use('resetPassword', new Strategy({ usernameField: 'email' },
        async (username, password, done) => {
            try {
                const userUpdated = await new UserManager().resetPassword(username, password);
                done(null, userUpdated, { message: 'Contraseña actualizada.' })
            } catch (e) {
                done(e)
            }
        }
    ))
}

module.exports = localStrategy