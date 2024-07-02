require('dotenv').config();
const UserDAO = require('../dao/mongo/users.dao');
const CartDAO = require('../dao/mongo/carts.dao');
const { hashPassword, isValidPassword } = require('../utils/hashing');
const { generateToken, generatePasswordRecoveryToken } = require('../middlewares/jwt.middleware');
const { UserDTO } = require('../dto/user.dto');
const { CustomError } = require('../utils/errors/customErrors');
const { ErrorCodes } = require('../utils/errors/errorCodes');
const { generateInvalidCredentialsUserData } = require('../utils/errors/errors');
const { MailingService } = require('../utils/mailingService');

class UserRepository {

    #userDAO;
    #cartDAO;
    #adminUser;
    #superAdminUser;

    constructor() {
        this.#userDAO = new UserDAO();
        this.#cartDAO = new CartDAO();

        this.#adminUser = {
            _id: 'admin',
            firstName: 'Luciano',
            lastName: 'Staniszewski',
            age: 18,
            email: process.env.ADMIN_USER,
            password: process.env.ADMIN_PASS,
            rol: 'admin',
        };

        this.#superAdminUser = {
            _id: 'superAdmin',
            firstName: 'Federico',
            lastName: 'Di Iorio',
            age: 28,
            email: process.env.SADMIN_USER,
            password: process.env.SADMIN_PASS,
            rol: 'superAdmin',
        };
    }

    #validateLoginCredentials(email, password) {
        if (!email || !password) {
            throw CustomError.createError({
                name: 'Credenciales inválidas',
                cause: generateInvalidCredentialsUserData(email, password),
                message: 'Debe ingresar un usuario y contraseña válidas',
                code: ErrorCodes.INVALID_CREDENTIALS,
                status: 401
            })
        }
    }

    async #generateNewUser(firstName, lastName, age, email, password, cart) {
        try {
            this.#validateLoginCredentials(email, password);
            if (age <= 0) {
                throw CustomError.createError({
                    name: 'Error en la edad',
                    cause: 'Debe ingresar un número válido mayor a 0',
                    message: 'Edad inválida',
                    code: ErrorCodes.AGE_VALIDATION_ERROR,
                    status: 400
                })
            }
            const hashedPassword = hashPassword(password);

            const user = {
                firstName: firstName || 'Usuario',
                lastName: lastName || 'Sin Identificar',
                age: age ? parseInt(age) : "",
                email,
                password: hashedPassword,
                cart
            };

            return user;
        } catch (error) {
            throw CustomError.createError({
                name: 'Error de registro',
                cause: 'Ocurrió un error al registrar el usuario en la base de datos',
                message: 'Algo salió mal al generar un nuevo usuario',
                error: ErrorCodes.USER_REGISTER_ERROR,
                otherProblems: error,
                status: error.status || 500
            })
        }

    }

    #generateAccessToken(user) {
        return generateToken({
            email: user.email,
            id: user._id,
            rol: user.rol,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            cart: user.cart,
        });
    }

    async registerUser(firstName, lastName, age, email, password) {
        try {
            if (email === this.#adminUser.email || email === this.#superAdminUser.email) {
                throw CustomError.createError({
                    name: 'Error de registro',
                    cause: 'No se puede registrar el usuario administrador o superadministrador de esta manera',
                    message: 'No tiene permisos para registrar estos usuarios',
                    code: ErrorCodes.ADMIN_USER_REGISTRATION_ERROR,
                    status: 400
                })
            }

            const existingUser = await this.#userDAO.findByEmail(email);
            if (existingUser) {
                throw CustomError.createError({
                    name: 'Error de registro',
                    cause: 'El email se encuentra registrado en la base de datos. Intente válidar sus credenciales.',
                    message: 'El email ya está registrado',
                    code: ErrorCodes.EMAIL_ALREADY_REGISTERED,
                    status: 409
                })
            }

            const cart = await this.#cartDAO.addCart({ products: [] });
            const user = await this.#generateNewUser(firstName, lastName, age, email, password, cart);

            return await this.#userDAO.create(user);
        } catch (error) {
            throw CustomError.createError({
                name: 'Error de registro',
                cause: 'Algo salió mal al registrar un nuevo usuario.',
                message: 'No se pudo crear un nuevo usuario',
                code: ErrorCodes.USER_REGISTER_ERROR,
                otherProblems: error,
                status: error.status || 500
            })
        }

    }

    async loginUser(email, password) {
        try {
            this.#validateLoginCredentials(email, password);

            let user;

            if (email === this.#adminUser.email && password === this.#adminUser.password) {
                user = this.#adminUser;
            } else if (email === this.#superAdminUser.email && password === this.#superAdminUser.password) {
                user = this.#superAdminUser;
            } else {
                user = await this.#userDAO.findByEmail(email);


                if (!user || !isValidPassword(password, user.password)) {
                    throw CustomError.createError({
                        name: 'Error de logeo',
                        cause: 'Ingresó una contraseña incorrecta. Intenté nuevamente o cambie la misma',
                        message: 'Contraseña incorrecta',
                        code: ErrorCodes.INVALID_PASSWORD,
                        status: 401
                    })
                }
            }

            const userPayload = new UserDTO(user);

            const accessToken = this.#generateAccessToken(userPayload);

            return { accessToken, userPayload };
        } catch (error) {
            throw CustomError.createError({
                name: 'Error de logeo',
                cause: 'Ocurrio validar sus credenciales. Intente nuevamente o cambie su contraseña',
                message: 'Contraseña incorrecta',
                code: ErrorCodes.USER_LOGIN_ERROR,
                otherProblems: error,
                status: error.status || 500
            })
        }

    }

    async sendMailToResetPassword(email) {
        if (!email) {
            throw CustomError.createError({
                name: 'Sin email',
                cause: 'Es necesario que ingrese un email para poder continuar con el cambio de contraseña',
                message: 'Debe ingresar un email',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            })
        }

        const user = await this.#userDAO.findByEmail(email);

        if (!user) {
            if (!user) {
                throw CustomError.createError({
                    name: 'Email desconocido',
                    cause: 'Está intentando cambiar la contraseña de un email que no se encuentra registrado',
                    message: 'El email no se encuentra registrado',
                    code: ErrorCodes.UNDEFINED_USER,
                    status: 404
                })
            }
        }

        const passToken = (await new MailingService().sendMail(email));

        const handlerPassToken = generatePasswordRecoveryToken(passToken.randomNumber, passToken.email);

        return handlerPassToken;
    }

    async resetPassword(urlToken, token, newPassword, confirmPassword) {
        const { code, email } = token;

        if (!newPassword || !confirmPassword) {
            throw CustomError.createError({
                name: 'Datos faltantes',
                cause: 'Es necesario que ingrese una nueva contraseña y la confirmación de la misma',
                message: 'Debe completar todos los cambios',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR,
                status: 500
            })
        }

        const isValidToken = urlToken === code.toString();

        if (!isValidToken) {
            throw CustomError.createError({
                name: 'Link inválido',
                cause: 'El link no es válido o ha expirado. Vuelva a enviar el mail de confirmación.',
                message: 'El link no es válido o ha expirado.',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR,
                status: 500
            })
        }

        if (newPassword !== confirmPassword) {
            throw CustomError.createError({
                name: 'Contraseña inválida',
                cause: 'Las dos contraseñas ingresadas deben coincidir para poder continuar con la actualización',
                message: 'Las dos contraseñas no coinciden',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR,
                status: 500
            })
        }

        const user = await this.#userDAO.findByEmail(email);

        const confirmValidPassword = isValidPassword(newPassword, user.password);

        if (confirmValidPassword) {
            throw CustomError.createError({
                name: 'Contraseña inválida',
                cause: 'La la nueva contraseña no puede ser igual a la contraseña anterior.',
                message: 'Debe actualizar su contraseña',
                code: ErrorCodes.PASSWORD_UPDATE_ERROR,
                status: 500
            })
        }

        const updatedUser = await this.#userDAO.updatePassword(email, hashPassword(newPassword));

        return updatedUser;

    }

    async githubLogin(profile) {
        try {
            const user = await this.#userDAO.findByEmail(profile._json.email);

            if (!user) {
                const fullName = profile._json.name;
                const firstName = fullName.substring(0, fullName.lastIndexOf(' '));
                const lastName = fullName.substring(fullName.lastIndexOf(' ') + 1);
                const age = 18;
                const password = '123';

                const newUser = await this.registerUser(firstName, lastName, age, profile._json.email, password);
                const accessToken = this.#generateAccessToken(newUser);

                return { accessToken, user: newUser };
            }

            const accessToken = this.#generateAccessToken(user);
            return { accessToken, user };
        } catch (error) {
            throw CustomError.createError({
                name: 'Error de logeo',
                cause: 'Ocurrió un error inesperado y no se pudo emparejar su cuenta de github en la base de datos',
                message: 'Hubo un problema con su cuenta de github',
                code: ErrorCodes.GITHUB_LOGIN_ERROR,
                otherProblems: error,
                status: error.status || 500
            })
        }

    }

    async deleteUser(email) {
        try {
            const user = await this.#userDAO.findByEmail(email);
            if (user) {
                await this.#cartDAO.deleteCartById(user.cart);
                await this.#userDAO.deleteByEmail(email);
            } else {
                throw CustomError.createError({
                    name: 'Email desconocido',
                    cause: 'Está intentando un usuario con un email que no se encuentra registrado',
                    message: 'El email no se encuentra registrado',
                    code: ErrorCodes.UNDEFINED_USER,
                    status: 404
                })
            }
        } catch (error) {
            throw CustomError.createError({
                name: 'Error al eliminar el usuario',
                cause: 'Su petición no fue procesada de forma correcta y no se pudo eliminar el usuario.',
                message: 'Hubo un problema y no se pudo elimiar el usuario',
                code: ErrorCodes.USER_DELETION_ERROR,
                otherProblems: error,
                status: error.status || 500
            })
        }

    }

    async getUserById(id) {
        try {
            return await this.#userDAO.findById(id);
        } catch {
            throw CustomError.createError({
                name: 'Email desconocido',
                cause: 'Ha ingresado un ID inválido o el usuario no se encuentra registrado en la base de datos',
                message: 'El emmail no se encuentra registrado',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            })
        }
    }

    async changeRole(id) {
        const user = await this.#userDAO.findById(id);
        if (!user) {
            throw CustomError.createError({
                name: 'Usuario inválido',
                cause: 'El ID del usuario ingresado no se ecuentra registrado en la base de datos.',
                message: 'ID desconocido',
                code: ErrorCodes.UNDEFINED_USER,
                status: 404
            })
        }

        if (user.rol === 'user') {
            await this.#userDAO.updateRole(user.email, 'premium');
        } else {
            await this.#userDAO.updateRole(user.email, 'user');
        }

        const updatedUser = this.#userDAO.findById(id);
        return updatedUser;
    }
}

module.exports = { UserRepository };