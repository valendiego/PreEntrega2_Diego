require('dotenv').config(); // Carga las variables de entorno desde .env
const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador
const passport = require('passport');
const { Controller } = require('../controller/sessions.controller');

router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister', session: false }), (_, res) => new Controller().redirect(res));

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin', session: false }), async (req, res) => new Controller().login(req, res));

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => new Controller().current(req, res));

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/githubcallback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), (req, res) => new Controller().githubCb(req, res));

router.post('/resetPassword', passport.authenticate('resetPassword', { failureRedirect: '/api/sessions/failogin' }), async (_, res) => new Controller().redirect(res));

router.get('/logout', (_, res) => new Controller().logout(res));

router.get('/failregister', (_, res) => new Controller().logError(res));

router.get('/faillogin', (_, res) => new Controller().logError(res));

router.delete('/', (req, res) => new Controller().deleteUser(req, res));

module.exports = router;