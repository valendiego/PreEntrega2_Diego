class ProductViewDTO {
    constructor({ title, description, price, thumbnail, code, status, stock, category, id, isLoggedIn }) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.status = status;
        this.stock = stock;
        this.category = category;
        this.id = id;
        this.isLoggedIn = isLoggedIn;
    }
}

module.exports = { ProductViewDTO };