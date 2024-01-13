"use strict";

const Mongoose = require("mongoose");
const uri = process.env.DB_URI || "mongodb://127.0.0.1/capstone";

Mongoose.connect(uri)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("MongoDB Error: " + error.message));

const db = Mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

exports.Mongoose = Mongoose;