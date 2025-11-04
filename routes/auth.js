import express from "express";
import multer from "multer";
import { register, login ,vendorRegister} from "../controllers/AuthController.js";
import upload from "../middleware/uploadImage.js";
const router = express.Router();
const storage = multer.memoryStorage();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: APIs for user and vendor registration, login, and authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new customer account
 *     tags: [Authentication]
 *     description: Registers a new user with role "customer" and optional profile photo upload.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rohan Sharma"
 *               email:
 *                 type: string
 *                 example: "rohan@example.com"
 *               password:
 *                 type: string
 *                 example: "securePass123"
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile photo to upload
 *     responses:
 *       201:
 *         description: Customer registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer registration successful
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated access
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: customer
 *                     profilePhoto:
 *                       type: string
 *                       example: "https://res.cloudinary.com/demo/image/upload/v12345/photo.jpg"
 *       400:
 *         description: Missing required fields or user already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/vendorRegister:
 *   post:
 *     summary: Register a vendor (freelancer, venue owner, or event management team)
 *     tags: [Authentication]
 *     description: Creates a vendor account and uploads profile photo, portfolio, and venue images.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - type
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Royal Banquets"
 *               email:
 *                 type: string
 *                 example: "royal@example.com"
 *               password:
 *                 type: string
 *                 example: "banquetPass123"
 *               type:
 *                 type: string
 *                 enum: [freelancer, venue, event_team]
 *                 example: "venue"
 *               city:
 *                 type: string
 *                 example: "Pune"
 *               contactNumber:
 *                 type: string
 *                 example: "9876543210"
 *               description:
 *                 type: string
 *                 example: "Luxury banquet hall with catering services"
 *               freelancerCategory:
 *                 type: string
 *                 example: "photographer"
 *               basePrice:
 *                 type: number
 *                 example: 15000
 *               eventTypes:
 *                 type: string
 *                 example: "wedding,corporate,birthday"
 *               packageName:
 *                 type: string
 *                 example: "Premium Wedding Package"
 *               packageDescription:
 *                 type: string
 *                 example: "Includes decor, DJ, and catering"
 *               packagePrice:
 *                 type: number
 *                 example: 80000
 *               venue[0].title:
 *                 type: string
 *                 example: "Main Hall"
 *               venue[0].capacity:
 *                 type: number
 *                 example: 300
 *               venue[0].pricePerDay:
 *                 type: number
 *                 example: 20000
 *               venue[0].amenities:
 *                 type: string
 *                 example: "AC,Parking,WiFi"
 *               venue[0].images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Venue images
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *               portfolio:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vendor registered successfully
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: vendor
 *                 vendor:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                       example: venue
 *                     city:
 *                       type: string
 *                     profilePhoto:
 *                       type: string
 *                     portfolio:
 *                       type: array
 *                       items:
 *                         type: string
 *                     venueUnits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           capacity:
 *                             type: number
 *                           pricePerDay:
 *                             type: number
 *                           amenities:
 *                             type: array
 *                             items:
 *                               type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *       400:
 *         description: Missing required fields or invalid vendor data
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login for all user types (customer, vendor, admin)
 *     tags: [Authentication]
 *     description: Authenticates user credentials and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "rohan@example.com"
 *               password:
 *                 type: string
 *                 example: "securePass123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: vendor
 *                 vendorProfile:
 *                   type: object
 *                   nullable: true
 *                   description: Vendor profile details if user is a vendor
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.post("/register", upload.any(), register);
router.post("/vendorRegister", upload.any(), vendorRegister);
router.post("/login", login);

export default router;
