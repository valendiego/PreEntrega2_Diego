const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador
const { Controller } = require('../controller/products.controller');
const { verifyToken } = require('../utils/jwt');

// Ruta para obtener todos los produtos
router.get('/', (req, res) => new Controller().getProducts(req, res));

// Ruta para obtener un producto por su ID
router.get('/:pid', async (req, res) => new Controller().getProductsById(req, res));

// Ruta para agregar producto al carrito
router.post('/:pid', verifyToken, async (req, res) => new Controller().addProductToCart(req, res));

// Ruta para agregar un nuevo producto
router.post('/', async (req, res) => new Controller().addProduct(req, res));

// Ruta para actualizar un producto por su ID
router.put('/:pid', async (req, res) => new Controller().updateProduct(req, res));

// Ruta para eliminar un producto por su ID
router.delete('/:pid', async (req, res) => new Controller().deleteProduct(req, res));

module.exports = router; // Exporta el enrutador