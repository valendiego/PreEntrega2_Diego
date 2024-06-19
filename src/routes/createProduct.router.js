const { Router } = require('express');
const { verifyToken } = require('../middlewares/jwt.middleware');
const router = Router();
const { Controller } = require('../controller/addProductView.controller');
const { isUserPremium } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, isUserPremium, (req, res) => new Controller().viewForm(req, res));

router.post('/', verifyToken, isUserPremium, (req, res) => new Controller().addProduct(req, res));

module.exports = router;