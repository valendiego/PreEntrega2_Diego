const { Carts, Products } = require('../../models');

class daoCart {

    constructor() { }

    async prepare() {
        // No hacer nada. 
        // Podríamos chequear que la conexión existe y está funcionando
        if (Carts.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
    }

    async verifyCartExists(cartId) {
        const cart = await Carts.findById(cartId);
        if (!cart) {
            throw new Error('El carrito no existe.');
        }
        return cart;
    }

    async verifyProductExists(productId) {
        const product = await Products.findById(productId);
        if (!product) {
            throw new Error('El producto no existe.');
        }
        return product;
    }

    // Se obtienen todos los carritos del archivo de forma similar que en ProductManager
    async getCarts() {
        try {
            const carts = await Carts.find();
            return carts;

        } catch {
            throw new Error('Error al importar los carritos');
        }
    }
    // Agregar un nuevo carrito
    async addCart() {
        try {
            const newCart = await Carts.create({
                products: []
            })
            return newCart;
        } catch {
            throw new Error('Error al agregar un nuevo carrito.')
        }
    }

    // Se obtienen los carritos por ID de manera similar que en ProductManager
    async getCartById(cartId) {
        try {
            let cart = await Carts.findOne({ _id: cartId }).populate('products.product');

            if (!cart) {
                throw new Error('El carrito no existe');
            }

            // Filtrar los productos que aún existen en la base de datos
            cart.products = cart.products.filter(item => item.product !== null);

            // Guardar el carrito actualizado sin los productos eliminados
            cart = await cart.save();

            return cart;
        } catch (err) {
            console.error(err);
            throw new Error('Hubo un error al obtener el ID del carrito.');
        }
    }

    // Agregar productos al carrito
    async addProductToCart(productId, cartId) {
        try {
            await this.verifyProductExists(productId);
            const cart = await this.verifyCartExists(cartId);

            // Verificar si el producto ya está en el carrito
            const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
            if (existingProductIndex !== -1) {
                // Si el producto existe, aumentar su cantidad en 1
                cart.products[existingProductIndex].quantity += 1;
            } else {
                // Si el producto no existe, agregarlo al carrito con cantidad 1
                cart.products.push({ product: productId, quantity: 1 });
            }

            // Guardar el carrito actualizado
            await cart.save();

            console.log('Producto agregado al carrito correctamente');
            return cart;
        } catch (error) {
            console.error('Error en addProductToCart:', error);
            throw new Error('Hubo un error al agregar un producto al carrito.');
        }
    }

    async deleteProductFromCart(productId, cartId) {
        try {
            await this.verifyProductExists(productId);
            const cart = await this.verifyCartExists(cartId);
            await cart.updateOne({ $pull: { products: { product: productId } } });
            console.log(`Se eliminó el producto ${productId} del carrito ${cartId}`);
        } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            throw new Error('Error al eliminar el producto del carrito');
        }
    }

    async updateCart(cartId, products) {
        try {
            const cart = await this.verifyCartExists(cartId);

            // Iterar sobre cada producto en el arreglo de productos
            for (const { product: productId, quantity } of products) {
                const product = await Products.findById(productId);
                if (!product) {
                    throw new Error(`El producto con ID ${productId} no existe.`);
                }

                // Verificar si el producto ya está en el carrito
                const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
                if (existingProductIndex !== -1) {
                    // Si el producto ya está en el carrito, actualizar la cantidad
                    cart.products[existingProductIndex].quantity += quantity;
                } else {
                    // Si el producto no está en el carrito, agregarlo
                    cart.products.push({ product: productId, quantity });
                }
            }

            // Guardar los cambios en el carrito
            await cart.save();

            console.log(`Se actualizó el carrito ${cartId}`);
        } catch (error) {
            console.error('Error al actualizar el carrito:', error);
            throw new Error('Error al actualizar el carrito');
        }
    }

    async updateProductQuantityFromCart(productId, cartId, quantity) {
        try {
            const product = await this.verifyProductExists(productId);
            console.log(product);

            const cart = await this.verifyCartExists(cartId);

            const existingProductIndex = cart.products.findIndex(p => p.product.equals(productId));
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity = quantity;

                await cart.save();

                console.log(`Cantidad del producto ${productId} actualizada en el carrito ${cartId}`);
            } else {
                throw new Error('No se pudo encontrar el producto en el carrito');
            }
        } catch (error) {
            console.error('Hubo un error al actualizar la cantidad del producto:', error);
            throw new Error('Hubo un error al actualizar la cantidad del producto.');
        }
    }

    async clearCart(cartId) {
        try {
            await this.verifyCartExists(cartId);
            await Carts.updateOne({ _id: cartId }, { $set: { products: [] } });
        } catch {
            throw new Error('Hubo un error al vaciar el carrito.')
        }
    }

    async deleteCartById(cartId) {
        try {
            await this.verifyCartExists(cartId);
            await Carts.deleteOne({ _id: cartId });
        } catch {
            throw new Error('Hubo un problema al eliminar el carrito');
        }
    }
};

module.exports = daoCart;