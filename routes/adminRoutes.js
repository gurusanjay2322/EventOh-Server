import express from "express";
import { getAllVendors, verifyVenue } from "../controllers/AdminController.js";
import VerifyToken, { verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and vendor verification
 */

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get all vendors (admin only)
 *     description: Returns a list of all vendors with their venue units, freelancer categories, or event team details. Only accessible by admin users.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "671fbc20d6b2131a8e6b1f45"
 *                       name:
 *                         type: string
 *                         example: "Royal Banquet Hall"
 *                       type:
 *                         type: string
 *                         example: "venue"
 *                       city:
 *                         type: string
 *                         example: "Mumbai"
 *                       venueUnits:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "671fbc20d6b2131a8e6b1f46"
 *                             title:
 *                               type: string
 *                               example: "Grand Ballroom"
 *                             verified:
 *                               type: boolean
 *                               example: false
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not admin)
 */

/**
 * @swagger
 * /api/admin/vendors/{vendorId}/venue/{venueId}/verify:
 *   put:
 *     summary: Verify a specific venue unit (admin only)
 *     description: Allows the admin to verify a specific venue unit under a vendor. Once verified, the venue is marked as trusted and visible to customers as a verified business.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: vendorId
 *         in: path
 *         required: true
 *         description: ID of the vendor who owns the venue
 *         schema:
 *           type: string
 *           example: 690252831d2bd3c18450e5e3
 *       - name: venueId
 *         in: path
 *         required: true
 *         description: ID of the specific venue unit to verify
 *         schema:
 *           type: string
 *           example: 690252831d2bd3c18450e5e4
 *     responses:
 *       200:
 *         description: Venue unit verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Venue "Grand Ballroom" verified successfully
 *                 venueUnit:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 690252831d2bd3c18450e5e4
 *                     title:
 *                       type: string
 *                       example: Grand Ballroom
 *                     verified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid vendor or venue ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Vendor or venue not found
 */

router.use(VerifyToken);

router.get("/vendors", VerifyToken, verifyAdmin, getAllVendors);

router.put(
  "/vendors/:vendorId/venue/:venueId/verify",
  VerifyToken,
  verifyAdmin,
  verifyVenue
);

export default router;
