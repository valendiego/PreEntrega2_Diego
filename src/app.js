const ProductManager = require('./ProductManager');
const express = require('express');
const app = express();

const manager = new ProductManager('../assets/products.json');

app.get('/products', async (req, res) => {
    try {
        const products = await manager.getProducts();
        const limitFilter = req.query.limit;

        if (limitFilter <= 0) {
            res.status(400).json({ error: 'El límite debe ser superior a 0' });
            return;
        }

        if (limitFilter) {
            const limit = parseInt(limitFilter);
            const limitedProducts = products.slice(0, limit);
            res.json(limitedProducts);
        } else {
            res.json(products);
        }
    } catch {
        res.json({ Error: 'Error al cargar los productos' });
    };
});

app.get('/products/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const product = await manager.getProductById(productId);
        product ? res.json(product) : res.json('El producto no existe');
    } catch {
        res.json({ Error: 'Error al buscar el id' });
    }
});

app.listen(8080, () => {
    console.log('Server Listo!');
});