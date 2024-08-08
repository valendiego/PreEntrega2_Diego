const { ProductRepository } = require('../repository/products.repository');
const { CartRepository } = require('../repository/carts.repository');

class Controller {
    constructor() {
        this.productRepository = new ProductRepository();
    }

    async getProducts(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const user = req.user;
            const firstName = user ? user.firstName : 'Usuario';
            const lastName = user ? user.lastName : 'Sin Identificar';
            const cartId = user ? user.cart : null;

            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const sort = req.query.sort;
            const category = req.query.category;
            const availability = req.query.availability;

            const products = await this.productRepository.getProductsForView(page, limit, sort, category, availability);

            const productsPayload = products.payload.map(product => ({
                ...product,
                isLoggedIn
            }));

            res.render('products', {
                products: { ...products, payload: productsPayload },
                titlePage: 'Productos',
                style: ['styles.css'],
                isLoggedIn,
                isNotLoggedIn: !isLoggedIn,
                firstName,
                lastName, cartId
            });

        } catch (error) {
            req.logger.error(error)
            res.status(error.status).json({ error });
        }
    }

    async getProductById(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const productId = req.params.pid;
            const product = await this.productRepository.getProductById(productId);
            const user = req.user;
            const cartId = req.user.cart;

            const productData = {
                title: product.title,
                thumbnail: product.thumbnail,
                description: product.description,
                price: product.price,
                stock: product.stock,
                code: product.code,
                id: product.id,
                isLoggedIn,
                cartId: user ? user.cart : 'noCart'
            };

            res.status(200).render('product', {
                product: [productData],
                titlePage: `Productos | ${product.title}`,
                style: ['styles.css'],
                isLoggedIn,
                isNotLoggedIn: !isLoggedIn,
                cartId
            });
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async addProductToCart(req, res) {
        try {
            const productId = req.params.pid;
            const cartId = req.user.cart;
            await new CartRepository().addProductToCart(productId, cartId);
            res.status(301).redirect('/products');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async addProduct(req, res) {
        try {
            const { title, description, price, thumbnail, code, status, stock, category } = req.body;
            const owner = req.user.email;
            await this.productRepository.addProduct({ title, description, price, thumbnail, code, status, stock, category, owner });
            req.logger.info('Producto creado de manera correcta');
            res.status(301).redirect('/products');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }
}

module.exports = { Controller };