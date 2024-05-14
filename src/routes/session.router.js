const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador
const passport = require('passport');

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }), async (req, res) => {
    try {
        req.session.user = { email: req.user.email, _id: req.user._id.toString(), rol: req.user.rol, firstName: req.user.firstName, lastName: req.user.lastName, cart: req.user.cart}
        res.redirect('/');
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = { email: req.user.email, _id: req.user._id.toString(), rol: req.user.rol, firstName: req.user.firstName, lastName: req.user.lastName, cart: req.user.cart}
    res.redirect('/');
})

router.get('/faillogin', (_, res) => {
    res.send('Hubo un error de logeo.');
})

router.post('/resetPassword', passport.authenticate('resetPass', { failureRedirect: '/api/sessions/failogin' }), async (_, res) => {
    try {
        res.redirect('/');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(_ => {
        res.redirect('/');
    })
})

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), (req, res) => {
    console.log('Usuario:', req.body);
    res.redirect('/');
});

router.get('/failregister', (_, res) => {
    res.send('Hubo un error de registro.');
})

router.get('/faillogin', (_, res) => {
    res.send('Hubo un error de logeo.');
})

module.exports = router;