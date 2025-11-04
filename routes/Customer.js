import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/CustomerController.js";
import VerifyToken from "../middleware/VerifyToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer account and profile management
 */

/**
 * @swagger
 * /api/customers/me:
 *   get:
 *     summary: Get current customer's profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 *       403:
 *         description: Unauthorized access (non-customer)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/me", VerifyToken, getMyProfile);

/**
 * @swagger
 * /api/customers/me:
 *   put:
 *     summary: Update current customer's profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rahul Sharma"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.put("/me", VerifyToken, updateMyProfile);

export default router;
