const mongoose = require('mongoose');

require('dotenv').config();

module.exports = {
  login: () => {
    const start = Date.now();
    mongoose
      .connect(process.env.MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        const end = Date.now();
        const total = end - start;
        console.log(`Successfully established connection to MongoDB (${total}ms)`);
      })
      .catch(err => {
        console.log(err);
      });
  },
};
