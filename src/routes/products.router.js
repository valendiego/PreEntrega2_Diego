const { Router } = require('express'); // Importa la clase Router de Express para definir las rutas
const router = Router(); // Crea un enrutador

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const sort = req.query.sort;
        const category = req.query.category;
        const availability = req.query.availability;

        const productManager = req.app.get('productManager');
        const products = await productManager.getProducts(page, limit, sort, category, availability);

        res.render('home', {
            products,
            titlePage: 'Productos',
            style: ['styles.css'],
            script: ['products.js']
        });

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

        const productData = {
            title: product.title,
            thumbnail: product.thumbnail,
            description: product.description,
            price: product.price,
            stock: product.stock,
            code: product.code,
            id: product.id
        };

        res.status(200).render('product', {
            product: [productData],
            titlePage: `Productos | ${product.title}`,
            style: ['styles.css'],
        });


    } catch (err) {
        res.status(500).json({ Error: err.message }); // Responde con un error 500 si hay un error al obtener el producto
    }
});

// Ruta para agregar producto al carrito
router.post('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const cartId = '662047bf348e11788bed4c57'
        const cartManager = req.app.get('cartManager');
        await cartManager.addProductToCart(productId, cartId)
        res.status(301).redirect('/api/products');
    } catch (err) {
        res.status(500).json({ Error: err.message })
    }
});

// Ruta para agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { title, description, price, thumbnail, code, status, stock, category } = req.body; // Obtiene los datos del producto del cuerpo de la solicitud
        const productManager = req.app.get('productManager');
        await productManager.addProduct(title, description, price, thumbnail, code, status, stock, category); // Agrega el nuevo producto
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
        res.status(301).redirect('/api/products'); // Responde con un mensaje de éxito
    } catch (err) {
        res.status(500).json({ Error: err.message }); // Responde con un error 500 si hay un error al eliminar el producto
    }
});

module.exports = router; // Exporta el enrutador