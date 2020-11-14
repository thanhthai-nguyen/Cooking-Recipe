const express = require('express');
const {check} = require('express-validator');
const User = require('../controllers/UserController');

const uploadImage = require('../helpers/uploadImage');

const multer = require('multer');
const validate = require('../middlewares/validate');

const router = express.Router();

const Recipe = require('../controllers/RecipeController');


//INDEX
router.get('/user/getAllUsers', User.getAllUsers);

//STORE
router.post('/', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('username').not().isEmpty().withMessage('Your username is required'),
], validate, User.store);

//SHOW
router.get('/user/show', User.show);

//UPDATE USER 
router.put('/user/update', uploadImage.uploadFile ,User.update);

//UPLOAD IMAGE
router.post('/user/uploadimg', uploadImage.uploadFile, User.uploadimage);

//DISPLAY IMAGE
router.get('/user/image/:filename', uploadImage.displayImage);

//DELETE
router.post('/user/remove', User.remove);

// RecipeController
router.post('/recipe/createRecipe', Recipe.createRecipe);
router.get('/recipe/getAllRecipes', Recipe.getAllRecipes);
router.get('/recipe/confirmRecipe', Recipe.confirmRecipe);




module.exports = router;