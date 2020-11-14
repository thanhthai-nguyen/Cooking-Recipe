const express = require('express');
const {check} = require('express-validator');
const Auth = require('../controllers/AuthController');
const validate = require('../middlewares/validate');
const Password = require('../controllers/PasswordController');
const uploadImage = require('../helpers/uploadImage');
const Origin = require('../controllers/OriginController');
const MainIngredient = require('../controllers/MainIngredientController');
const Recipe = require('../controllers/RecipeController');
const Tag = require('../controllers/TagController');
const Step = require('../controllers/StepController');
const Ingredient  = require('../controllers/IngredientController');
const Picture  = require('../controllers/PictureController');


const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({message: "You are in the Auth Endpoint. Register or Login to test Authentication."});
});


// Tạo tài khoản
router.post('/register', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('username').not().isEmpty().withMessage('Your username is required'),
    check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
], validate, Auth.register);

// Đăng nhập
router.post("/login", [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').not().isEmpty(),
], validate, Auth.login);

//EMAIL Verification
router.get('/verify/:token', Auth.verify);
router.post('/resend', Auth.resendToken);

//Refresh Token
router.post('/refreshtoken', Auth.refreshToken);

//Password RESET
router.post('/recover', [
    check('email').isEmail().withMessage('Enter a valid email address'),
], validate, Password.recover);

router.get('/reset/:token', Password.reset);

router.post('/reset/:token', [
    check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
    check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
], validate, Password.resetPassword);

// Đăng xuất
router.delete('/logout', Auth.logout);

//UPDATE
router.post('/uploadImage', uploadImage.uploadFile, (req, res) => {
    if (req.file.filename) {
        res.json({
            success: true,
            message: 'Image has been uploaded.',
            Image: req.file.filename
        })
    } else {
        res.json({
            success: false,
            message: 'Upload failed.',
        })
    }
});

//DISPLAY IMAGE
router.get('/image/:filename', uploadImage.displayImage);


// OriginController
router.post('/origin/createOrigin', Origin.createOrigin);
router.post('/origin/updateOrigin', Origin.updateOrigin);
router.get('/origin/getOrigin', Origin.getOrigin);
router.get('/origin/getAllOrigins', Origin.getAllOrigins);
router.post('/origin/removeOrigin', Origin.removeOrigin);

// MainIngredient
router.post('/ingredient/createMainIngredient', MainIngredient.createMainIngredient);
router.post('/ingredient/updateMainIngredient', MainIngredient.updateMainIngredient);
router.get('/ingredient/getMainIngredient', MainIngredient.getMainIngredient);
router.get('/ingredient/getAllMainIngredient', MainIngredient.getAllMainIngredient);
router.post('/ingredient/removeMainIngredient', MainIngredient.removeMainIngredient);


// RecipeController
router.post('/recipe/createRecipe', Recipe.createRecipeNoToken);
router.get('/recipe/getAllRecipes', Recipe.getAllRecipes);
router.post('/recipe/updateRecipe', Recipe.updateRecipe);
router.get('/recipe/getRecipe', Recipe.getRecipe);
router.get('/recipe/removeRecipe', Recipe.removeRecipe);

// TagController
router.post('/tag/addTags', Tag.addTags);
router.get('/tag/removeTag', Tag.removeTag);

// StepController
router.post('/step/updateStep', Step.updateStep);
router.post('/step/addSteps', Step.addSteps);
router.get('/step/removeStep', Step.removeStep);

// IngredientController
router.post('/ingredient/updateIngredient', Ingredient.updateIngredient);
router.post('/ingredient/addIngredients', Ingredient.addIngredients);
router.get('/ingredient/removeIngredient', Ingredient.removeIngredient);

// PictureController
router.post('/picture/addPictures', Picture.addPictures);
router.get('/picture/removePicture', Picture.removePicture);


module.exports = router;