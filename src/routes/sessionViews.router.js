const { Router } = require('express');
const router = Router();
const { Controller } = require('../controller/sessionsView.controller');
const { verifyToken, verifyPasswordToken } = require('../middlewares/jwt.middleware');
const { isUser, isAdmin } = require('../middlewares/auth.middleware');
const { documentUploader } = require('../utils/multerUploader');
const { multerErrorHandler } = require('../middlewares/multerErrorHandler.middleware');

router.get('/', verifyToken, (req, res) => new Controller().index(req, res));

router.get('/register', (_, res) => new Controller().register(res));

router.post('/register', async (req, res) => new Controller().registerUser(req, res));

router.get('/login', (_, res) => new Controller().login(res));

router.post('/login', async (req, res) => new Controller().loginUser(req, res));

router.get('/profile', verifyToken, (req, res) => new Controller().profile(req, res));

router.get('/logout', verifyToken, async (req, res) => new Controller().logout(req, res));

router.get('/resetPassword', (_, res) => new Controller().resetPasswordGet(res));

router.post('/resetPassword', async (req, res) => new Controller().sendMailToResetPassword(req, res));

router.get('/resetPasswordWarning', (req, res) => new Controller().resetPasswordWarning(req, res));

router.get('/resetPassword/:tid', (req, res) => new Controller().verifyResetPassword(req, res));

router.post('/resetPassword/:tid', verifyPasswordToken, async (req, res) => new Controller().resetPasswordPost(req, res));

router.get('/documents', verifyToken, isUser, (req, res) => new Controller().documents(req, res));

router.post('/:uid/documents', verifyToken, documentUploader.fields([
    { name: 'identification', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'proofOfAccount', maxCount: 1 },
]), multerErrorHandler, async (req, res) => new Controller().uploadDocuments(req, res));

router.get('/getUsers', verifyToken, isAdmin, async (req, res) => new Controller().getUsers(req, res));

router.post('/premium/:uid', verifyToken, async (req, res) => new Controller().changeRole(req, res));

router.delete('/', verifyToken, isAdmin, async (req, res) => new Controller().deleteUsers(req, res));

router.get('/:uid', verifyToken, isAdmin, async (req, res) => new Controller().getUserById(req, res));

router.post('/:uid', verifyToken, isAdmin, async (req, res) => new Controller().deleteUser(req, res));

module.exports = router;