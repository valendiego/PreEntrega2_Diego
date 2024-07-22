const { Products } = require('./models');

class ProductDAO {
    async getProducts(query, options) {
        const products = await Products.paginate(query, options);
        return products || [];
    }

    async getProductById(id) {
        return await Products.findById(id);
    }

    async addProduct(product) {
        return await Products.create(product);
    }

    async updateProduct(id, product) {
        return await Products.updateOne({ _id: id }, { $set: product });
    }

    async deleteProduct(id) {
        return await Products.deleteOne({ _id: id });
    }

    async findByCode(code) {
        return await Products.findOne({ code });
    }
}

module.exports = ProductDAO;