const mongoose = require("mongoose")

const urlSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    longUrl: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    shortUrl: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    }
}, { timestamps: true })

module.exports = new mongoose.model("Url",urlSchema)