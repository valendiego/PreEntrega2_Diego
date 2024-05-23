require('dotenv').config(); // Carga las variables de entorno desde .env
const jwt = require('jsonwebtoken');
const PRIVATE_KEY = process.env.JWT_SECRET;

const generateToken = user => {
    const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' });
    return token;
}

const verifyToken = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        req.user = null;
        return next();
    }

    jwt.verify(accessToken, PRIVATE_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid access token!' });
        }

        req.user = decoded.user;

        if (decoded.user && decoded.user.cart) {
            req.user.cartId = decoded.user.cart._id;
        }

        next();
    });
};

module.exports = { generateToken, verifyToken, secret: PRIVATE_KEY };