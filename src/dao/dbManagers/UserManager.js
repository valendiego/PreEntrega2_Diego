const { hashPassword, isValidPassword } = require('../../utils/hashing');
const { Users } = require('../models');

class UserManager {
    constructor() {
        // Definir el usuario admin
        this.adminUser = {
            _id: 'admin',
            firstName: 'Romina',
            lastName: 'Molina',
            age: 18,
            email: 'adminCoder@coder.com',
            password: 'adminCod3r123',
            rol: 'admin'
        };
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
            if (!email || !password) {
                throw new Error('Debe ingresar su usuario y contraseña');
            }

            if (email === this.adminUser.email && password === this.adminUser.password) {
                return this.adminUser;
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

    async registerUser(firstName, lastName, age, email, password) {
        try {
            if (!email || !password) {
                throw new Error('El email y la contraseña son obligatorios.')
            }

            if (email === this.adminUser.email) {
                throw new Error('Acceso denegado.');
            }

            const firstNameManager = firstName ? firstName : 'Usuario'
            const lastNameManager = lastName ? lastName : 'Sin Identificar'

            const numericAge = age ? parseInt(age) : age = 1

            const hashedPassword = hashPassword(password);

            if (age <= 0) {
                throw new Error('La edad debe ser mayor a 1')
            }

            await Users.create({
                firstName: firstNameManager,
                lastName: lastNameManager,
                age: numericAge,
                email,
                password: hashedPassword
            })
        } catch {
            throw new Error('Error al registrar el ususario.')
        }
    }

    async getUser(id) {
        try {

            if (id === this.adminUser._id) {
                return this.adminUser
            } else {
                const user = await Users.findOne({ _id: id })
                return user
            }

        } catch {
            throw new Error('Error al cargar la sesion de usuario')
        }
    }

    async resetPassword(email, password) {
        try {
            const user = await Users.findOne({ email });
            if (!user) {
                throw new Error('El usuario no existe.');
            }

            if (email === this.adminUser.email) {
                throw new Error('No tiene permisos para actualizar ese email.');
            }

            const hashedPassword = hashPassword(password);
            const userUpdated = await Users.updateOne({ email }, { $set: { password: hashedPassword } });
            return userUpdated;

        } catch (error) {
            throw new Error('No se pudo actualizar la contraseña');
        }
    }

}

module.exports = UserManager;