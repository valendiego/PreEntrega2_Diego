const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    const isLoggedIn = ![null, undefined].includes(req.session.user);

    res.render('sessionStart', {
        titlePage: 'Login/Register',
        isLoggedIn,
        isNotLoggedIn: !isLoggedIn,
        style: ['styles.css']
    });
})

router.get('/login', (_, res) => {
    // TODO: agregar middleware, sólo se puede acceder si no está logueado
    res.render('login', {
        style: ['styles.css'],
        title: 'Login'
    });
});

router.get('/register', (_, res) => {
    // TODO: agregar middleware, sólo se puede acceder si no está logueado
    res.render('register', {
        style: ['styles.css'],
        title: 'Register'
    });
});

router.get('/profile', async (req, res) => {
    try {
        const isLoggedIn = ![null, undefined].includes(req.session.user);
        if (isLoggedIn) {
            const user = {
                firstName: req.session.user.firstName,
                lastName: req.session.user.lastName,
                age: req.session.user.age,
                email: req.session.user.email,
                rol: req.session.user.rol,
            }

            console.log('Edad desde el router: ', req.session.user);
            res.render('profile', {
                style: ['styles.css'],
                titlePage: 'Perfil',
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    age: user.age,
                    email: user.email,
                    rol: user.rol
                }, isLoggedIn

            });

        } else {
            return res.status(403).json({ Error: 'Debe logearse para poder acceder.' })
        }
    } catch (err) {
        res.status(500).json({ Error: err.message })
    }
});

router.get('/resetPassword', async (_, res) => {
    try {

        res.render('reset_password', {
            titlePage: 'Reset Password',
            style: ['styles.css']
        });
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
})

module.exports = router;