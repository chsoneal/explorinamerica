const Review = require('../models/review')
const Campground = require('../models/campground')


module.exports.deleteReview = async(req, res) => {
    const {id, reviewId} = req.params
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}

module.exports.addReview = async(req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", `You added a review to ${campground.title}`)
    res.redirect(`/campgrounds/${campground._id}`)
}