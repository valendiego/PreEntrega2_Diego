const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const { verifyToken } = require('../middlewares/jwt.middleware');
const router = Router(); // Crea un enrutador
const { Controller } = require('../controller/cartView.controller');
const { isUser } = require('../middlewares/auth.middleware');

// Ruta para obtener un carrito por su ID
router.get('/:cid', verifyToken, isUser, async (req, res) => new Controller().getCartById(req, res));

router.post('/:cid/products/:pid', verifyToken, isUser, async (req, res) => new Controller().addProductToCart(req, res));

router.delete('/:cid/product/:pid', verifyToken, isUser, async (req, res) => new Controller().deleteProductFromCart(req, res));

router.post('/:cid/purchase', verifyToken, isUser, async (req, res) => new Controller().generateTicket(req, res));

module.exports = router; // Exporta el enrutador