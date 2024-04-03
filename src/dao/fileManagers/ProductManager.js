const fs = require('fs');

class ProductManager {

    // Se declaran propiedades fuera del constructor para poder acceder a las mismas desde todos los métodos.
    #products;
    #lastProductId;
    path;

    constructor(path) {
        this.#products = [];
        this.path = path;
        this.#lastProductId = 1;
        this.#readFile();
    }

    // Método para leer el archivo en caso de ser posible y en caso contrario se crea un archivo con un array vacio en 'this.path'
    async #readFile() {
        try {
            // Se esepera respuesta sobre la existencia del archivvo en la dirección path
            const fileData = await fs.promises.readFile(this.path, 'utf-8');

            // Se parsean los productos en el archivo
            this.#products = JSON.parse(fileData);

            // Se actualiza el ID
            this.#updateLastProductId();
        } catch (error) {

            // Si el archivo no existe este se genera con un array vacio
            await this.#saveFile();
        }
    }

    // Actualización del ID para los productos
    #updateLastProductId() {

        // Dado a que #lastProductId inicializa en 1 se hace la operación de resta para obtener el último ID utilizando el largo del array
        const lastProduct = this.#products[this.#products.length - 1];

        if (lastProduct) {
            // Si ingrementa el último ID en 1
            this.#lastProductId = lastProduct.id + 1;
        }
    }

    async #saveFile() {

        // Se espera una respuesta. Hecho esto se convierte el array en json y se guarda la información en el archivo
        await fs.promises.writeFile(this.path, JSON.stringify(this.#products, null, 2), 'utf-8');
    }

    // Se genera un nuevo ID incremenando en 1 cada vez que se llama al método.
    #getNewId() {
        return this.#lastProductId++;
    }

    // Agregar un nuevo producto
    async addProduct(title, description, price, thumbnail, code, status, stock) {

        // Se comprueba que estos tres parámetros existan
        if (!title || !description || !code) {
            throw new Error('Debe completar todos los campos');
        }

        // Si no se carga nada en este parámetro se generará como true por defecto
        if (typeof status === 'undefined' || status === true || status === 'true') {
            status = true;
        } else {
            status = false;
        }

        // Si no se carga nada en este parámetro se genera un string 'Sin Imagen' por defecto
        if (!thumbnail) {
            thumbnail = 'Sin Imagen';
        } else {
            thumbnail;
        }

        // Se reciben los correspondientes parámetros y se parsean como tipo number
        const numericPrice = parseFloat(price)
        const numericStock = parseInt(stock)

        // Se hacen las pertinentes comprobaciones para el stock y el precio
        if (numericStock < 0 && numericPrice <= 0) {
            throw new Error('Asegúrese de que stock y price sean valores de tipo "number" superiores o iguales a 0');
        }

        // Se comprueba que el code de cada producto no esté repetido
        const existingProduct = await this.getProducts();
        const findProductCode = existingProduct.find(field => field.code === code)

        // Si todo es correcto se genera el nuevo producto con todas las comprobaciones realizadas
        if (!findProductCode) {

            // Porducto generado
            const product = { id: parseInt(this.#getNewId()), title, description, price: numericPrice, thumbnail, code, status, stock: numericStock };

            // Se agrega el producto al array
            this.#products.push(product);

            // Se llama al método de guardar para convertir el array en json y guardar la nueva información en el archivo 
            await this.#saveFile();
            console.log('Agregado Correctamente');
        } else {
            throw new Error('El código de producto ya existe');
        }
    }

    async getProducts() {
        try {

            // Se obtienen los productos 
            const fileContents = await fs.promises.readFile(this.path, 'utf-8');

            // Una vez obtenidos se parsean para retornarlos en el método
            const existingProduct = JSON.parse(fileContents);
            return existingProduct;
        } catch (err) {

            // En caso de que no haya productos se retorna un arrazy vacio
            return [];
        }
    }

    async getProductById(id) {

        const numericId = parseInt(id)
        // Se utiliza el método para obtener todos los productos
        const existingProducts = await this.getProducts();

        // Se filtran todos los productos buscando el ID pasado por parámetros
        const filterProductById = existingProducts.find(el => el.id === numericId);

        if (filterProductById) {
            return filterProductById;
        } else {
            throw new Error('Not Found: El ID solicitado no existe.');
        }
    }

    async updateProduct(id, updatedProduct) {

        const numericId = parseInt(id)
        // Se busca si el ID existe
        const indexToUpdate = this.#products.findIndex(el => el.id === numericId);

        // En caso de existir se actualiza el producto
        if (indexToUpdate !== -1) {
            const { id: updatedId, stock, price } = updatedProduct;

            // Comprobaciones para precio y stock
            if (stock <= 0 || price <= 0) {
                throw new Error('Asegúrese de que stock y price sean valores de tipo "number" superiores a 0');
            }

            // Comprobación para no atualizar el ID
            if (updatedId && updatedId !== id) {
                throw new Error('No se permite modificar el ID del producto');
            }

            // Se genera el producto actualizado
            this.#products[indexToUpdate] = { ...this.#products[indexToUpdate], ...updatedProduct, id };

            // Se guarda el nuevo producto en el archivo
            await this.#saveFile();
            console.log('Producto actualizado correctamente');
        } else {
            throw new Error('Not found: El ID solicitado no existe');
        }
    }

    async deleteProduct(id) {

        const numericId = parseInt(id)
        // Se busca el ID existente
        const indexToDelete = this.#products.findIndex(el => el.id === numericId);

        // En caso de que el ID exista se elimina el producto con 'splice'
        if (indexToDelete !== -1) {
            this.#products.splice(indexToDelete, 1);
            await this.#saveFile();
            console.log('Producto eliminado correctamente');
        } else {
            throw new Error('Not found: El ID solicitado no existe');
        }
    }
}

module.exports = ProductManager;