class ProductService {
    constructor() { }

    async validateAndFormatAddProduct(title, description, price, thumbnail, code, status, stock, category) {
        try {
            // Validaciones y asignaciones de valores predeterminados

            const invalidOptions = isNaN(+price) || +price <= 0 || isNaN(+stock) || +stock < 0;

            if (!title || !description || !code || !category || invalidOptions) {
                throw new Error('Error al validar los datos');
            };

            const finalThumbnail = thumbnail ? thumbnail : 'Sin Imagen';

            // Si no se carga nada en este parámetro se generará como true por defecto
            if (typeof status === 'undefined' || status === true || status === 'true') {
                status = true;
            } else {
                status = false;
            }

            const product = {
                title,
                description,
                price,
                thumbnail: finalThumbnail,
                code,
                status,
                stock,
                category
            }

            return product;
        } catch (e) {
            console.error('Error al agregar un producto en el servicio.', e);
            throw new Error('Error al agregar un producto en el servicio.');
        }
    }

    async validateAndFormatGetProductsParams(page, limit, sort, category, availability) {
        try {
            const query = {
                ...(category && { category }),
                ...(availability && { status: availability === 'true' })
            };

            const options = {
                limit: limit ? parseInt(limit) : 1000,
                page: parseInt(page),
                sort: sort ? { price: sort } : undefined,
                lean: true
            };

            if (isNaN(page)) {
                throw new Error('Número de página no válido');
            }

            return { query, options };
        } catch (error) {
            throw new Error('Error al validar los parámetros de consulta');
        }
    }
}

module.exports = { ProductService };