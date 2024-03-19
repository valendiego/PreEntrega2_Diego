const { Router } = require('express');
const router = Router();
const ProductManager = require('../ProductManager');

const manager = new ProductManager(`${__dirname}/../../assets/products.json`);

router.get('/', async (_, res) => {
    try {
        const products = await manager.getProducts();

        // Formatear los datos de los productos para enviarlos a la plantilla
        const productsData = products.map(product => ({
            title: product.title,
            thumbnail: product.thumbnail,
            description: product.description,
            price: product.price,
            stock: product.stock,
            code: product.code,
            id: product.id
        }));

        // Renderizar la plantilla 'realTimeProducts' con los datos de los productos
        res.render('realTimeProducts', {
            products: productsData,
            titlePage: 'Productos',
            h1: 'Tienda',
            style: ['styles.css'],
            script: ['realTimeProducts.js'],
            useWS: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

router.post('/', async (req, res) => {
    try {

        // Obtener los datos del producto del cuerpo de la solicitud
        const { title, description, price, thumbnail, code, status, stock } = req.body;

        // Crear un nuevo objeto de producto
        const newProduct = { title, description, price, thumbnail, code, status, stock };

        // Agregar el nuevo producto al archivo
        await manager.addProduct(title, description, price, thumbnail, code, status, stock);

        // Emitir un evento WebSocket si se proporcionaron todos los datos del producto con el fin de que no se cargue un producto vacio en el feed
        if (newProduct.title && newProduct.description && newProduct.price && newProduct.code && newProduct.stock) {
            req.app.get('ws').emit('newProduct', newProduct);
        }

        res.status(301).redirect('/api/realTimeProducts');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

router.delete('/:pid', async (req, res) => {
    try {

        // Obtener el ID del producto a eliminar desde los parámetros de la URL
        const productId = parseInt(req.params.pid);

        // Eliminar el producto del archivo
        await manager.deleteProduct(productId);

        // Obtener la lista de productos del archivo actualizada
        const products = await manager.getProducts();

        // Emitir un evento WebSocket para actualizar el feed de productos en los clientes 
        req.app.get('ws').emit('updateFeed', products);

        // Redireccionar al usuario a la página de productos en tiempo real
        res.status(301).redirect('/realTimeProducts');
    } catch {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

module.exports = router;