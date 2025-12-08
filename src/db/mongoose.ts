import mongoose from 'mongoose';

require('dotenv').config();

export function login() {
  const start = Date.now();

  if (process.env['MONGO'] === undefined) {
    throw new Error("Env var 'MONGO' missing");
  }

  mongoose
    .connect(process.env['MONGO'], {
      dbName: 'smartsupport',
    })
    .then(() => {
      const end = Date.now();
      const total = end - start;
      console.log(`Successfully established connection to MongoDB (${total}ms)`);
    })
    .catch(err => {
      console.log(err);
    });
}
