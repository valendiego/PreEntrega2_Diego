const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const { verifyToken } = require('../utils/jwt');
const router = Router(); // Crea un enrutador
const { Controller } = require('../controller/cartView.controller');

// Ruta para obtener un carrito por su ID
router.get('/:cid', verifyToken, async (req, res) => new Controller().getCartById(req, res));

module.exports = router; // Exporta el enrutador