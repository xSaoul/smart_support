const mongoose = require('mongoose');

/**
 * @param {String} threadId thread id
 * @param {String} opId op id
 * @param {Date} lastPosted last post date
 * @param {Boolean} reminderSent has the reminder been sent
 * @param {Date} closeScheduledTime scheduled time to close the thread
 */

const schema = new mongoose.Schema({
  threadId: { type: String, required: true },
  opId: { type: String, required: true },
  lastPosted: { type: Date, default: Date.now },
  reminderSent: { type: Boolean, default: false },
  closeScheduledTime: { type: Date, default: null },
});

const model = mongoose.model('threads', schema);
module.exports = model;
