require('dotenv').config();
const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../../src/app');
const requester = supertest(`http://localhost:${PORT}`);

let chai;
let expect;
let server; // Variable para almacenar la instancia del servidor

describe('Testing Tech Store', () => {
    before(async function () {
        // Se ejecuta UNA ÚNICA vez, antes de todos los test de la suite
        this.timeout(10000); // Configurar el tiempo de espera para la conexión
        const mongooseConnection = await mongoose.connect('mongodb://localhost:27017/', { dbName: 'testing' });
        connection = mongooseConnection.connection;

        // Iniciar el servidor
        server = app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });

        // Importar chai dinámicamente
        chai = await import('chai');
        expect = chai.expect;
    });

    after(async () => {
        // Se ejecuta UNA ÚNICA vez, luego de todos los test de la suite
        await connection.db.dropDatabase();
        await connection.close();

        // Cerrar el servidor
        if (server) {
            server.close(() => {
                console.log('Servidor cerrado');
                process.exit(0); // Salir del proceso de Node.js
            });
        } else {
            process.exit(0); // Salir del proceso de Node.js
        }
    });

    beforeEach(function () {
        // Se ejecuta antes de cada test dentro de esta suite
        this.timeout(10000); // Configurar el test para que mocha lo espere durante 10 segundos
    });

    afterEach(async () => {
        // Se ejecuta luego de cada test dentro de esta suite
    });

    // Función auxiliar para autenticación
    const authenticateAdminUser = async () => {
        const user = { email: process.env.ADMIN_USER, password: process.env.ADMIN_PASS };
        const loginResponse = await requester.post('/api/sessions/login').send(user);
        return loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta
    };

    // Función auxiliar para crear un producto
    const createProduct = async (cookie, productData) => {
        return requester.post('/api/products').set('Cookie', cookie).send(productData);
    };

    // Función auxiliar para crear un carrito
    const createCart = async (cookie) => {
        return requester.post('/api/cart').set('Cookie', cookie);
    };

    // Función auxiliar para crear y logear un usuario
    const simpleRegisterAndLoginUser = async (email, password) => {
        const user = { email, password };
        await requester.post('/api/sessions/register').send(user);
        const loginResponse = await requester.post('/api/sessions/login').send(user);
        return cookie = loginResponse.headers['set-cookie'][0]; // Obtener la cookie del encabezado de la respuesta
    }

    describe('Test de productos', () => {
        it('El endpoint GET /api/products debe devolver todos los productos de la base de datos o un array vacio', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products');
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body)).to.be.ok;
        });

        it('El endpoint GET /api/products debe devolver un error si se accede a una página que no existe', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products?page=error');
            expect(statusCode).to.equal(400);
            expect(ok).to.equal(false);
            expect(body.error).to.have.property('cause');
            expect(body.error.code).to.equal(1);
        });

        it('El endpoint GET /api/products/:pid debe devolver un producto según su ID', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC131',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;
            const { statusCode, ok, body } = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body.title).to.equal('test de producto');
            expect(body.thumbnail).to.equal('Sin imagen');
        });

        it('El endpoint GET /api/product/:pid debe devolver un error si el ID no existe', async () => {
            const pid = 'falsoPID';

            const { statusCode, ok, body } = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body.error).to.have.property('cause');
            expect(body.error.name).to.equal('El producto no existe');
            expect(body.error.code).to.equal(3);
        });

        it('El endpoint POST /api/products/ debe crear un producto de manera correcta', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC132',
                stock: 56,
                category: 'laptops'
            };

            const { statusCode, ok, body } = await createProduct(cookie, productMock);

            expect(ok).to.equal(true);
            expect(statusCode).to.be.equal(201);
            expect(body).to.have.property('id');
        });

        it('El endpoint POST /api/products/ debe devolver un error al intentar cargar mal un producto', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC131',
                stock: 56,
                category: 'laptops'
            };

            const { statusCode, ok, body } = await createProduct(cookie, productMock);

            expect(ok).to.equal(false);
            expect(statusCode).to.equal(400);
            expect(body.error).to.have.property('cause');
            expect(body.error.name).to.equal('Error al crear producto');
            expect(body.error.code).to.equal(8)
        });

        it('El endpoint POST /api/products/ debe arrojar un error al intentar cargar un producto sin tener los permisos', async () => {

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC132',
                stock: 56,
                category: 'laptops'
            };

            const { statusCode, ok, body } = await requester.post('/api/products').send(productMock);

            expect(ok).to.equal(false);
            expect(statusCode).to.equal(403);
            expect(body).to.have.property('message');
        });

        it('El endpoint POST /api/products/ debe arrojar error al intentar crear un producto con el código duplicado', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC132',
                stock: 56,
                category: 'laptops'
            };

            const { statusCode, ok, body } = await createProduct(cookie, productMock);

            expect(ok).to.equal(false);
            expect(statusCode).to.be.equal(409);
            expect(body.error).to.have.property('cause');
            expect(body.error.otherProblems.code).to.equal(26);
        });

        it('El endpoint PUT /api/product/:pid debe actualizar el producto de forma correcta', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC133',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            const updatedProductMock = {
                title: 'Producto actualizado',
                price: 350
            };

            const updatedProduct = await requester
                .put(`/api/products/${pid}`)
                .set('Cookie', cookie)
                .send(updatedProductMock);

            expect(product.body.title).to.equal('test de producto');
            expect(product.body.price).to.equal(300);
            expect(updatedProduct.body.title).to.equal('Producto actualizado');
            expect(updatedProduct.body.price).to.equal(350);
            expect(product.body.stock).to.equal(updatedProduct.body.stock);
            expect(updatedProduct.statusCode).to.equal(201);
            expect(updatedProduct.ok).to.be.ok;
        });

        it('El endpoint PUT /api/product/:pid debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC134',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            const updatedProductMock = {
                title: 'Producto actualizado',
                price: 350
            };

            const { statusCode, ok, body } = await requester
                .put(`/api/products/${pid}`)
                .send(updatedProductMock);

            expect(product.body.title).to.equal('test de producto');
            expect(product.body.price).to.equal(300);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(403);
            expect(body).to.have.property('message');
        });

        it('El endpoint PUT /api/product/:pid debe arrojar error el producto no existe', async () => {
            const cookie = await authenticateAdminUser();

            const pid = 'falsoPID';

            const updatedProductMock = {
                title: 'Producto actualizado',
                price: 350
            };

            const { statusCode, ok, body } = await requester
                .put(`/api/products/${pid}`)
                .set('Cookie', cookie)
                .send(updatedProductMock);

            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body.error).to.have.property('cause');
            expect(body.error.code).to.equal(3);
        });

        it('El endpoint DELETE /api/products/:pid debe eliminar el producto de la base de datos', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC135',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const { statusCode, ok } = await requester
                .delete(`/api/products/${pid}`)
                .set('Cookie', cookie)

            const verifyProduct = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(204);
            expect(ok).to.equal(true);
            expect(verifyProduct.statusCode).to.equal(404);
        });

        it('El endpoint DELETE /api/products/:pid debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC136',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const { statusCode, ok, body } = await requester.delete(`/api/products/${pid}`);

            const verifyProduct = await requester.get(`/api/products/${pid}`);

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(verifyProduct.statusCode).to.equal(200);
            expect(body).to.have.property('message');

        });

        it('El endpoint DELETE /api/products/:pid debe arrojar error si el producto no existe', async () => {
            const cookie = await authenticateAdminUser();

            const pid = 'falsoPID';

            const { statusCode, ok, body } = await requester
                .delete(`/api/products/${pid}`)
                .set('Cookie', cookie)


            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body.error).to.have.property('cause');
        });

    });

    describe('Test de carts', () => {
        it('El endpoint GET /api/cart debe devolver todos los carritos de la base de datos o un array vacio', async () => {
            const { statusCode, ok, body } = await requester.get('/api/cart');
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body)).to.be.ok;
        });

        it('El endpoint GET /api/cart/:cid debe devolver un carrito según su ID', async () => {
            const cookie = await authenticateAdminUser();

            const cart = await createCart(cookie);
            const cid = cart.body._id;

            const { statusCode, ok, body } = await requester.get(`/api/cart/${cid}`);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;

        });

        it('El endpoint POST /api/cart debe agregar un nuevo carrito a la base de datos', async () => {
            const cookie = await authenticateAdminUser();

            const { statusCode, ok, body } = await requester
                .post('/api/cart')
                .set('Cookie', cookie) // Incluir la cookie en el encabezado

            expect(statusCode).to.equal(201);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
        });

        it('El endpoint POST /api/cart debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const { statusCode, ok, body } = await requester
                .post('/api/cart')

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint POST /api/cart/:cid/product/:pid debe agregar un producto al carrito', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC136',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);
            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);
            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test@test,com', '123');

            const { statusCode, ok, body } = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product).to.equal(pid);
        });

        it('El endpoint POST /api/cart/:cid/product/:pid debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC136',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);
            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);
            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const { statusCode, ok, body } = await requester
                .post(`/api/cart/${cid}/product/${pid}`)

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint POST /api/cart/:cid/product/:pid debe arrojar error si el producto no existe', async () => {
            const cookie = await authenticateAdminUser();

            const pid = 'falsoPID';

            const cart = await createCart(cookie);
            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test@test,com', '123');

            const { statusCode, ok, body } = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint DELETE /api/cart/:cid/product/:pid debe eliminar un producto del carrito', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC137',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test2@test.com', '123');

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok, body } = await requester
                .delete(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.have.property('_id');
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products).to.deep.equal([]);
        });

        it('El endpoint PUT /api/cart/:cid debe actualizar el carrito de forma correcta', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC138',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test3@test.com', '123');

            const productToUpdate = [{
                product: pid,
                quantity: 20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .set('Cookie', cookieUser) // Incluir la cookie en el encabezado
                .send(productToUpdate);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product._id).to.equal(pid);
            expect(body.products[0].quantity).to.equal(20);
        });

        it('El endpoint PUT /api/cart/:cid debe arrojar error si la petición es inválida', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC139',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test3@test.com', '123');

            const productToUpdate = [{
                product: pid,
                quantity: -20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .set('Cookie', cookieUser) // Incluir la cookie en el encabezado
                .send(productToUpdate);

            expect(statusCode).to.equal(400);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint PUT /api/cart/:cid debe arrojar un error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();

            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC141',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test3@test.com', '123');

            const productToUpdate = [{
                product: pid,
                quantity: 20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .send(productToUpdate);

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint PUT /api/cart/:cid debe arrojar un error si el producto no existe', async () => {
            const cookie = await authenticateAdminUser();

            const pid = 'falsoPID';


            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test3@test.com', '123');

            const productToUpdate = [{
                product: pid,
                quantity: 20
            }]

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}`)
                .set('Cookie', cookieUser) // Incluir la cookie en el encabezado
                .send(productToUpdate);

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe actualizar la cantidad de producto en el carrito', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'Test Product',
                description: 'Product description',
                price: 300,
                code: 'abc129',
                stock: 80,
                category: 'almacenamiento'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test4@test.com', '123');

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)
                .send(quantity);

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(Array.isArray(body.products)).to.be.ok;
            expect(body.products[0].product._id).to.equal(pid);
            expect(body.products[0].quantity).to.equal(20);
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe arrojar error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC142',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            expect(cart.body).to.have.property('_id');

            const cid = cart.body._id;

            const cookieUser = await simpleRegisterAndLoginUser('test4b@test.com', '123');

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}/product/${pid}`)
                .send(quantity);

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe arrojar error si el carrito no existe', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC143',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            expect(cart.body).to.have.property('_id');

            const cid = cart.body._id;

            const cookieUser = await simpleRegisterAndLoginUser('test4b@test.com', '123');

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/noCart/product/${pid}`)
                .set('Cookie', cookieUser)
                .send(quantity);

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint PUT /api/cart/:cid/product/:pid debe arrojar error si el producto no existe', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC144',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            expect(cart.body).to.have.property('_id');

            const cid = cart.body._id;

            const cookieUser = await simpleRegisterAndLoginUser('test4b@test.com', '123');

            const addProduct = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(addProduct.body.products[0].quantity).to.equal(1);
            expect(addProduct.body.products[0].product).to.equal(pid);

            const quantity = {
                quantity: 20
            }

            const { statusCode, ok, body } = await requester
                .put(`/api/cart/${cid}/product/noPid`)
                .set('Cookie', cookieUser)
                .send(quantity);

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint DELETE /api/cart/:cid debe vaciar el carrito de forma correcta', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC145',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test5b@test.com', '123');

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.ok).to.equal(true);
            expect(updatedCart.body).to.have.property('_id');
            expect(Array.isArray(updatedCart.body.products)).to.be.ok;
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok } = await requester
                .delete(`/api/cart/${cid}`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(204);
            expect(ok).to.equal(true);
        });

        it('El endpoint DELETE /api/cart/:cid debe arrojar un error si no cuenta con los permisos adecuados', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 300,
                code: 'ABC146',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test5fb@test.com', '123');

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.ok).to.equal(true);
            expect(updatedCart.body).to.have.property('_id');
            expect(Array.isArray(updatedCart.body.products)).to.be.ok;
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok, body } = await requester
                .delete(`/api/cart/${cid}`)

            expect(statusCode).to.equal(403);
            expect(ok).to.equal(false);
            expect(body).to.have.property('message');
        });

        it('El endpoint DELETE /api/cart/:cid debe arrojar un error si el carrito no existe', async () => {
            const cookie = await authenticateAdminUser();
            const productMock = {
                title: 'test de producto',
                description: 'Descripción del producto',
                price: 900,
                code: 'ABC131',
                stock: 56,
                category: 'laptops'
            };

            const product = await createProduct(cookie, productMock);

            const pid = product.body.id;

            expect(product.body).to.be.property('id');

            const cart = await createCart(cookie);

            const cid = cart.body._id;

            expect(cart.body).to.have.property('_id');

            const cookieUser = await simpleRegisterAndLoginUser('test9@test.com', '123');

            const updatedCart = await requester
                .post(`/api/cart/${cid}/product/${pid}`)
                .set('Cookie', cookieUser)

            expect(updatedCart.statusCode).to.equal(200);
            expect(updatedCart.ok).to.equal(true);
            expect(updatedCart.body).to.have.property('_id');
            expect(Array.isArray(updatedCart.body.products)).to.be.ok;
            expect(updatedCart.body.products[0].product).to.equal(pid);

            const { statusCode, ok, body } = await requester
                .delete(`/api/cart/noCart`)
                .set('Cookie', cookieUser)

            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause')
        });
    });

    describe('Test de users', () => {
        it('El endpoint POST /api/session/register debe registrar un usuario de marera correcta', async () => {
            const user = {
                firstName: 'Juan',
                lastName: 'Dominguez',
                email: 'juando@gmail.com',
                password: 'juancito123'
            }

            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(user);

            expect(statusCode).to.equal(201);
            expect(ok).to.equal(true);
            expect(body).to.have.property('firstName');
            expect(body.password).to.not.equal(user.password);
        });

        it('El endpoint POST /api/session/register debe registrar un usuario aunque no asigne un nombre, apellido o edad', async () => {
            const user = {
                email: 'pepeargento@gmail.com',
                password: 'pepito123'
            }

            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(user);

            expect(statusCode).to.equal(201);
            expect(ok).to.equal(true);
            expect(body).to.have.property('firstName');
            expect(body.password).to.not.equal(user.password);
            expect(body.firstName).to.equal('Usuario');
            expect(body.lastName).to.equal('Sin Identificar');
        });

        it('El endpoint POST /api/session/register debe arrojar error si no se proporciona un mail', async () => {
            const user = {
                firstName: 'Juan',
                lastName: 'Dominguez',
                password: 'juancito123'
            }

            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(user);

            expect(statusCode).to.equal(500);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error')
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint POST /api/session/register debe arrojar error si el usuario ya está registrado', async () => {
            const user = {
                firstName: 'Juan',
                lastName: 'Dominguez',
                email: 'juando@gmail.com',
                password: 'juancito123'
            }

            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(user);

            expect(statusCode).to.equal(409);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error.otherProblems.code).to.equal(16);
        });


        it('El endpoint POST /api/session/login logear un usuario de manera correcta', async () => {
            const user = {
                firstName: 'Abril',
                lastName: 'Vera',
                email: 'abrilverasilva@gmail.com',
                password: 'abru198'
            }

            await requester.post('/api/sessions/register').send(user);

            const { statusCode, ok, body } = await requester
                .post('/api/sessions/login')
                .send({ email: 'abrilverasilva@gmail.com', password: 'abru198' });

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.have.property('accessToken');
            expect(body.userPayload).to.have.property('cart')
            expect(body.userPayload).to.have.property('id')
            expect(body.userPayload.firstName).to.equal(user.firstName);
        });

        it('El endpoint POST /api/session/login debe arrojar error si la contraseña es incorrecta', async () => {
            const user = {
                firstName: 'Abril',
                lastName: 'Vera',
                email: 'abrilverasilva@gmail.com',
                password: 'abru19'
            }

            await requester.post('/api/sessions/register').send(user);

            const { statusCode, ok, body } = await requester
                .post('/api/sessions/login')
                .send({ email: 'abrilverasilva@gmail.com', password: 'abru19' });

            expect(statusCode).to.equal(401);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint POST /api/session/login debe arrojar error el usuario no existe', async () => {

            const { statusCode, ok, body } = await requester
                .post('/api/sessions/login')
                .send({ email: 'carlitos123@gmail.com', password: 'carl01041956' });

            expect(statusCode).to.equal(401);
            expect(ok).to.equal(false);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });

        it('El endpoint GET /api/session/current debe devolver el usuario que se encuentra logeado', async () => {
            const user = {
                firstName: 'Lucas',
                lastName: 'Rodriguez',
                email: 'lucasrodri@gmail.com',
                password: 'lukkkas123'
            }

            await requester.post('/api/sessions/register').send(user);

            const logUser = await requester
                .post('/api/sessions/login')
                .send({ email: 'lucasrodri@gmail.com', password: 'lukkkas123' });

            const cookie = logUser.headers['set-cookie'][0];

            const { statusCode, ok, body } = await requester
                .get('/api/sessions/current')
                .set('Cookie', cookie)

            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(body).to.have.property('id');
            expect(body.firstName).to.equal(user.firstName);
        });

        it('El endpoint GET /api/session/current debe arrojar error si no hay un usuario logeado', async () => {
            const { statusCode, ok, body } = await requester
                .get('/api/sessions/current')

            expect(statusCode).to.equal(401);
            expect(ok).to.equal(false);
            expect(body).to.deep.equal({});
        });

        it('El enpoint GET /api/session/logout debe cerrar la sesion de forma correcta', async () => {
            const cookie = await authenticateAdminUser();

            const log = await requester
                .get('/api/sessions/current')
                .set('Cookie', cookie)

            expect(log.body.rol).to.equal('admin');
            expect(log.statusCode).to.equal(200);
            expect(log.body).to.have.property('firstName');

            const logout = await requester
                .get('/api/sessions/logout')

            expect(logout.body).to.have.property('message');
            expect(logout.body.message).to.equal('Sessión finalizada');
            expect(logout.statusCode).to.equal(200);
        });

        it('El endpoint POST /api/sessions/premium/:uid debe cambiar el rol de usuario a premium', async () => {
            const cookie = await simpleRegisterAndLoginUser('testRol@test.com', '123');

            const currentUser = await requester
                .get('/api/sessions/current')
                .set('Cookie', cookie);

            expect(currentUser.body.email).to.equal('testRol@test.com');
            expect(currentUser.body.rol).to.equal('user');
            expect(currentUser.body).to.have.property('id');

            const updateRol = await requester
                .post(`/api/sessions/premium/${currentUser.body.id}`);
            expect(updateRol.body.firstName).to.equal(currentUser.body.firstName);
            expect(updateRol.body.id).to.equal(currentUser.body.id);
            expect(updateRol.body.cart).to.equal(currentUser.body.cart);
            expect(updateRol.body.rol).to.equal('premium');
            expect(updateRol.status).to.equal(200);
        });

        it('El endpoint POST /api/sessions/premium/:uid debe arrojar error si el usuario no existe', async () => {
            const sinID = 'noID'
            const { body, statusCode, ok } = await requester
                .post(`/api/sessions/premium/${sinID}`);

            expect(ok).to.equal(false);
            expect(statusCode).to.equal(404);
            expect(body).to.have.property('error');
            expect(body.error).to.have.property('cause');
        });
    });
});