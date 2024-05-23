const daoCarts = require('../dao/mongo/daoCarts');

class Controller {
    constructor() { }

    async getCartById(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;

            const cartId = req.user.cart; // Obtiene el ID del carrito de los parámetros de la solicitud
            const cart = await new daoCarts().getCartById(cartId); // Obtiene el carrito por su ID

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
                isNotLoggedIn: !isLoggedIn,
                cartId: cartData.id
            }); // Responde con el carrito obtenido

        } catch (err) {
            res.status(500).json({ Error: err.message }); // Responde con un error 500 si hay un error al obtener el carrito
        }
    }
}

module.exports = { Controller };