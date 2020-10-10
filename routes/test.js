const express = require('express');
const {check} = require('express-validator');
const User = require('../controllers/UserController');
const uploadImage = require('../helpers/uploadImage');

const multer = require('multer');
const validate = require('../middlewares/validate');

const router = express.Router();


//UPDATE
router.post('/update', uploadImage.uploadFile);

//DISPLAY IMAGE
router.get('/image/:filename', uploadImage.displayImage);


module.exports = router;