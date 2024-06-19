const { Users } = require('./models');

class UserDAO {
    async findByEmail(email) {
        return await Users.findOne({ email });
    }

    async create(user) {
        return await Users.create(user);
    }

    async updatePassword(email, password) {
        return await Users.updateOne({ email }, { $set: { password } });
    }

    async updateRole(email, rol) {
        return await Users.updateOne({ email }, { $set: { rol } });
    }

    async deleteByEmail(email) {
        return await Users.deleteOne({ email });
    }

    async findById(id) {
        return await Users.findOne({ _id: id });
    }

    async findAll() {
        return await Users.find();
    }
}

module.exports = UserDAO;