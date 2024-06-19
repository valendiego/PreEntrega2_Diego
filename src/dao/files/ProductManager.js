const fs = require('fs').promises;

class ProductDAO {
    #products;
    #lastProductId;

    constructor(path) {
        this.path = path;
        this.#products = [];
        this.#lastProductId = 1;
        this.#readFile();
    }

    async #readFile() {
        try {
            const fileData = await fs.readFile(this.path, 'utf-8');
            this.#products = JSON.parse(fileData);
            this.#updateLastProductId();
        } catch (error) {
            await this.#saveFile();
        }
    }

    #updateLastProductId() {
        const lastProduct = this.#products[this.#products.length - 1];
        if (lastProduct) {
            this.#lastProductId = lastProduct.id + 1;
        }
    }

    async #saveFile() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.#products, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
            throw error;
        }
    }

    #getNewId() {
        return this.#lastProductId++;
    }

    async getProducts() {
        try {
            const fileContents = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(fileContents);
        } catch (err) {
            return [];
        }
    }

    async getProductById(id) {
        const numericId = parseInt(id);
        const product = this.#products.find(p => p.id === numericId);
        if (product) {
            return product;
        } else {
            throw new Error('Not Found: El ID solicitado no existe.');
        }
    }

    async addProduct(product) {
        product.id = this.#getNewId();
        this.#products.push(product);
        await this.#saveFile();
    }

    async updateProduct(id, updatedProduct) {
        const numericId = parseInt(id);
        const index = this.#products.findIndex(p => p.id === numericId);

        if (index !== -1) {
            this.#products[index] = { ...this.#products[index], ...updatedProduct, id: numericId };
            await this.#saveFile();
        } else {
            throw new Error('Not Found: El ID solicitado no existe');
        }
    }

    async deleteProduct(id) {
        const numericId = parseInt(id);
        this.#products = this.#products.filter(p => p.id !== numericId);
        await this.#saveFile();
    }
}

module.exports = ProductDAO;