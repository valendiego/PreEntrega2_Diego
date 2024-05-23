const { Router } = require('express');
const router = Router();
const { Controller } = require('../controller/sessionsView.controller');
const { verifyToken } = require('../utils/jwt');

router.get('/', verifyToken, (req, res) => new Controller().index(req, res));

router.get('/login', (_, res) => new Controller().login(res));

router.get('/register', (_, res) => new Controller().register(res));

router.get('/profile', verifyToken, (req, res) => new Controller().profile(req, res));

router.get('/resetPassword', (_, res) => new Controller().resetPassword(res))

module.exports = router;