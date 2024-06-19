const { Products } = require('./models');

class ProductDAO {
    async getProducts(query, options) {
        return await Products.paginate(query, options);
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
}

module.exports = ProductDAO;