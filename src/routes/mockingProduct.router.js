const { Router } = require('express');
const router = Router();
const { Controller } = require('../controller/products.controller');

router.get('/', (_, res) => new Controller().getMockingProducts(res));

module.exports = router;