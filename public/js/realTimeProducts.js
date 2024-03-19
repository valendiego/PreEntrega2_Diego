const socket = io();

// Escuchar el evento 'newProduct' enviado desde el servidor cuando se agrega un nuevo producto
socket.on('newProduct', (newProduct) => {

    // Manejo del DOM para generar el nuevo producto en el HTML
    const container = document.getElementById('productFeed');

    const divContainer = document.createElement('div');
    divContainer.classList.add('product');

    const title = document.createElement('h4');
    title.innerText = newProduct.title;

    const thumbnail = document.createElement('img');
    thumbnail.setAttribute('src', newProduct.thumbnail);
    thumbnail.setAttribute('alt', newProduct.thumbnail);

    const divInfo = document.createElement('div');
    divInfo.classList.add('product__info');

    const description = document.createElement('p');
    description.innerText = newProduct.description;

    const price = document.createElement('p');
    price.innerText = `Precio: ${newProduct.price}`;

    const stock = document.createElement('p');
    stock.innerText = `Stock: ${newProduct.stock}`;

    const code = document.createElement('p');
    code.innerText = `Código: ${newProduct.code}`;

    divInfo.append(description, price, stock, code);
    divContainer.append(title, thumbnail, divInfo);
    container.append(divContainer);
})

// Escuchar el evento 'updateFeed' enviado desde el servidor cuando se actualiza la lista de productos
socket.on('updateFeed', (products) => {

    // Manejo del DOM para generar el nuevo producto en el HTML
    const container = document.getElementById('productFeed');
    container.innerHTML = '';

    products.forEach((product) => {
        const divContainer = document.createElement('div');
        divContainer.classList.add('product');

        const title = document.createElement('h4');
        title.innerText = product.title;

        const thumbnail = document.createElement('img');
        thumbnail.setAttribute('src', product.thumbnail);
        thumbnail.setAttribute('alt', product.thumbnail);

        const divInfo = document.createElement('div');
        divInfo.classList.add('product__info');

        const description = document.createElement('p');
        description.innerText = product.description;

        const price = document.createElement('p');
        price.innerText = `Precio: ${product.price}`;

        const stock = document.createElement('p');
        stock.innerText = `Stock: ${product.stock}`;

        const code = document.createElement('p');
        code.innerText = `Código: ${product.code}`;

        divInfo.append(description, price, stock, code);
        divContainer.append(title, thumbnail, divInfo);
        container.append(divContainer);
    })
})