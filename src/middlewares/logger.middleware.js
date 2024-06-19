const { logger } = require('../utils/logger');

module.exports = {
    useLogger: (req, res, next) => {
        req.logger = logger;
        next();
    }
}