import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Admin API",
      version: "1.0.0",
      description: "Documentation for your Admin API endpoints",
    },
    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Local server",
      },
    ],
  },
  apis: ["./app/api/**/*.ts"], // adjust based on your routes folder
};

export const swaggerSpec = swaggerJSDoc(options);
