const { hashPassword, isValidPassword } = require('../../utils/hashing');
const { Users } = require('../../models');
const daoCarts = require('./daoCarts');
const { UserService } = require('../../services/user.services');

class daoUsers {
    constructor() {
        this.userService = new UserService();
    }

    async prepare() {
        // No hacer nada. 
        // Podríamos chequear que la conexión existe y está funcionando
        if (Users.db.readyState !== 1) {
            throw new Error('must connect to mongodb!')
        }
    }

    async loginUser(email, password) {
        try {
            this.userService.validateLoginCredentials(email, password);

            if (this.userService.isAdminUser(email, password)) {
                return this.userService.adminUser;
            }

            if(this.userService.isSuperAdminUser(email, password)) {
                return this.userService.superAdminUser;
            }

            const user = await Users.findOne({ email });

            if (!user) {
                throw new Error('El usuario no existe');
            }

            if (isValidPassword(password, user.password)) {
                return user;
            } else {
                throw new Error('Credenciales inválidas');
            }

        } catch {
            throw new Error('El usuario o contraseña son incorrectos');
        }

    }

    async registerUser(firstName, lastName, email, password) {
        try {

            if (email === this.userService.adminUser.email || email === this.userService.superAdminUser.email) {
                throw new Error('Error al registrar el usuario');
            }

            const existingUser = await Users.findOne({ email });
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }

            const cart = await new daoCarts().addCart();

            const user = await this.userService.generateNewUser(firstName, lastName, email, password, cart)

            const newUser = Users.create(user);
            return newUser;
        } catch (err) {
            console.error('Error al registrar el usuario: ', err);
            throw new Error('Error al registrar el ususario.');
        }
    }

    async getUser(id) {
        try {
            if (id === this.userService.adminUser._id) {
                return this.userService.adminUser;
            } else if(id === this.userService.superAdminUser._id){
                return this.userService.superAdminUser;
            } else {
                const user = await Users.findOne({ _id: id });
                return user;
            }
        } catch {
            throw new Error('Error al cargar la sesion de usuario');
        }
    }

    async resetPassword(email, password) {
        try {
            this.userService.validateLoginCredentials(email, password);
            const user = await Users.findOne({ email });
            if (!user) {
                throw new Error('El usuario no existe.');
            }

            if (email === this.userService.adminUser.email || email === this.userService.superAdminUser.email) {
                throw new Error('No tiene permisos para actualizar ese email.');
            }

            await Users.updateOne({ email }, { $set: { password: hashPassword(password) } });

            const userUpdated = await Users.findOne({ email });
            return userUpdated;

        } catch (error) {
            throw new Error('No se pudo actualizar la contraseña');
        }
    }

    async githubLogin(profile) {
        try {
            const user = await Users.findOne({ email: profile._json.email });

            if (!user) {
                const fullName = profile._json.name;
                const firstName = fullName.substring(0, fullName.lastIndexOf(' '));
                const lastName = fullName.substring(fullName.lastIndexOf(' ') + 1);
                const password = '123';

                const newUser = await this.registerUser(firstName, lastName, profile._json.email, password);
                const accessToken = this.userService.generateAccessToken(newUser);

                return { accessToken, user: newUser };
            }

            const accessToken = this.userService.generateAccessToken(user);
            return { accessToken, user };

        } catch (e) {
            console.error('Error al loguearse con GitHub: ', e);
            throw new Error('Hubo un problema al loguearse.');
        }
    }

    async deleteUser(email) {
        try {
            const user = await Users.findOne({ email });
            await new daoCarts().deleteCartById(user.cart.toString());
            await Users.deleteOne({ email });
        } catch {
            throw new Error('Hubo un error al eliminar el usuario');
        }
    }
}

module.exports = daoUsers;