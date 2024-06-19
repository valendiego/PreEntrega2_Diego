require('dotenv').config();
const nodemailer = require('nodemailer');

class Controller {
    constructor() { }

    async sendMail(req, res) {
        try {
            const transport = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.GOOGLE_MAIL,
                    pass: process.env.GOOGLE_PASS
                }
            })

            let result = await transport.sendMail({
                from: 'Mail Test',
                to: 'valentinadiego90@gmail.com',
                subject: 'Correo de pruebas',
                html: `
            <div>
                <h1>Test de correo</h1>
            </div>`,
                attachments: []
            })

            res.status(200).json(result);
        } catch (error) {
            req.logger.error(error);
            res.status(500).json('Error al enviar el mail')
        }
    }
}

module.exports = { Controller }