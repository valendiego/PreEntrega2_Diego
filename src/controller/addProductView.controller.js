const daoProducts = require('../dao/mongo/daoProducts');

class Controller {
    constructor() { }

    viewForm(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const adminUser = req.user.rol;
            if (adminUser === 'user') {
                return res.render('error', {
                    titlePage: 'Error',
                    message: 'No tiene permisos de acceso.',
                    style: ['styles.css'],
                    isLoggedIn
                });
            }

            res.render('createProduct', {
                titlePage: 'Agregar Producto',
                style: ['styles.css'],
                script: ['createProduct.js'],
                isLoggedIn
            });
        } catch (e) {
            res.status(500).json({ error: ee.message })
        }
    }

    async addProduct(req, res) {
        try {

            // Obtener los datos del producto del cuerpo de la solicitud
            const { title, description, price, thumbnail, code, status, stock } = req.body;

            // Agregar el nuevo producto al archivo
            await new daoProducts().addProduct(title, description, price, thumbnail, code, status, stock);

            res.status(301).redirect('/products');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
        }
    }
}


module.exports = { Controller };