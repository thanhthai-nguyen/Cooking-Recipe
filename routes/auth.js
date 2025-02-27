const express = require('express');
const {check} = require('express-validator');
const User = require('../controllers/UserController');

const uploadImage = require('../helpers/uploadImage');

const multer = require('multer');
const validate = require('../middlewares/validate');

const router = express.Router();

const Recipe = require('../controllers/RecipeController');
const History = require('../controllers/HistoryController');
const Favorite = require('../controllers/FavoriteController');
const Review = require('../controllers/ReviewController');
const Planner = require('../controllers/PlannerController');


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

// Xóa tài khoản User
router.post('/user/remove', User.remove); // ADMIN
router.post('/user/removeUser', User.removeUser); //USER


// RecipeController
router.post('/recipe/createRecipe', Recipe.createRecipe);
router.get('/recipe/getAllRecipes', Recipe.getAllRecipes);
router.get('/recipe/confirmRecipe', Recipe.confirmRecipe);

// FavoriteController
router.post('/favorite/createFavorite', Favorite.createFavorite);
router.get('/favorite/removeFavorite', Favorite.removeFavorite);

// HistoryController
router.post('/history/createHistory', History.createHistory);
router.get('/history/removeHistory', History.removeHistory);
router.get('/history/removeAllHistories', History.removeAllHistories);

// ReviewController
router.post('/review/createReview', Review.createReview);
router.get('/review/removeReview', Review.removeReview);

// PlannerController
router.post('/planner/createPlanner', Planner.createPlanner);
router.get('/planner/removePlanner', Planner.removePlanner);
router.post('/planner/updatePlanner', Planner.updatePlanner);


module.exports = router;