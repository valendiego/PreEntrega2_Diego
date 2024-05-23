const daoProducts = require('../dao/mongo/daoProducts');
const daoCarts = require('../dao/mongo/daoCarts');

class Controller {
    constructor() { }

    async getProducts(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const user = req.user;
            const firstName = user ? user.firstName : 'Usuario'
            const lastName = user ? user.lastName : 'Sin Identificar'
            const cartId = user ? user.cart : null;

            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const sort = req.query.sort;
            const category = req.query.category;
            const availability = req.query.availability;

            const products = await new daoProducts().getProducts(page, limit, sort, category, availability);

            const productsPayload = products.payload.map(product => ({
                ...product,
                isLoggedIn
            }));

            res.render('products', {
                products: { ...products, payload: productsPayload },
                titlePage: 'Productos',
                style: ['styles.css'],
                script: ['products.js'],
                isLoggedIn,
                isNotLoggedIn: !isLoggedIn,
                firstName,
                lastName, cartId
            });

        } catch (err) {
            res.status(500).json({ Error: err.message }); // Responde con un error 500 si hay un error al obtener los productos
        };
    }

    async getProductById(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const productId = req.params.pid; // Obtiene el ID del producto de los parámetros de la solicitud como una cadena
            const product = await new daoProducts().getProductById(productId); // Obtiene el producto por su ID

            const productData = {
                title: product.title,
                thumbnail: product.thumbnail,
                description: product.description,
                price: product.price,
                stock: product.stock,
                code: product.code,
                id: product.id,
                isLoggedIn
            };

            res.status(200).render('product', {
                product: [productData],
                titlePage: `Productos | ${product.title}`,
                style: ['styles.css'],
                isLoggedIn,
                isNotLoggedIn: !isLoggedIn,
            });


        } catch (err) {
            res.status(500).json({ Error: err.message }); // Responde con un error 500 si hay un error al obtener el producto
        }
    }

    async addProductToCart(req, res) {
        try {
            const productId = req.params.pid;
            const cartId = req.user.cart;
            await new daoCarts().addProductToCart(productId, cartId)
            res.status(301).redirect('/products');
        } catch (err) {
            res.status(500).json({ Error: err.message })
        }
    }

    async addProduct(req, res) {
        try {
            const { title, description, price, thumbnail, code, status, stock, category } = req.body; // Obtiene los datos del producto del cuerpo de la solicitud
            await new daoProducts().addProduct(title, description, price, thumbnail, code, status, stock, category); // Agrega el nuevo producto
            res.status(301).redirect('/products'); // Responde con un mensaje de éxito
        } catch (error) {
            res.status(500).json({ Error: error.message }); // Responde con un error 500 si hay un error al agregar el producto
        }
    }
}

module.exports = { Controller }