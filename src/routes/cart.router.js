const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador

// Ruta para obtener todos los carritos
router.get('/', async (req, res) => {
    try {
        const isLoggedIn = ![null, undefined].includes(req.session.user);
        const cartManager = req.app.get('cartManager');
        const carts = await cartManager.getCarts(); // Obtiene todos los carritos

        const cartsData = carts.map(c => ({
            id: c.id,
            quantity: c.products.length
        }))

        res.status(200).render('carts', {
            carts: cartsData,
            titlePage: 'Carritos',
            style: ['styles.css'],
            isLoggedIn,
            isNotLoggedIn: !isLoggedIn
        }); // Responde con los carritos obtenidos
    } catch {
        res.status(500).json({ error: 'No se pudo conectar con los carritos' }); // Responde con un error 500 si hay un error al obtener los carritos
    }
});

// Ruta para obtener un carrito por su ID
router.get('/:cid', async (req, res) => {
    try {
        const isLoggedIn = ![null, undefined].includes(req.session.user);
        const cartId = req.params.cid; // Obtiene el ID del carrito de los parámetros de la solicitud
        const cartManager = req.app.get('cartManager');
        const cart = await cartManager.getCartById(cartId); // Obtiene el carrito por su ID

        const cartData = {
            id: cart.id,
            products: cart.products.map(p => ({
                productId: p.product.id,
                title: p.product.title,
                code: p.product.code,
                quantity: p.quantity
            }))
        };

        res.status(200).render('cart', {
            cart: cartData,
            titlePage: 'Carrito',
            style: ['styles.css'],
            isLoggedIn,
            isNotLoggedIn: !isLoggedIn
        }); // Responde con el carrito obtenido

    } catch (err) {
        res.status(500).json({ Error: err.message }); // Responde con un error 500 si hay un error al obtener el carrito
    }
});

// Ruta para agregar un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const cartManager = req.app.get('cartManager');
        const cart = await cartManager.addCart(); // Agrega un nuevo carrito
        res.status(200).json({ message: 'Carrito creado con éxito', cart }); // Responde con un mensaje de éxito y el carrito agregado
    } catch {
        res.status(500).json({ error: 'No se pudo crear el carrito' }); // Responde con un error 500 si hay un error al agregar el carrito
    }
});

// Ruta para agregar un producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid; // Obtiene el ID del carrito de los parámetros de la solicitud
        const productId = req.params.pid; // Obtiene el ID del producto de los parámetros de la solicitud
        const cartManager = req.app.get('cartManager');
        const updatedCart = await cartManager.addProductToCart(productId, cartId); // Agrega el producto al carrito
        res.status(200).json(updatedCart); // Responde con el carrito actualizado
    } catch (error) {
        console.error(error);
        res.status(500).json({ Error: error.message }); // Responde con un error 500 si hay un error al agregar el producto al carrito
    }
});

// Ruta para agregar o actualizar productos del carrito
router.put('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid; // Obtiene el ID del carrito de los parámetros de la solicitud
        const products = req.body;
        const cartManager = req.app.get('cartManager');
        await cartManager.updateCart(cartId, products);
        res.status(200).json({ message: 'Carrito actualizado correctamente.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Ruta para eliminar un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid; // Obtiene el ID del carrito de los parámetros de la solicitud
        const productId = req.params.pid; // Obtiene el ID del producto de los parámetros de la solicitud
        const cartManager = req.app.get('cartManager');
        await cartManager.deleteProductFromCart(productId, cartId);
        res.status(301).redirect('/api/cart')
    } catch (err) {
        res.status(500).json({ Error: err.message })
    }
});

// Ruta para atualizar la cantidad de un producto en el carrito
router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid; // Obtiene el ID del carrito de los parámetros de la solicitud
        const productId = req.params.pid; // Obtiene el ID del producto de los parámetros de la solicitud
        const { quantity } = req.body;
        const cartManager = req.app.get('cartManager');
        await cartManager.updateProductQuantityFromCart(productId, cartId, quantity);
        res.status(301).redirect('/api/cart');
    } catch (err) {
        res.status(500).json({ Error: err.message })
    }
});

// Ruta para vacial el carrito
router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cartManager = req.app.get('cartManager');
        await cartManager.clearCart(cartId);
        res.status(301).redirect('/api/cart');
    } catch (err) {
        res.status(500).json({ Error: err.message })
    }
})

module.exports = router; // Exporta el enrutador