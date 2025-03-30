const mongoose = require('mongoose')
//const { campgroundSchema } = require('../schemas')
const Schema = mongoose.Schema
const Review = require('./review')

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})
const opts = {toJSON: { virtuals: true}}
const CampgroundSchema = new Schema({
    
    title: String,
    type: String,
    price: Number,
    city: String,
    state: String,
    country: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
    coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere'
        }
    },
    dump_station: String,
    potable_water: String,
    description: String,
    website: String,
    images: [ImageSchema],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popupMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this.id}">${this.title}</a></strong>
            <br>
            <p>$${this.price}</p>`
})

CampgroundSchema.post('findOneAndDelete', async function(doc){
if(doc){
    await Review.remove({
    _id: {
        $in: doc.reviews
    }
    })
}
})

module.exports = mongoose.model('Campground', CampgroundSchema)
