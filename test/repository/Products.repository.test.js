const mongoose = require('mongoose');
const { ProductRepository } = require('../../src/repository/products.repository');

describe('Testing Product Repository', () => {
    let chai;
    let expect;
    const productRepository = new ProductRepository();
    let connection = null;

    before(async function () {
        chai = await import('chai');
        expect = chai.expect;

        // Se ejecuta UNA ÚNICA vez, antes de todos los test de la suite
        this.timeout(10000); // Configurar el tiempo de espera para la conexión
        const mongooseConnection = await mongoose.connect('mongodb://localhost:27017/', { dbName: 'testing' });
        connection = mongooseConnection.connection;
    });

    after(async () => {
        // Se ejecuta UNA ÚNICA vez, luego de todos los test de la suite
        await connection.db.dropDatabase();
        await connection.close();
    });

    beforeEach(function () {
        // Se ejecuta antes de cada test dentro de esta suite
        this.timeout(10000); // Configurar el test para que mocha lo espere durante 10 segundos
    });

    afterEach(async () => {
        // Se ejecuta luego de cada test dentro de esta suite
    });

    it('El resultado del get debe ser un array', async function () {
        this.timeout(10000); // Configurar el test para que mocha lo espere durante 10 segundos
        const result = await productRepository.getProducts(1, 10);
        expect(Array.isArray(result)).to.be.ok;
    });

    it('Se debe obtener un producto según su ID', async () => {
        const mockProduct = {
            title: 'test de productos',
            description: 'Descripcion del produdcto',
            price: 900,
            thumbnail: 'Imagen',
            code: 'ABC123',
            status: true,
            stock: 56,
            category: 'laptops',
            owner: 'admin'
        }

        const newProduct = await productRepository.addProduct(mockProduct);
        const newProductId = newProduct.id;
        const findedProduct = await productRepository.getProductById(newProductId);

        expect(findedProduct.id).to.be.equal(newProduct.id);
    });

    it('Se debe crear un producto correctamente', async function () {
        const mockProduct = {
            title: 'test de productos',
            description: 'Descripcion del produdcto',
            price: 900,
            thumbnail: 'Imagen',
            code: 'ABC124',
            status: true,
            stock: 56,
            category: 'laptops',
            owner: 'admin'
        }

        const newProduct = await productRepository.addProduct(mockProduct);
        expect(newProduct.id).to.be.ok;
    })

    it('Imagen, owner y status se deben generar por automaticamente', async () => {
        const mockProduct = {
            title: 'test de productos',
            description: 'Descripcion del produdcto',
            price: 900,
            thumbnail: 'Imagen',
            code: 'ABC125',
            status: true,
            stock: 56,
            category: 'laptops',
            owner: 'admin'
        }

        const newProduct = await productRepository.addProduct(mockProduct);

        expect(newProduct.id).to.be.ok;
        expect(newProduct.thumbnail).to.be.equal('Sin Imagen')
        expect(newProduct.status).to.be.true
        expect(newProduct.thumbnail).to.be.equal('Sin Imagen')
    })

    it('El precio y el stock deben setearse como valores numericos', async () => {
        const mockProduct = {
            title: 'test de productos',
            description: 'Descripcion del produdcto',
            price: 900,
            thumbnail: 'Imagen',
            code: 'ABC126',
            status: true,
            stock: 56,
            category: 'laptops',
            owner: 'admin'
        }

        const newProduct = await productRepository.addProduct(mockProduct);

        expect(newProduct.price).to.equal(200);
        expect(newProduct.stock).to.equal(20);
    });

    it('El producto se actualiza de manera correcta', async () => {
        const mockProduct = {
            title: 'test de productos',
            description: 'Descripcion del produdcto',
            price: 900,
            thumbnail: 'Imagen',
            code: 'ABC127',
            status: true,
            stock: 56,
            category: 'laptops',
            owner: 'admin'
        }

        const newProduct = await productRepository.addProduct(mockProduct);
        const updatedProduct = await productRepository.updateProduct(newProduct.id, { title: 'updatedProduct', stock: 40 });
        const findedProduct = await productRepository.getProductById(newProduct.id);

        expect(updatedProduct.title).to.be.equal(findedProduct.title);
        expect(updatedProduct.stock).to.be.equal(findedProduct.stock);
    });
});