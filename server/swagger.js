import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Last Race - Metro Game API',
      version: '1.0.0',
      description: 'API for the Last Race web game - a single-player metro navigation game',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
          },
        },
        Line: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            color: { type: 'string' },
          },
        },
        Station: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            x: { type: 'integer' },
            y: { type: 'integer' },
          },
        },
        Segment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            station_a_id: { type: 'integer' },
            station_b_id: { type: 'integer' },
            line_id: { type: 'integer' },
            station_a_name: { type: 'string' },
            station_b_name: { type: 'string' },
          },
        },
        GameEvent: {
          type: 'object',
          properties: {
            segmentId: { type: 'integer' },
            event: { type: 'string' },
            coinEffect: { type: 'integer', minimum: -4, maximum: 4 },
            coinsAfter: { type: 'integer', minimum: 0 },
          },
        },
        Ranking: {
          type: 'object',
          properties: {
            rank: { type: 'integer' },
            id: { type: 'integer' },
            username: { type: 'string' },
            best_score: { type: 'integer' },
            game_count: { type: 'integer' },
          },
        },
      },
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie from login',
        },
      },
    },
    security: [
      {
        sessionAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
