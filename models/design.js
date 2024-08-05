const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DesignSchema = new Schema({
	username: { type: String, required: true },
	image: { type: String, required: true },
	caption: { type: String, required: true },
	likeCount: { type: Number, default: 0 },
	location: { type: String, default: '' },
	saveCount: { type: Number, default: 0 },
	viewCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Design', DesignSchema);
