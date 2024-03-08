const ProductManager = require('../ProductManager');
const { Router } = require('express');
const router = Router();

const manager = new ProductManager(`${__dirname}/../../assets/products.json`);

router.get('/', async (req, res) => {
    try {
        const products = await manager.getProducts();
        const limitFilter = req.query.limit;

        if (limitFilter) {
            if (limitFilter <= 0 || isNaN(parseInt(limitFilter))) {
                res.status(400).json({ error: 'Debe ingresar un número válido superior a 0.' });
                return;
            } else {
                const limit = parseInt(limitFilter);
                const limitedProducts = products.slice(0, limit);
                res.json(limitedProducts);
            }
        } else {
            res.json(products);
        }
    } catch {
        res.status(500).json({ Error: 'Error al cargar los productos' });
    };
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const product = await manager.getProductById(productId);
        res.status(200).json(product);
    } catch {
        res.status(500).json({ Error: 'Error al cargar los productos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, price, thumbnail, code, status, stock } = req.body;
        await manager.addProduct(title, description, price, thumbnail, code, status, stock);
        res.status(201).json({ message: 'Producto agregado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        await manager.updateProduct(productId, req.body);
        res.status(200).json({ message: 'Producto actualizado' });
    } catch {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        await manager.deleteProduct(productId);
        res.status(200).json({ message: 'Producto eliminado' });
    } catch {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

module.exports = router;