require('dotenv').config();
const { hashPassword } = require('../utils/hashing');
const { generateToken } = require('../utils/jwt');

class UserService {
    constructor() {
        this.adminUser = {
            _id: 'admin',
            firstName: 'Luciano',
            lastName: 'Staniszewski',
            age: 18,
            email: process.env.ADMIN_USER,
            password: process.env.ADMIN_PASS,
            rol: 'admin',
            cart: process.env.ADMIN_CART
        };

        this.superAdminUser = {
            _id: 'superAdmin',
            firstName: 'Federico',
            lastName: 'Di Iorio',
            age: 28,
            email: process.env.SADMIN_USER,
            password: process.env.SADMIN_PASS,
            rol: 'superAdmin',
            cart: process.env.SADMIN_CART
        }
    }

    validateLoginCredentials(email, password) {
        if (!email || !password) {
            throw new Error('Debe ingresar su usuario y contraseña');
        }
    }

    #validateRegistrationData(age, email, password) {
        this.validateLoginCredentials(email, password)
        if (age <= 0) {
            throw new Error('La edad debe ser mayor a 1');
        }
    }

    async generateNewUser(firstName, lastName, age, email, password, cart) {
        this.#validateRegistrationData(age, email, password);
        const firstNameManager = firstName || 'Usuario';
        const lastNameManager = lastName || 'Sin Identificar';
        const numericAge = age ? parseInt(age) : "";
        const hashedPassword = hashPassword(password);

        const user = {
            firstName: firstNameManager,
            lastName: lastNameManager,
            age: numericAge,
            email,
            password: hashedPassword,
            cart
        };

        return user;
    }

    generateAccessToken(user) {
        return generateToken({
            email: user.email,
            _id: user._id.toString(),
            rol: user.rol,
            firstName: user.firstName,
            lastName: user.lastName,
            cart: user.cart._id
        });
    }

    isAdminUser(email, password) {
        return email === this.adminUser.email && password === this.adminUser.password;
    }

    isSuperAdminUser(email, password) {
        return email === this.superAdminUser.email && password === this.superAdminUser.password;
    }
}

module.exports = { UserService };