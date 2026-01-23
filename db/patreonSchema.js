const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  postId: { type: String, required: true },
  title: { type: String, required: true, default: '' },
  publishedAt: { type: Date, required: true },
  url: { type: String, require: true },
});

const model = mongoose.model('posts', schema);
module.exports = model;
