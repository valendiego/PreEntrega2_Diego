const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const { verifyToken } = require('../middlewares/jwt.middleware');
const router = Router(); // Crea un enrutador
const { Controller } = require('../controller/productsView.controller');
const { isAdmin, isUser, isUserPremium } = require('../middlewares/auth.middleware');

// Ruta para obtener todos los productos
router.get('/', verifyToken, (req, res) => new Controller().getProducts(req, res));

// Ruta para obtener un producto por su ID
router.get('/:pid', verifyToken, (req, res) => new Controller().getProductById(req, res));

// Ruta para agregar producto al carrito
router.post('/:pid', verifyToken, isUser, (req, res) => new Controller().addProductToCart(req, res));

// Ruta para agregar un nuevo producto
router.post('/', verifyToken, isUserPremium, async (req, res) => new Controller().addProduct(req, res));

module.exports = router; // Exporta el enrutador