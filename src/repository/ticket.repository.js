const TicketDAO = require('../dao/mongo/ticket.dao');
const { CartRepository } = require('./carts.repository')
const ProductDAO = require('../dao/mongo/products.dao');
const { CustomError } = require('../utils/errors/customErrors');
const { ErrorCodes } = require('../utils/errors/errorCodes');

class TicketRepository {
    #ticketDAO
    #productDAO
    #cartRepository

    constructor() {
        this.#ticketDAO = new TicketDAO();
        this.#productDAO = new ProductDAO();
        this.#cartRepository = new CartRepository();
    }

    #generateUniqueCode() {
        return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    }

    async #findCartById(cartId) {
        try {
            const cart = await this.#cartRepository.getCartById(cartId);
            return cart
        } catch {
            throw CustomError.createError({
                name: 'Error con el carrito',
                cause: 'Debe ingresar un ID válido existente en la base de datos',
                message: 'El carrito no existe',
                code: ErrorCodes.UNDEFINED_CART
            })
        }
    }

    async generateTicket(cartId, userEmail) {
        try {
            const cart = await this.#findCartById(cartId);

            let totalAmount = 0;

            for (const item of cart.products) {
                const product = await this.#productDAO.getProductById(item.product);
                if (product.stock < item.quantity) {
                    throw CustomError.createError({
                        name: 'Error con el stock',
                        cause: `No hay suficiente stock para el producto con ID ${product._id}`,
                        message: 'No se pudo completar la operación por falta de stock',
                        code: ErrorCodes.INSUFFICIENT_STOCK
                    })

                }
            }

            for (const item of cart.products) {
                const product = await this.#productDAO.getProductById(item.product);
                product.stock -= item.quantity;
                totalAmount += product.price * item.quantity;
                await this.#productDAO.updateProduct(product._id, { stock: product.stock });
            }

            const ticketData = {
                code: this.#generateUniqueCode(),
                amount: totalAmount,
                purchaser: userEmail
            };

            const ticket = await this.#ticketDAO.addTicket(ticketData);

            await this.#cartRepository.clearCart(cartId)

            return ticket;
        } catch (error) {
            throw CustomError.createError({
                name: 'Error al generar el ticket',
                cause: 'Ocurrió un error a la hora de generar su ticket de compra',
                message: 'No se pudo generar su ticket',
                code: ErrorCodes.TICKET_CREATION_ERROR,
                otherProblems: error
            })
        }
    }
}

module.exports = { TicketRepository };