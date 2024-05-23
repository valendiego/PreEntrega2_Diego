const { Router } = require('express');
const router = Router();
const cookieParser = require('cookie-parser');

router.use(cookieParser());

class Controller {
    constructor() { }

    index(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;

            if (isLoggedIn) {
                const cartId = req.user.cart
                res.render('sessionStart', {
                    titlePage: 'Login/Register',
                    isLoggedIn,
                    isNotLoggedIn: !isLoggedIn,
                    style: ['styles.css'],
                    cartId
                });
            } else {
                res.render('sessionStart', {
                    titlePage: 'Login/Register',
                    isLoggedIn,
                    isNotLoggedIn: !isLoggedIn,
                    style: ['styles.css'],
                });
            }
        } catch (e) {
            res.status(500).json({ error: e.messange });
        }
    }

    login(res) {
        try {
            res.render('login', {
                style: ['styles.css'],
                title: 'Login'
            });
        } catch (e) {
            res.status(500).json({ error: e.messange });
        }
    }

    register(res) {
        try {
            res.render('register', {
                style: ['styles.css'],
                title: 'Register'
            });
        } catch (e) {
            res.status(500).json({ error: e.messange });
        }
    }

    profile(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            if (isLoggedIn) {
                const cartId = req.user.cart
                const user = {
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    age: req.user.age,
                    email: req.user.email,
                    rol: req.user.rol,
                }

                res.render('profile', {
                    style: ['styles.css'],
                    titlePage: 'Perfil',
                    user: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        age: user.age,
                        email: user.email,
                        rol: user.rol
                    },
                    isLoggedIn,
                    cartId
                });
            } else {
                return res.status(403).json({ Error: 'Debe logearse para poder acceder.' })
            }
        } catch (err) {
            res.status(500).json({ Error: err.message })
        }
    }

    resetPassword(res) {
        try {
            res.render('reset_password', {
                titlePage: 'Reset Password',
                style: ['styles.css']
            });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }
}

module.exports = { Controller };