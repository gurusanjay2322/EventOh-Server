import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Sub-schema for a single venue/hall under a venue owner.
 * A venue owner can list multiple halls (e.g., Main Hall, Lawn).
 */
const VenueUnitSchema = new Schema({
  title: { type: String, required: true },           // e.g., "Grand Ballroom"
  capacity: { type: Number, required: true },        // guest capacity
  pricePerDay: { type: Number, default: 0 },         // day price
  pricePerHour: { type: Number, default: 0 },        // optional hourly price
  minBookingHours: { type: Number, default: 0 },
  amenities: [String],                               // ["AC Hall", "Parking"]
  images: [String],
   verified: { type: Boolean, default: false }, // ✅ Added
  verifiedAt: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },                                  // urls
  isActive: { type: Boolean, default: true },
});

/**
 * Sub-schema for packages offered by an event management team
 */
const PackageSchema = new Schema({
  name: { type: String, required: true },            // Basic / Standard / Premium
  description: String,
  price: { type: Number, required: true },
  includedServices: [String],                        // ["Catering", "Decor"]
  excludedServices: [String],
  maxGuests: Number,
});

/**
 * Sub-schema for event-team offerings
 */
const EventTeamServiceSchema = new Schema({
  eventTypesCovered: [{ type: String }],             // ["wedding","corporate","birthday"]
  packages: [PackageSchema],
  note: String,
});

/**
 * Main Vendor Schema
 */
const vendorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  type: {
    type: String,
    enum: ["venue", "event_team", "freelancer"],
    required: true,
  },
  name: { type: String, required: true },
  city: { type: String, required: true },
  description: String,
  contactNumber: String,

  // ✅ New: profile photo for all vendors
  profilePhoto: { type: String }, // Cloudinary URL

  // ✅ Existing fields (unchanged)
  portfolio: [String],
  bookedDates: [
    { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
  ],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  pricing: {
    basePrice: Number,
    currency: { type: String, default: "INR" },
  },

  venueUnits: { type: [VenueUnitSchema], default: undefined },
  eventTeamDetails: { type: EventTeamServiceSchema, default: undefined },
  freelancerCategory: {
    type: String,
    enum: [
      "photographer", "videographer", "caterer", "mehndi_artist",
      "decorator", "priest", "dj", "anchor", "makeup_artist", "other",
    ],
  },

  createdAt: { type: Date, default: Date.now },
});


/**
 * Optional: Pre-save validation to ensure type-specific fields exist.
 * You can also enforce this in controllers for clearer error messages.
 */
vendorSchema.pre("validate", function (next) {
  if (this.type === "venue") {
    if (!this.venueUnits || this.venueUnits.length === 0) {
      return next(new Error("Venue vendors must provide at least one venue unit (venueUnits)."));
    }
  }
  if (this.type === "event_team") {
    if (!this.eventTeamDetails || !this.eventTeamDetails.packages || this.eventTeamDetails.packages.length === 0) {
      return next(new Error("Event teams must provide eventTeamDetails with at least one package."));
    }
  }
  if (this.type === "freelancer") {
    if (!this.freelancerCategory) {
      return next(new Error("Freelancer vendor must specify freelancerCategory."));
    }
  }
  next();
});

export default mongoose.model("Vendor", vendorSchema);
