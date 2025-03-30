const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, validateCampground, isCreator} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const {storage} = require('../cloudinary')
const multer = require('multer')
const upload = multer({storage})
const Campground = require('../models/campground')

    
//INDEX - show all campgrounds


router.route('/')
    .get(campgrounds.campgroundsIndex)




// Navigate to the create a campground form
router.route('/new')
    .get(isLoggedIn, campgrounds.renderCreateCampgroundForm)
// Create a new campground
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(campgrounds.createCampground))
// Find all campgrounds in specific state
router.get('/state/:state', catchAsync(campgrounds.byState))

router.route('/:id')
// Go to a specific campground's page
    .get(catchAsync(campgrounds.renderSpecificCampgroundPage))
// Edit a campground - only admin or creator can do this
    .put(isLoggedIn, upload.array('images'), catchAsync(campgrounds.editCampground))
// Delete a campground - only admin or creator can see this/do this
    .delete(isLoggedIn, isCreator, catchAsync(campgrounds.deleteCampground))

// Navigate to the form to edit a specific campground - only admin/creator can see this button
router.get('/:id/edit',  catchAsync(campgrounds.renderEditCampgroundForm))


module.exports = router