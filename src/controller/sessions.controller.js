const { UserRepository } = require('../repository/user.repository');

class Controller {

    #userRepository

    constructor() {
        this.#userRepository = new UserRepository();
    }

    async registerUser(req, res) {
        try {
            const { firstName, lastName, email, password } = req.body;
            const user = await this.#userRepository.registerUser(firstName, lastName, email, password);
            req.logger.info('Usuario registrado')
            res.status(201).json(user);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.#userRepository.loginUser(email, password);
            res.cookie('accessToken', user.accessToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            req.logger.info('Usuario identificado');
            res.redirect('/');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async sendMailToResetPassword(req, res) {
        try {
            const { email } = req.body;
            const tokenPass = await this.#userRepository.sendMailToResetPassword(email);
            res.cookie('passToken', tokenPass, { maxAge: 60 * 60 * 1000, httpOnly: true });
            req.logger.info('Email enviado');
            res.redirect('/resetPasswordWarning');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error })
        }
    }

    async resetPassword(req, res) {
        try {
            const urlToken = req.params.tid
            const token = req.passToken;
            const { newPassword, confirmPassword } = req.body;
            if (!token) {
                req.logger.info('El token ha expirado');
                return res.redirect('/resetPassword');
            }
            const updatePassword = await this.#userRepository.resetPassword(urlToken, token, newPassword, confirmPassword);
            res.clearCookie('passToken');
            if (!updatePassword) {
                req.logger.info('No se pudo actualizar la contraseña');
                return res.redirect('/');
            }
            req.logger.info('Contraseña actualizada');
            return res.redirect('/login');
        } catch (error) {
            req.logger.error(error);
            return res.status(error.status).json({ error });
        }
    }

    async githubLogin(req, res) {
        try {
            const profile = req.user;
            const { accessToken, user } = await this.#userRepository.githubLogin(profile);
            req.logger.info('Usuario identificado')
            res.status(200).json({ accessToken, user });
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    githubCb(req, res) {
        try {
            res.cookie('accessToken', req.user.accessToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            res.redirect('/');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    logout(req, res) {
        try {
            res.clearCookie('accessToken');
            req.logger.info('Sesión finalizada');
            res.redirect('/');
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    redirect(res) {
        try {
            res.redirect('/');
        } catch (error) {
            res.status(error.status).json({ error });
        }
    }

    async deleteUser(req, res) {
        try {
            const { email } = req.body;
            await this.#userRepository.deleteUser(email);
            res.logger.info('Usuario eliminado correctamente');
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async current(req, res) {
        try {
            const user = req.user
            req.logger.info(JSON.stringify(user, null, 2));
            res.json(user);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }

    async changeRole(req, res) {
        try {
            const uid = req.params.uid;
            const user = await this.#userRepository.changeRole(uid);
            req.logger.info(`Rol del usuario actualizado a ${user.rol}`);
            res.clearCookie('accessToken');
            return res.json(user);
        } catch (error) {
            req.logger.error(error);
            res.status(error.status).json({ error });
        }
    }
}

module.exports = { Controller };