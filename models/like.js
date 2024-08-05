const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
	designId: { type: Schema.Types.ObjectId, ref: 'Design', required: true },
	userId: { type: Schema.Types.ObjectId, required: true },
}, { timestamps: true });

// Ensure a user can like a design only once
LikeSchema.index({ designId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);
