const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const passport = require('passport');

// <-- FILEMANAGER -->
// Agregar o quitar comentarios para cambiar entre mongoDB y sistema de archivos
// const ProductManager = require('./dao/fileManagers/ProductManager');
// const CartManager = require('./dao/fileManagers/CartManager');

// <-- MONGOMANAGER --> 
// Agregar o quitar comentarios para cambiar entre mongoDB y sistema de archivos
const ProductManager = require('./dao/dbManagers/ProductManager');
const CartManager = require('./dao/dbManagers/CartManager');
const UserManager = require('./dao/dbManagers/UserManager');

const productsRouter = require('./routes/products.router');
const cartRouter = require('./routes/cart.router');
const createProductRouter = require('./routes/createProduct.router');
const sessionRouter = require('./routes/session.router');
const sessionViewsRouter = require('./routes/sessionViews.router');

const app = express();

// configurar handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

// Permitir envío de información mediante formularios y JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos de formularios
app.use(express.json()); // Middleware para parsear datos JSON
app.use(express.static(`${__dirname}/../public`))


// Configuración de session
const inicializeStrategy = require('./config/passport.config');
const inicializeStrategyGithub = require('./config/passport-github.config');
const { dbName, mongoUrl } = require('./dbconfig');
const sessionMiddleware = require('./session/mongoStorage');
app.use(sessionMiddleware);
inicializeStrategy();
inicializeStrategyGithub();
app.use(passport.initialize());
app.use(passport.session());

// Se asignan las rutas para los endpoints relacionados con los productos y el carrito
app.use('/api/products', productsRouter); // Rutas relacionadas con los productos
app.use('/api/cart', cartRouter); // Rutas relacionadas con el carrito
app.use('/api/createProduct', createProductRouter);
app.use('/api/sessions', sessionRouter);
app.use('/', sessionViewsRouter);
app.use('/api/sessions/register', sessionRouter);


// Se inicia el servidor en el puerto 8080
const main = async () => {

    await mongoose.connect(mongoUrl, { dbName });

    const productManager = new ProductManager();
    await productManager.prepare();
    app.set('productManager', productManager);

    const cartManager = new CartManager();
    await cartManager.prepare();
    app.set('cartManager', cartManager);

    const userManager = new UserManager();
    await userManager.prepare();
    app.set('userManager', userManager);

    app.listen(8080);

    console.log('Servidor cargado!' + '\n' + 'http://localhost:8080')
}

main();