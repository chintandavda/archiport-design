const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
	designId: { type: Schema.Types.ObjectId, ref: 'Design', required: true },
	username: { type: String, required: true },
}, { timestamps: true });

// Ensure a user can like a design only once
LikeSchema.index({ designId: 1, username: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);

