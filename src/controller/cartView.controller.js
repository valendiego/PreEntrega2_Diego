const { CartRepository } = require('../repository/carts.repository');
const { TicketRepository } = require('../repository/ticket.repository');

class Controller {

    #cartRepository
    #ticketRepository

    constructor() {
        this.#cartRepository = new CartRepository();
        this.#ticketRepository = new TicketRepository();
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

            const showButton = cartData.products.length !== 0;

            res.status(200).render('cart', {
                cart: cartData,
                titlePage: 'Carrito',
                style: ['styles.css'],
                script: ['scripts.js'],
                isLoggedIn,
                isNotLoggedIn: !isLoggedIn,
                cartId: cartData.id,
                showButton
            }); // Responde con el carrito obtenido

        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async addProductToCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const user = req.user;
            await this.#cartRepository.addProductToCart(productId, cartId, user);
            req.logger.info('Producto agregado al carrito de manera correcta');
            res.redirect('/products');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async deleteProductFromCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid
            await this.#cartRepository.deleteProductFromCart(productId, cartId);
            req.logger.info('Producto eliminado del carrito.');
            res.status(200).redirect(`/cart/${cartId}`);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async generateTicket(req, res) {
        try {
            const { cid } = req.params;
            const userEmail = req.user.email;
            const { code, amount, purchase_datetime, purchaser } = await this.#ticketRepository.generateTicket(cid, userEmail);
            const ticket = { code, amount, purchase_datetime, purchaser };
            req.logger.info('Compra finalizada!');
            res.status(201).render('ticket', {
                ticket,
                style: ['styles.css'],
                titlePage: 'Ticket de compra'
            });
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }
}

module.exports = { Controller };