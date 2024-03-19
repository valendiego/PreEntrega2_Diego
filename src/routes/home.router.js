const { Router } = require('express');
const router = Router();
const ProductManager = require('../ProductManager');

const manager = new ProductManager(`${__dirname}/../../assets/products.json`);

router.get('/', async (_, res) => {
    try {
        const products = await manager.getProducts();

        const productsData = products.map(product => ({
            title: product.title,
            thumbnail: product.thumbnail,
            description: product.description,
            price: product.price,
            stock: product.stock,
            code: product.code
        }));

        res.render('home', {
            products: productsData,
            titlePage: 'Productos',
            h1: 'Tienda',
            style: ['styles.css'],
            script: ['home.js']
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});
module.exports = router;