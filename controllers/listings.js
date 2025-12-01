const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {
  const { category } = req.query;

  let allListings;

  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Lisiting you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: req.body.listing.location,
          format: "json",
          limit: 1,
        },

        headers: {
          "User-Agent": "YourAppName/1.0",
        },
      }
    );

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    if (req.file) {
      let url = req.file.path;
      let filename = req.file.filename;
      newListing.image = { url, filename };
    }

    let geometry = { type: "Point", coordinates: [0, 0] };
    if (response.data && response.data.length > 0) {
      geometry = {
        type: "Point",
        coordinates: [
          parseFloat(response.data[0].lon),
          parseFloat(response.data[0].lat),
        ],
      };
    }
    newListing.geometry = geometry;

    let savedListing = await newListing.save();
    console.log("Listing Saved:", savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  id = id.trim();
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let originalImageUrl = null;
  if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  }
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.body.listing.location) {
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: req.body.listing.location,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "MajorProject-App",
          },
        }
      );

      if (response.data && response.data.length > 0) {
        listing.geometry = {
          type: "Point",
          coordinates: [
            parseFloat(response.data[0].lon),
            parseFloat(response.data[0].lat),
          ],
        };
        await listing.save(); // Geometry save
      }
    } catch (err) {
      console.log("Geocoding error:", err.message);
    }
  }
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save(); // Image save
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  req.flash("success", " Listing Deleted");
  res.redirect("/listings");
};
