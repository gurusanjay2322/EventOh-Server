import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, index: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  profilePhoto: { type: String }, // ✅ Cloudinary URL for profile pic
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
export default User;
