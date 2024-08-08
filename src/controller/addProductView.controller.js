// const daoProducts = require('../dao/mongo/products.dao');
const { ProductRepository } = require('../repository/products.repository');

class Controller {
    #productRepository
    constructor() {
        this.#productRepository = new ProductRepository();
    }

    viewForm(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const adminUser = req.user.rol;
            const cartId = req.user.cart;
            if (adminUser === 'user') {
                return res.render('error', {
                    titlePage: 'Error',
                    message: 'No tiene permisos de acceso.',
                    style: ['styles.css'],
                    isLoggedIn,
                    cartId
                });
            }

            res.render('createProduct', {
                titlePage: 'Agregar Producto',
                style: ['styles.css'],
                script: ['createProduct.js'],
                isLoggedIn,
                cartId
            });
        } catch (error) {
            req.logger.error(error);
            res.status(500).json({ error })
        }
    }

    async addProduct(req, res) {
        try {

            const { title, description, price, thumbnail, code, status, stock, category } = req.body;
            const owner = req.user.email;
            await this.#productRepository.addProduct({ title, description, price, thumbnail, code, status, stock, category, owner });
            req.logger.info('Producto creado de manera correcta');
            res.status(301).redirect('/products');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }
}


module.exports = { Controller };