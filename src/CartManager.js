const fs = require('fs');
const ProductManager = require('./ProductManager');
const manager = new ProductManager(`${__dirname}/../assets/products.json`);

class CartManager {
    #carts;
    #lastCartId;
    path;

    constructor(path) {
        this.#carts = [];
        this.path = path;
        this.#lastCartId = 1;
        this.#readFile();
    }

    async #readFile() {
        try {
            const fileData = await fs.promises.readFile(this.path, 'utf-8');
            this.#carts = JSON.parse(fileData);
            this.#updateLastCartId();
        } catch (error) {
            await this.#saveFile();
        }
    }

    #updateLastCartId() {
        const lastCart = this.#carts[this.#carts.length - 1];
        if (lastCart) {
            this.#lastCartId = lastCart.id + 1;
        }
    }

    async #saveFile() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.#carts, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
            throw error;
        }
    }


    #getNewId() {
        return this.#lastCartId++;
    }

    async getCarts() {
        try {
            const fileContents = await fs.promises.readFile(this.path, 'utf-8');
            const existingCart = JSON.parse(fileContents);
            return existingCart;
        } catch (err) {
            return [];
        }
    }

    async addCart() {
        try {
            const cart = { id: this.#getNewId(), products: [] }
            this.#carts.push(cart);
            await this.#saveFile();
            console.log('Nuevo carrito creado')
        } catch {
            throw new Error('Hubo un error al generar el carrito');
        }
    }

    async getCartById(cartId) {
        const existingCart = await this.getCarts();
        const filterCartById = existingCart.find(c => c.id === cartId);
        if (filterCartById) {
            return filterCartById;
        } else {
            throw new Error('Not Found: No existe el ID de carrito');
        }
    }

    async addProductToCart(productId, cartId) {
        try {
            const product = await manager.getProductById(productId);
            const cart = await this.getCartById(cartId);

            const existingProduct = cart.products.find(p => p.id === productId);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                const productToAdd = { id: product.id, quantity: 1 };
                cart.products.push(productToAdd);
            }

            const updatedCarts = await this.getCarts();
            const indexToUpdate = updatedCarts.findIndex(c => c.id === cartId);
            if (indexToUpdate !== -1) {
                updatedCarts[indexToUpdate] = cart;
                this.#carts = updatedCarts;
                await this.#saveFile();
                console.log('Producto agregado al carrito correctamente');
                return cart;
            } else {
                throw new Error('No se encontró el carrito para actualizar');
            }

        } catch (error) {
            console.error('Error en addProductToCart:', error);
            throw new Error('Error al cargar el producto al archivo');
        }
    }


};

module.exports = CartManager;