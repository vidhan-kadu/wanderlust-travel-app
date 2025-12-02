if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const LOCAL_URL = "mongodb://127.0.0.1:27017/wanderlust";
const ATLAS_URL = process.env.ATLASDB_URL;

async function migrateData() {
  try {
    console.log("Connecting to Local DB...");
    await mongoose.connect(LOCAL_URL);
    console.log("Connected to Local DB.");

    const users = await User.find({});
    const listings = await Listing.find({});
    const reviews = await Review.find({});

    console.log(
      `Fetched: ${users.length} Users, ${listings.length} Listings, ${reviews.length} Reviews`
    );

    await mongoose.connection.close();
    console.log("Local DB Connection Closed.");

    console.log("Connecting to Atlas DB...");
    await mongoose.connect(ATLAS_URL);
    console.log("Connected to Atlas DB.");

    if (users.length > 0) await User.insertMany(users);
    if (listings.length > 0) await Listing.insertMany(listings);
    if (reviews.length > 0) await Review.insertMany(reviews);

    console.log("Data Migration Successful! 🎉");
  } catch (err) {
    console.error("Migration Failed:", err);
  } finally {
    await mongoose.connection.close();
  }
}

migrateData();
