require('dotenv').config();
const { CustomError } = require('../utils/errors/customErrors');
const { ErrorCodes } = require('../utils/errors/errorCodes');
const nodemailer = require('nodemailer');

class MailingService {
    constructor() { }

    async sendMail(email) {
        try {

            const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);


            const transport = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.GOOGLE_MAIL,
                    pass: process.env.GOOGLE_PASS
                }
            });

            await transport.sendMail({
                from: 'Servicio Backend App',
                to: email,
                subject: 'BackendApp | Restablecer contraseña',
                html: `
            <div>
                <h2>Ingrese al link para poder restablecer su contraseña</h2>
                <h4>Tenga en cuenta que el link de restablecimiento tiene una duración de una hora. Si este plazo se vence deberá generar un nuevo link.</h4>
                <a href="http://localhost:8080/resetPassword/${randomNumber}">Restablecer contraseña</a>
            </div>`,
                attachments: []
            });
            return { randomNumber, email }
        } catch (error) {
            throw CustomError.createError({
                name: 'Error al restablecer contraseña',
                cause: 'Ocurrió un error y no se pudo enviar el email al destinatario.',
                message: 'No se pudo enviar el email',
                code: ErrorCodes.UNDEFINED_USER
            })
        }
    }
}

module.exports = { MailingService };