const swaggerDefinition = {
  swagger: "2.0",
  info: {
    title: "Event Management System API",
    description: "API documentation for the Event Management System",
    version: "1.0.0",
  },
  host:
    process.env.NODE_ENV === "production"
      ? "event-management-system-uipb.onrender.com"
      : "localhost:3000",
  basePath: "/api/v1",
  schemes: ["http"],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        description: "",
        parameters: [
          {
            name: "body",
            in: "body",
            schema: {
              type: "object",
              properties: {
                name: {
                  example: "any",
                },
                email: {
                  example: "any",
                },
                password: {
                  example: "any",
                },
                role: {
                  example: "any",
                },
              },
            },
          },
        ],
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        description: "",
        parameters: [
          {
            name: "body",
            in: "body",
            schema: {
              type: "object",
              properties: {
                email: {
                  example: "any",
                },
                password: {
                  example: "any",
                },
              },
            },
          },
        ],
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/createevent": {
      post: {
        tags: ["Event management (Admin access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        parameters: [
          {
            name: "body",
            in: "body",
            schema: {
              type: "object",
              properties: {
                title: {
                  example: "any",
                },
                description: {
                  example: "any",
                },
                category: {
                  example: "any",
                },
                location: {
                  example: "any",
                },
              },
            },
          },
        ],
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/allevents": {
      get: {
        tags: ["Event management (Admin and user access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/getevent/{id}": {
      get: {
        tags: ["Event management (Admin and user access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "string",
          },
        ],
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/updateevent/{id}": {
      patch: {
        tags: ["Event management (Admin access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            type: "string",
          },
          {
            name: "body",
            in: "body",
            schema: {
              type: "object",
              properties: {
                title: {
                  example: "any",
                },
                description: {
                  example: "any",
                },
                category: {
                  example: "any",
                },
                location: {
                  example: "any",
                },
              },
            },
          },
        ],
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/deleteevent": {
      delete: {
        tags: ["Event management (Admin access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        parameters: [
          {
            name: "body",
            in: "body",
            schema: {
              type: "object",
              properties: {
                ids: {
                  example: "any",
                },
              },
            },
          },
        ],
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/manage-registration": {
      post: {
        tags: ["Event management (Admin and user access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        parameters: [
          {
            name: "body",
            in: "body",
            schema: {
              type: "object",
              properties: {
                events: {
                  example: "any",
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: "OK",
          },
        },
      },
    },
    "/events/getallusersandtheirevents": {
      get: {
        tags: ["Event management (Admin access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/getuserevents": {
      get: {
        tags: ["Event management (Admin and user access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/manage-multiple-registrations": {
      post: {
        tags: ["Event management (Admin access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        parameters: [
          {
            name: "body",
            in: "body",
            schema: {
              type: "object",
              properties: {
                registrations: {
                  example: "any",
                },
              },
            },
          },
        ],
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/notifications/mark-notification-as-read": {
      post: {
        tags: ["Event management (Admin and user access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        parameters: [
          {
            name: "body",
            in: "body",
            schema: {
              type: "object",
              properties: {
                notificationIds: {
                  example: "any",
                },
              },
            },
          },
        ],
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
    "/events/notifications/getnotifications": {
      get: {
        tags: ["Event management (Admin and user access)"],
        security: [
          {
            Bearer: [],
          },
        ],
        description: "",
        responses: {
          default: {
            description: "",
          },
        },
      },
    },
  },
};

// Export the configuration
module.exports = swaggerDefinition;
