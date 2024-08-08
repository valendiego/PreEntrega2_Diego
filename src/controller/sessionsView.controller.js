const { Router } = require('express');
const router = Router();
const cookieParser = require('cookie-parser');
const { UserRepository } = require('../repository/user.repository');

router.use(cookieParser());

class Controller {

    #userRepository;

    constructor() {
        this.#userRepository = new UserRepository();
    }

    index(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;

            if (isLoggedIn) {
                const cartId = req.user.cart
                res.render('sessionStart', {
                    titlePage: 'Login/Register',
                    isLoggedIn,
                    isNotLoggedIn: !isLoggedIn,
                    style: ['styles.css'],
                    cartId
                });
            } else {
                res.render('sessionStart', {
                    titlePage: 'Login/Register',
                    isLoggedIn,
                    isNotLoggedIn: !isLoggedIn,
                    style: ['styles.css'],
                });
            }
        } catch (e) {
            res.status(500).json({ error: e.messange });
        }
    }

    login(res) {
        try {
            const isProduction = process.env.LOGGER_ENV === 'production';
            console.log(isProduction);
            res.render('login', {
                style: ['styles.css'],
                title: 'Login',
                isProduction: !isProduction
            });
        } catch (e) {
            res.status(500).json({ error: e.messange });
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.#userRepository.loginUser(email, password);
            res.cookie('accessToken', user.accessToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            req.logger.info('Usuario identificado');
            res.status(200).redirect('/users');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    register(res) {
        try {
            res.render('register', {
                style: ['styles.css'],
                title: 'Register'
            });
        } catch (e) {
            res.status(500).json({ error: e.messange });
        }
    }

    async registerUser(req, res) {
        try {
            const { firstName, lastName, email, password } = req.body;
            await this.#userRepository.registerUser(firstName, lastName, email, password);
            req.logger.info('Usuario registrado correctamente');
            res.status(201).redirect('/users');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    profile(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const adminOptions = req.user.rol === 'admin' || req.user.rol === 'superAdmin';
            if (isLoggedIn) {
                const cartId = req.user.cart
                const user = {
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    email: req.user.email,
                    rol: req.user.rol,
                    id: req.user.id
                }

                res.render('profile', {
                    style: ['styles.css'],
                    titlePage: 'Perfil',
                    user: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        rol: user.rol,
                        id: user.id
                    },
                    isLoggedIn,
                    cartId,
                    adminOptions,
                    notAdminOptions: !adminOptions
                });
            } else {
                return res.status(403).json({ Error: 'Debe logearse para poder acceder.' })
            }
        } catch (err) {
            res.status(500).json({ Error: err.message })
        }
    }

    async logout(req, res) {
        try {
            if (req.user && (req.user.rol === 'user' || req.user.rol === 'premium')) {
                const uid = req.user.id;
                await this.#userRepository.updateConnection(uid);
            }
            res.clearCookie('accessToken');
            req.logger.info('Sesión finalizada');
            res.status(200).redirect('/users');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    resetPasswordGet(res) {
        try {
            res.render('sendMailToResetPassword', {
                titlePage: 'Send Token',
                style: ['styles.css']
            });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async sendMailToResetPassword(req, res) {
        try {
            const { email } = req.body;
            const tokenPass = await this.#userRepository.sendMailToResetPassword(email);
            res.cookie('passToken', tokenPass, { maxAge: 60 * 60 * 1000, httpOnly: true });
            req.logger.info('Email enviado');
            res.redirect('/users/resetPasswordWarning');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error })
        }
    }

    resetPasswordWarning(req, res) {
        try {
            const passToken = req.cookies.passToken !== undefined;
            res.render('resetPasswordWarning', {
                titlePage: 'Reset Password',
                style: ['styles.css'],
                passToken,
                notPassToken: !passToken
            });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    verifyResetPassword(req, res) {
        try {
            const tid = req.params.tid;
            const passToken = req.cookies.passToken;
            if (!passToken) {
                return res.redirect('/users/resetPasswordWarning');
            }
            return res.render('resetPassword', {
                titlePage: 'Reset Password',
                style: ['styles.css'],
                tid
            });
        } catch (err) {
            res.status(500).json({ Error: err.message });
        }
    }

    async resetPasswordPost(req, res) {
        try {
            const urlToken = req.params.tid
            const token = req.passToken;
            const { newPassword, confirmPassword } = req.body;
            if (!token) {
                req.logger.info('El token ha expirado');
                return res.redirect('/users/resetPassword');
            }
            const updatePassword = await this.#userRepository.resetPassword(urlToken, token, newPassword, confirmPassword);
            res.clearCookie('passToken');
            if (!updatePassword) {
                req.logger.info('No se pudo actualizar la contraseña');
                return res.redirect('/users');
            }
            req.logger.info('Contraseña actualizada');
            return res.redirect('/users/login');
        } catch (error) {
            // req.logger.error(error);
            console.log(error);
            // return res.status(error.status).json({ error });
        }
    }

    documents(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const userId = req.user.id;
            res.render('documents', {
                titlePage: 'Actualizar Documentos',
                style: ['styles.css'],
                isLoggedIn,
                isNotLoggedIn: !isLoggedIn,
                userId
            });
        } catch (error) {
            res.status(500).json({ Error: error.message })
        }
    }

    async uploadDocuments(req, res) {
        try {
            const userId = req.params.uid;
            const files = req.files;
            const user = await this.#userRepository.updateUserDocuments(userId, files);
            req.logger.info('Documentación actualizada exitosamente');
            if (user.documents.length === 3) {
                res.clearCookie('accessToken');
                return res.status(201).redirect('/users')
            }
            res.status(201).redirect('/users/profile');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async getUsers(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const users = await this.#userRepository.getUsers();
            const usersPayload = users.map(user => ({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, rol: user.rol }));
            const cartId = req.user.cart
            req.logger.info('Usuarios retornados');
            res.status(200).render('getUsers', {
                users: usersPayload,
                titlePage: 'Menú de Usuarios',
                style: ['styles.css'],
                script: ['scripts.js'],
                isLoggedIn,
                isNotLoggedIn: !isLoggedIn,
                cartId
            });
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async changeRole(req, res) {
        try {
            const uid = req.params.uid;
            await this.#userRepository.changeRole(uid);
            req.logger.info(`Rol del usuario actualizado`);
            return res.redirect(`/users/${uid}`);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async deleteUsers(req, res) {
        try {
            await this.#userRepository.deleteUsers();
            req.logger.info('Se las cuentas que se encontraban en desuso');
            res.status(204).redirect('/users/getUsers');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async getUserById(req, res) {
        try {
            const isLoggedIn = req.cookies.accessToken !== undefined;
            const userId = req.params.uid;
            const user = await this.#userRepository.getUserById(userId);
            const documentsQuantity = user.documents.length;
            const cartId = req.user.cart;
            const userPayload = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                rol: user.rol,
                cartId: user.cart,
                documents: documentsQuantity,
                picture: user.picture
            }

            res.status(200).render('userView', {
                titlePage: 'Menú de Usuarios',
                style: ['styles.css'],
                script: ['scripts.js'],
                isLoggedIn,
                isNotLoggedIn: !isLoggedIn,
                user: [userPayload],
                cartId
            })
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.uid;
            const user = await this.#userRepository.getUserById(userId);
            await this.#userRepository.deleteUser(user.email);
            req.logger.info('Usuario eliminado correctamente');
            res.status(204).redirect('/users/getUsers');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }
}

module.exports = { Controller };