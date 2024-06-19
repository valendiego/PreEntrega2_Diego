
const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador
const { Controller } = require('../controller/products.controller');
const { verifyToken } = require('../middlewares/jwt.middleware');
const { isAdmin, isUser, isUserPremium } = require('../middlewares/auth.middleware');

// Ruta para obtener todos los produtos
router.get('/', (req, res) => new Controller().getProducts(req, res));

// Ruta para obtener un producto por su ID
router.get('/:pid', async (req, res) => new Controller().getProductById(req, res));

// Ruta para agregar producto al carrito
router.post('/:pid', verifyToken, isUser, async (req, res) => new Controller().addProductToCart(req, res));

// Ruta para agregar un nuevo producto
router.post('/', verifyToken, isUserPremium, async (req, res) => new Controller().addProduct(req, res));

// Ruta para actualizar un producto por su ID
router.put('/:pid', verifyToken, isAdmin, async (req, res) => new Controller().updateProduct(req, res));

// Ruta para eliminar un producto por su ID
router.delete('/:pid', verifyToken, isUserPremium, async (req, res) => new Controller().deleteProduct(req, res));

module.exports = router; // Exporta el enrutador
