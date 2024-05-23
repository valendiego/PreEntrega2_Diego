const daoProducts = require('../dao/mongo/daoProducts');

class Controller {
    constructor() { }

    async getProducts(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const sort = req.query.sort;
            const category = req.query.category;
            const availability = req.query.availability;

            const products = await new daoProducts().getProducts(page, limit, sort, category, availability);

            res.status(200).json(products);
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async getProductsById(req, res) {
        try {
            const productId = req.params.pid;
            const product = await new daoProducts().getProductById(productId);

            const productData = {
                title: product.title,
                thumbnail: product.thumbnail,
                description: product.description,
                price: product.price,
                stock: product.stock,
                code: product.code,
                id: product.id,
            };

            res.status(200).json(productData);
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async addProduct(req, res) {
        try {
            const { title, description, price, thumbnail, code, status, stock, category } = req.body;
            const product = await new daoProducts().addProduct(title, description, price, thumbnail, code, status, stock, category);
            res.status(200).json({ message: 'Agregado correctamente: ', product });
        } catch (error) {
            res.status(500).json({ Error: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const productId = req.params.pid;
            const updatedProduct = await new daoProducts().updateProduct(productId, req.body);
            res.status(200).json({ message: 'Producto actualizado', updatedProduct });
        } catch (err) {
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    }

    async deleteProduct(req, res) {
        try {
            const productId = req.params.pid;
            await new daoProducts().deleteProduct(productId);
            res.status(200).json({ message: 'Producto eliminado' });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async addProductToCart(req, res) {
        try {
            const productId = req.params.pid;
            const cartId = req.user.cart;
            const cartManager = req.app.get('cartManager');
            await cartManager.addProductToCart(productId, cartId)
            res.status(301).redirect('/products');
        } catch (err) {
            res.status(500).json({ Error: err.message })
        }
    }
}

module.exports = { Controller }