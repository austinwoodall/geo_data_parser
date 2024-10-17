const mongoose = require("mongoose");
const { Schema } = mongoose;

// Flexible GeoJSON schema
const countryJSONSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    features: {
      type: Schema.Types.Mixed, // Allows any dynamic structure for GeoJSON features
      required: true,
    },
  },
  { collection: "country" }
);

// Create the model
const CountryGeoJSON = mongoose.model("GeoJSON", countryJSONSchema);

module.exports = CountryGeoJSON;
