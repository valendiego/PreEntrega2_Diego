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

        next();
    });
};

const generatePasswordRecoveryToken = (code, email) => {
    const passwordToken = jwt.sign({ code, email }, PRIVATE_KEY, { expiresIn: '1h' });
    return passwordToken;
}

const verifyPasswordToken = (req, res, next) => {

    const passwordRecoveryToken = req.cookies.passToken;

    if (!passwordRecoveryToken) {
        return res.json({ message: 'No posee los permisos para acceder a esta dirección.' })
    }

    jwt.verify(passwordRecoveryToken, PRIVATE_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).redirect({ error: 'Error, token invalido' });
        }

        req.passToken = { code: decoded.code, email: decoded.email };

        next();
    })
}

module.exports = { generateToken, verifyToken, secret: PRIVATE_KEY, generatePasswordRecoveryToken, verifyPasswordToken };