const fs = require('fs').promises;

class CartDAO {
    constructor(path) {
        this.path = path;
        this.carts = [];
        this.lastCartId = 1;
        this.#readFile();
    }

    async #readFile() {
        try {
            const fileData = await fs.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(fileData);
            this.#updateLastCartId();
        } catch (error) {
            await this.#saveFile();
        }
    }

    #updateLastCartId() {
        const lastCart = this.carts[this.carts.length - 1];
        if (lastCart) {
            this.lastCartId = lastCart.id + 1;
        }
    }

    async #saveFile() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
            throw error;
        }
    }

    #getNewId() {
        return this.lastCartId++;
    }

    async getCarts() {
        try {
            const fileContents = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(fileContents);
        } catch (err) {
            return [];
        }
    }

    async getCartById(id) {
        const numericId = parseInt(id);
        const cart = this.carts.find(c => c.id === numericId);
        if (cart) {
            return cart;
        } else {
            throw new Error('Not Found: No existe el ID de carrito');
        }
    }

    async addCart() {
        const cart = { id: this.#getNewId(), products: [] };
        this.carts.push(cart);
        await this.#saveFile();
        return cart;
    }

    async updateCart(id, data) {
        const numericId = parseInt(id);
        const index = this.carts.findIndex(c => c.id === numericId);
        if (index !== -1) {
            this.carts[index] = { ...this.carts[index], ...data };
            await this.#saveFile();
            return this.carts[index];
        } else {
            throw new Error('No se encontró el carrito para actualizar');
        }
    }

    async deleteCart(id) {
        const numericId = parseInt(id);
        this.carts = this.carts.filter(c => c.id !== numericId);
        await this.#saveFile();
    }

    async addProductToCart(productId, cartId) {
        const numericProductId = parseInt(productId);
        const numericCartId = parseInt(cartId);
        const cart = await this.getCartById(numericCartId);

        const existingProduct = cart.products.find(p => p.id === numericProductId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ id: numericProductId, quantity: 1 });
        }

        await this.updateCart(numericCartId, { products: cart.products });
        return cart;
    }
}

module.exports = CartDAO;