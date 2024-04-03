const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const productManager = req.app.get('productManager'); // Obtiene todos los productos
        const products = await productManager.getProducts();
        const limitFilter = req.query.limit; // Obtiene el parámetro de consulta "limit"

        const productsData = products.map(product => ({
            title: product.title,
            thumbnail: product.thumbnail,
            description: product.description,
            price: product.price,
            stock: product.stock,
            code: product.code,
            id: product.id
        }));

        if (limitFilter) { // Si se proporciona el parámetro "limit"
            if (limitFilter <= 0 || isNaN(parseInt(limitFilter))) { // Verifica si el parámetro "limit" es válido
                res.status(400).json({ error: 'Debe ingresar un número válido superior a 0.' }); // Responde con un error 400 si el parámetro es inválido
                return;
            } else {
                const limit = parseInt(limitFilter); // Convierte el valor de "limit" a un número entero
                const limitedProducts = products.slice(0, limit); // Obtiene los productos limitados según el valor de "limit"

                res.render('home', {
                    products: limitedProducts,
                    titlePage: 'Productos',
                    h1: 'Tienda',
                    style: ['styles.css'],
                });
            }
        } else {
            res.render('home', {
                products: productsData,
                titlePage: 'Productos',
                style: ['styles.css'],
            });

        }
    } catch {
        res.status(500).json({ Error: 'Error al cargar los productos' }); // Responde con un error 500 si hay un error al obtener los productos
    };
});

// Ruta para obtener un producto por su ID
router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid; // Obtiene el ID del producto de los parámetros de la solicitud como una cadena
        const productManager = req.app.get('productManager');
        const product = await productManager.getProductById(productId); // Obtiene el producto por su ID
        res.status(200).json(product); // Responde con el producto obtenido
    } catch (err) {
        res.status(500).json({ Error: err.message }); // Responde con un error 500 si hay un error al obtener el producto
    }
});


// Ruta para agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { title, description, price, thumbnail, code, status, stock } = req.body; // Obtiene los datos del producto del cuerpo de la solicitud
        const productManager = req.app.get('productManager');
        await productManager.addProduct(title, description, price, thumbnail, code, status, stock); // Agrega el nuevo producto
        res.status(301).redirect('/api/products'); // Responde con un mensaje de éxito
    } catch (error) {
        res.status(500).json({ Error: error.message }); // Responde con un error 500 si hay un error al agregar el producto
    }
});

// Ruta para actualizar un producto por su ID
router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid; // Obtener el ID del producto de los parámetros de la solicitud
        const productManager = req.app.get('productManager');
        await productManager.updateProduct(productId, req.body); // Actualizar el producto
        res.status(200).json({ message: 'Producto actualizado' }); // Responder con un mensaje de éxito
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el producto' }); // Responder con un error 500 si hay un error al actualizar el producto
    }
});


// Ruta para eliminar un producto por su ID
router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid; // Obtiene el ID del producto de los parámetros de la solicitud
        const productManager = req.app.get('productManager');
        await productManager.deleteProduct(productId); // Elimina el producto
        res.status(200).json({ message: 'Producto eliminado' }); // Responde con un mensaje de éxito
    } catch (err) {
        res.status(500).json({ Error: err.message }); // Responde con un error 500 si hay un error al eliminar el producto
    }
});

module.exports = router; // Exporta el enrutador