
const { Router } = require('express');
const router = Router();

router.get('/', async (_, res) => {
    try {
        res.render('chat', {
            titlePage: 'Chat en Vivo',
            useWS: true,
            useSweetAlert: true,
            style: ['styles.css'],
            script: ['chat.js']
        });
    } catch (error) {
        console.error('Error al obtener los mensajes:', error);
        res.status(500).json({ Error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { user, message } = req.body;
        res.status(201).json({ message: 'Mensaje enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
});

module.exports = router;
