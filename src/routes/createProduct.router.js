const { Router } = require('express');
const { verifyToken } = require('../utils/jwt');
const router = Router();
const { Controller } = require('../controller/addProductView.controller');

router.get('/', verifyToken, (req, res) => new Controller().viewForm(req, res));

router.post('/', (req, res) => new Controller().addProduct(req, res));

module.exports = router;