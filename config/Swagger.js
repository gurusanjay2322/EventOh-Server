import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event-Oh API",
      version: "1.0.0",
      description: `
        🪩 Event-Oh — All-in-one Event Management Platform API <br/>
        Supports vendor registration (freelancers, venues, event teams), customer registration, and bookings.
      `,
      contact: {
        name: "Event-Oh Dev Team",
        email: "support@eventoh.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Dev Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        VendorFreelancer: {
          type: "object",
          properties: {
            name: { type: "string", example: "Rohan Photographer" },
            email: { type: "string", example: "rohan@example.com" },
            password: { type: "string", example: "123456" },
            vendor: {
              type: "object",
              properties: {
                type: { type: "string", example: "freelancer" },
                city: { type: "string", example: "Bangalore" },
                freelancerCategory: { type: "string", example: "photographer" },
                description: {
                  type: "string",
                  example: "Wedding photographer with 5 years of experience",
                },
                pricing: {
                  type: "object",
                  properties: {
                    basePrice: { type: "number", example: 15000 },
                    currency: { type: "string", example: "INR" },
                  },
                },
              },
            },
          },
        },

        VendorVenue: {
          type: "object",
          properties: {
            name: { type: "string", example: "Royal Banquets" },
            email: { type: "string", example: "royal@example.com" },
            password: { type: "string", example: "venue123" },
            vendor: {
              type: "object",
              properties: {
                type: { type: "string", example: "venue" },
                city: { type: "string", example: "Pune" },
                description: {
                  type: "string",
                  example: "Premium indoor and outdoor event halls",
                },
                venueUnits: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", example: "Grand Ballroom" },
                      capacity: { type: "number", example: 400 },
                      pricePerDay: { type: "number", example: 50000 },
                      amenities: {
                        type: "array",
                        items: { type: "string", example: "AC Hall" },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        VendorEventTeam: {
          type: "object",
          properties: {
            name: { type: "string", example: "Dream Weddings Co." },
            email: { type: "string", example: "dreams@example.com" },
            password: { type: "string", example: "plannerpass" },
            vendor: {
              type: "object",
              properties: {
                type: { type: "string", example: "event_team" },
                city: { type: "string", example: "Bangalore" },
                description: {
                  type: "string",
                  example:
                    "End-to-end wedding planners with decor, catering, and photography",
                },
                eventTeamDetails: {
                  type: "object",
                  properties: {
                    eventTypesCovered: {
                      type: "array",
                      items: { type: "string", example: "wedding" },
                    },
                    packages: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", example: "Premium" },
                          price: { type: "number", example: 200000 },
                          includedServices: {
                            type: "array",
                            items: { type: "string", example: "Decor" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // 👇 Use a glob pattern to include ALL routes in subfolders too
  apis: [path.join(__dirname, "../routes/**/*.js")],
};

const swaggerSpec = swaggerJsDoc(options);

export { swaggerUi, swaggerSpec };
