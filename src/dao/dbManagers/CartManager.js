const { Carts, Products } = require('../models');

class CartManager {

    constructor() { }

    async prepare() {
        // No hacer nada. 
        // Podríamos chequear que la conexión existe y está funcionando
        if (Carts.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
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
            await Carts.create({
                products: []
            })
        } catch {
            throw new Error('Error al agregar un nuevo carrito.')
        }
    }

    // Se obtienen los carritos por ID de manera similar que en ProductManager
    async getCartById(cartId) {
        try {
            const cart = await Carts.findOne({ _id: cartId });
            return cart
        } catch {
            throw new Error('Hubo un error al obtener el ID del carrito.')
        }
    }

    // Agregar productos al carrito
    async addProductToCart(productId, cartId) {
        try {
            // Verificar si el ID del producto existe en la colección Products
            const product = await Products.findOne({ _id: productId });
            if (!product) {
                throw new Error('El ID de producto no existe');
            }

            // Verificar si el ID del carrito existe en la colección Carts
            const cart = await Carts.findOne({ _id: cartId });
            if (!cart) {
                throw new Error('El ID de carrito no existe');
            }

            // Verificar si el producto ya está en el carrito
            const existingProductIndex = cart.products.findIndex(p => p.id === productId);
            if (existingProductIndex !== -1) {
                // Si el producto existe, aumentar su cantidad en 1
                cart.products[existingProductIndex].quantity += 1;
            } else {
                // Si el producto no existe, agregarlo al carrito con cantidad 1
                cart.products.push({ id: productId, quantity: 1 });
            }

            // Actualizar el carrito en la colección Carts
            await Carts.updateOne({ _id: cartId }, cart);

            console.log('Producto agregado al carrito correctamente');
            return cart;
        } catch (error) {
            console.error('Error en addProductToCart:', error);
            throw new Error('Hubo un error al agregar un producto al carrito.');
        }
    }

};

module.exports = CartManager;