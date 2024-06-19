const { CartRepository } = require('../repository/carts.repository');
const { TicketRepository } = require('../repository/ticket.repository');

class Controller {
    constructor() {
        this.cartRepository = new CartRepository();
        this.ticketRepository = new TicketRepository();
    }

    async getCarts(req, res) {
        try {
            const carts = await this.cartRepository.getCarts();
            res.status(200).json(carts);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async getCartById(req, res) {
        try {
            const cartId = req.params.cid;
            const cart = await this.cartRepository.getCartById(cartId);
            res.status(200).json(cart);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async createCart(res) {
        try {
            const cart = await this.cartRepository.addCart();
            req.logger.info('Carrito creado de manera correcta');
            res.status(201).json(cart);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async addProductToCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const user = req.user;
            const cart = await this.cartRepository.addProductToCart(productId, cartId, user);
            req.logger.info('Producto agregado al carrito de manera correcta');
            res.status(200).json(cart);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async deleteProductFromCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid
            const cart = await this.cartRepository.deleteProductFromCart(productId, cartId);
            req.logger.info('Producto eliminado del carrito.');
            res.status(200).json(cart);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async updateCart(req, res) {
        try {
            const cartId = req.params.cid;
            const products = req.body;
            const cart = await this.cartRepository.updateCart(cartId, products);
            req.logger.info('Se ha actualizado el carrito de manera correcta');
            res.status(200).json(cart);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async updateProductQuantity(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const { quantity } = req.body;
            const cart = await this.cartRepository.updateProductQuantity(cartId, productId, quantity);
            req.logger.info('Se ha actualizado la cantidad de manera correcta');
            res.status(200).json(cart);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async clearCart(req, res) {
        try {
            const cartId = req.params.cid;
            const cart = await this.cartRepository.clearCart(cartId);
            req.logger.info('Se ha vaciado el carrito de manera correcta');
            res.status(200).json(cart);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async deleteCartById(req, res) {
        try {
            const cartId = req.params.cid;
            await this.cartRepository.deleteCartById(cartId);
            req.logger.info('Carrito eliminado');
            res.status(200).json({ message: 'Carrito eliminado' });
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }

    async generateTicket(req, res) {
        try {
            const { cid } = req.params;
            const userEmail = req.user.email;
            const ticket = await this.ticketRepository.generateTicket(cid, userEmail);
            req.logger.info('Compra finalizada!');
            res.status(200).json({
                message: 'Compra realizada con éxito',
                ticket
            });
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error });
        }
    }
}

module.exports = { Controller };