const express = require('express');
const {check} = require('express-validator');
const User = require('../controllers/UserController');

const uploadImage = require('../helpers/uploadImage');

const multer = require('multer');
const validate = require('../middlewares/validate');

const router = express.Router();


//INDEX
router.get('/', User.index);

//STORE
router.post('/', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('username').not().isEmpty().withMessage('Your username is required'),
], validate, User.store);

//SHOW
router.get('/show', User.show);

//UPDATE USER 
router.put('/update', uploadImage.uploadFile ,User.update);

//UPLOAD IMAGE
router.post('/uploadimg', uploadImage.uploadFile, User.uploadimage);

//DISPLAY IMAGE
router.get('/image/:filename', uploadImage.displayImage);

//DELETE
router.post('/remove', User.remove);



module.exports = router;