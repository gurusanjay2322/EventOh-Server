import express from "express";
import {
  getAllVendors,
  getVendorById,
  updateVendor,
  updateAvailability,
  getBookedDates,
  getMyVendorProfile
} from "../controllers/VendorController.js";
import { uploadImagesForVendor } from "../controllers/ImageUploadController.js";
import upload from "../middleware/uploadImage.js";
import VerifyToken from "../middleware/VerifyToken.js";
const router = express.Router();
console.log("VerifyToken:", typeof VerifyToken);

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor management and profile operations
 */

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors (with optional filters)
 *     tags: [Vendors]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [venue, event_team, freelancer]
 *         description: Filter vendors by type
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter vendors by city (case-insensitive)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: photographer
 *         description: Filter freelancers by category
 *     responses:
 *       200:
 *         description: List of vendors retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", getAllVendors);
/**
 * @swagger
 * /api/vendors/myProfile:
 *   get:
 *     summary: Get logged-in vendor profile
 *     description: Retrieves the profile details of the currently authenticated vendor. Requires a valid vendor JWT token.
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched vendor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendor:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 690263671d2bd3c18450e61f
 *                     userId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 690263651d2bd3c18450e61d
 *                         name:
 *                           type: string
 *                           example: Rudreswar S
 *                         email:
 *                           type: string
 *                           example: contact@pixelperf.in
 *                         role:
 *                           type: string
 *                           example: vendor
 *                     type:
 *                       type: string
 *                       example: freelancer
 *                     name:
 *                       type: string
 *                       example: Rudreswar S
 *                     city:
 *                       type: string
 *                       example: Bangalore
 *                     description:
 *                       type: string
 *                       example: Photography Sessions for Events
 *                     profilePhoto:
 *                       type: string
 *                       example: https://res.cloudinary.com/example/image.jpg
 *                     portfolio:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: https://res.cloudinary.com/example/image1.jpg
 *                     bookedDates:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: 2025-11-01
 *                     rating:
 *                       type: number
 *                       example: 4.8
 *                     totalReviews:
 *                       type: number
 *                       example: 23
 *       401:
 *         description: Unauthorized — Missing or invalid token
 *       403:
 *         description: Forbidden — Only vendors can access this route
 *       404:
 *         description: Vendor profile not found
 *       500:
 *         description: Server error
 */
router.get("/myProfile", VerifyToken, getMyVendorProfile);
/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor details by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor details found
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getVendorById);

/**
 * @swagger
 * /api/vendors/{id}:
 *   put:
 *     summary: Update a vendor profile (vendor only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Updated profile and pricing info"
 *               pricing:
 *                 type: object
 *                 properties:
 *                   basePrice:
 *                     type: number
 *                     example: 20000
 *                   currency:
 *                     type: string
 *                     example: INR
 *               city:
 *                 type: string
 *                 example: "Bangalore"
 *     responses:
 *       200:
 *         description: Vendor profile updated successfully
 *       403:
 *         description: Access denied or unauthorized update attempt
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.put("/:id", VerifyToken, updateVendor);

/**
 * @swagger
 * /api/vendors/{id}/availability:
 *   patch:
 *     summary: Update vendor's booked/unavailable dates
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookedDates
 *             properties:
 *               bookedDates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "2025-11-05"
 *                 description: List of unavailable dates (YYYY-MM-DD format)
 *           example:
 *             bookedDates: ["2025-11-05", "2025-11-06"]
 *     responses:
 *       200:
 *         description: Vendor availability updated successfully
 *       400:
 *         description: Invalid request format
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/availability", VerifyToken, updateAvailability);
/**
 * @swagger
 * /api/vendors/{id}/booked-dates:
 *   get:
 *     summary: Get all booked/unavailable dates of a vendor
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Returns a list of booked/unavailable dates
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.get("/:id/booked-dates", getBookedDates);
router.post(
  "/:id/upload",
  (req, res, next) => {
    console.log("🔥 Incoming upload request for vendor:", req.params.id);
    next();
  },
  VerifyToken,
  upload.array("images", 5),
  (req, res, next) => {
    console.log("✅ Files received:", req.files?.length || 0);
    console.log("✅ User from token:", req.user);
    next();
  },
  uploadImagesForVendor
);

export default router;
