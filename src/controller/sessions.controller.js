require('dotenv').config(); // Carga las variables de entorno desde .env
const { Router } = require('express');
const router = Router();
const { generateToken } = require('../utils/jwt');
const cookieParser = require('cookie-parser');
const daoUsers = require('../dao/mongo/daoUsers');

router.use(cookieParser());

class Controller {
    constructor() { }

    redirect(res) {
        try {
            res.redirect('/');
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    logError(res) {
        try {
            res.send('Hubo un error al identificar sus credenciales.');
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    login(req, res) {
        try {
            let user;
            if (req.user && req.user.email === process.env.ADMIN_USER) {
                user = req.user;
            } else {
                user = {
                    email: req.user.email,
                    _id: req.user._id.toString(),
                    rol: req.user.rol,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    age: req.user.age,
                    cart: req.user.cart ? req.user.cart._id : null
                };
            }
            const accessToken = generateToken(user);
            res.cookie('accessToken', accessToken, { maxAge: 60 * 5 * 1000, httpOnly: true });
            res.redirect('/');
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    current(req, res) {
        try {
            const user = {
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                age: req.user.age,
                email: req.user.email,
                rol: req.user.rol,
                cart: req.user.cart
            }
            res.json(user);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    githubCb(req, res) {
        try {
            // Envía el token JWT al cliente
            res.cookie('accessToken', req.user.accessToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            res.redirect('/');
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    logout(res) {
        try {
            res.clearCookie('accessToken'); // Elimina la cookie llamada 'accessToken'
            res.redirect('/');
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const { email } = req.body;
            await new daoUsers().deleteUser(email);
            res.json({ message: 'Usuario eliminado correctamente.' });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}

module.exports = { Controller };