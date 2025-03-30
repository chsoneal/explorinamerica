const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_PUBLIC_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.campgroundsIndex = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const regex = searchQuery ? new RegExp(escapeRegex(searchQuery), 'gi') : null;
    
    const query = regex ? 
      Campground.find().or([
        { title: regex },
        { type: regex },
        { state: regex },
        { city: regex },
        { description: regex }
      ]) : Campground.find();

    const allCampgrounds = await query.exec();
    const noMatch = allCampgrounds.length < 1 && searchQuery ? 'No campgrounds match that query, please try again.' : null;

    res.render('campgrounds/index', { campgrounds: allCampgrounds, noMatch });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching campgrounds.');
  }
};

module.exports.renderCreateCampgroundForm = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res) => {
  try {
    const geoData = await geoCoder.forwardGeocode({
      query: `${req.body.campground.title}, ${req.body.campground.street}, ${req.body.campground.city}, ${req.body.campground.state}`,
      limit: 1
    }).send();

    const campground = new Campground({
      ...req.body.campground,
      geometry: geoData.body.features[0].geometry,
      images: req.files.map(f => ({ url: f.path, filename: f.filename })),
      creator: req.user._id
    });

    await campground.save();
    req.flash('success', `Successfully created ${campground.title}`);
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create campground');
    res.redirect('/campgrounds');
  }
};

module.exports.renderSpecificCampgroundPage = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: 'reviews',
        populate: { path: 'author' }
      })
      .populate('creator');

    if (!campground) {
      req.flash('error', 'Campground not found');
      return res.redirect('/campgrounds');
    }

    const campgrounds = await Campground.find().populate();
    res.render('campgrounds/show', { campground, campgrounds });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to fetch campground');
    res.redirect('/campgrounds');
  }
};

module.exports.byState = async (req, res, next) => {
  try {
    const { state } = req.params;
    const campgrounds = await Campground.find({ state });

    res.render('campgrounds/bystate', { state, campgrounds });
  } catch (err) {
    next(err);
  }
};

module.exports.renderEditCampgroundForm = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash('error', 'Campground not found');
      return res.redirect('/campgrounds');
    }

    const campgrounds = await Campground.find().populate();
    res.render('campgrounds/edit', { campground, campgrounds });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load edit form');
    res.redirect('/campgrounds');
  }
};

module.exports.editCampground = async (req, res) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

    // Update coordinates
    campground.geometry.coordinates = [req.body.longitude, req.body.latitude];

    // Add new images
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...newImages);

    await campground.save();

    // Handle image deletions
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    req.flash('success', `Successfully updated ${campground.title}`);
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update campground');
    res.redirect(`/campgrounds/${req.params.id}/edit`);
  }
};

module.exports.deleteCampground = async (req, res) => {
  try {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete campground');
    res.redirect('/campgrounds');
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
