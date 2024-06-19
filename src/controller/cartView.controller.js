const { CartRepository } = require('../repository/carts.repository');

class Controller {

    #cartRepository

    constructor() {
        this.#cartRepository = new CartRepository();
    }

    async getCartById(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;


            const cartId = req.user.cart; // Obtiene el ID del carrito de los parámetros de la solicitud
            const cart = await this.#cartRepository.getCartById(cartId); // Obtiene el carrito por su ID

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

    async addProductToCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const user = req.user;
            const cart = await this.#cartRepository.addProductToCart(productId, cartId, user);
            req.logger.info('Producto agregado al carrito de manera correcta');
            res.redirect('/products');
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }
}

module.exports = { Controller };