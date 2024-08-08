document.querySelectorAll('form[data-method="DELETE"]').forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        const actionUrl = form.action.replace('https://', 'http://'); // Asegurarse de que se usa HTTP

        fetch(actionUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (response.ok) {
                    console.log('Producto eliminado exitosamente');
                    window.location.reload();
                } else {
                    console.error('Error al eliminar el producto', response.statusText);
                    throw new Error('Error al eliminar el producto');
                }
            })
            .catch(error => {
                window.location.reload();
                console.error('Error:', error);
            });
    });
}); 