const fs = require('fs').promises;

class ProductManager {

    #products;
    #lastProductId;
    path;

    constructor(path) {
        this.#products = [];
        this.path = path;
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
        await fs.writeFile(this.path, JSON.stringify(this.#products, null, 2), 'utf-8');
    }

    #getNewId() {
        return this.#lastProductId++;
    }

    async addProduct(title, description, price, thumbnail, code, stock) {
        if (!title || !description || !thumbnail || !code) {
            console.error('Debe completar todos los campos');
            return;
        }

        if (stock <= 0 && price <= 0) {
            console.error('Asegurese de que stock y price sean valores de tipo "number" superiores o iguales a 0');
            return;
        }

        const existingProduct = await this.getProducts();
        const findProductCode = existingProduct.find(field => field.code === code)

        if (!findProductCode) {
            const product = { id: this.#getNewId(), title, description, price, thumbnail, code, stock };
            this.#products.push(product);
            await this.#saveFile();
            console.log('Agregado Correctamente');
        } else {
            console.error('El código de producto ya existe');
        }
    }

    async getProducts() {
        try {
            const fileContents = await fs.readFile(this.path, 'utf-8');
            const existingProduct = JSON.parse(fileContents);
            return existingProduct
        } catch (err) {
            return [];
        }
    }

    async getProductById(id) {
        const existingProducts = await this.getProducts();
        const filterProductById = existingProducts.find(el => el.id === id);
        if (filterProductById) {
            console.log('Producto filtrado por ID: ↓');
            console.log(filterProductById);
            return filterProductById;
        } else {
            console.error('Not Found: El ID solicitado no existe.');
        }
    }

    async updateProduct(id, updatedProduct) {
        const indexToUpdate = this.#products.findIndex(el => el.id === id);

        if (indexToUpdate !== -1) {
            const { id: updatedId, stock, price } = updatedProduct;

            if (stock <= 0 || price <= 0) {
                console.error('Asegúrese de que stock y price sean valores de tipo "number" superiores a 0');
                return;
            }

            if (updatedId && updatedId !== id) {
                console.error('No se permite modificar el ID del producto');
                return;
            }

            this.#products[indexToUpdate] = { ...this.#products[indexToUpdate], ...updatedProduct, id };
            await this.#saveFile();
            console.log('Producto actualizado correctamente');
        } else {
            console.error('Not found: El ID solicitado no existe');
        }
    }

    async deleteProduct(id) {
        const indexToDelete = this.#products.findIndex(el => el.id === id);
        if (indexToDelete !== -1) {
            this.#products.splice(indexToDelete, 1);
            await this.#saveFile();
            console.log('Producto eliminado correctamente');
        } else {
            console.error('Not found: El ID solicitado no existe');
        }
    }
}

module.exports = ProductManager;