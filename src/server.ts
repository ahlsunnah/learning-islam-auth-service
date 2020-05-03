require('dotenv').config();

import fastify from 'fastify';
import cookie from 'fastify-cookie';
import swagger from 'fastify-swagger';
import admin from 'firebase-admin';

const HOST = 'localhost';
const API_BASE = 'api/v1';
const SWAGGER_ROUTE = '/';

const SERVER_PORT = parseInt(process.env.PORT) || 5000;

admin.initializeApp();

const fastifyInstence = fastify({ ignoreTrailingSlash: true, logger: true, caseSensitive: true });

// Plugins
fastifyInstence.register(cookie);
fastifyInstence.register(require('fastify-cors'), {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
  'Access-Control-Allow-Credentials': true,
});

fastifyInstence.register(swagger, {
  routePrefix: SWAGGER_ROUTE,
  swagger: {
    info: {
      title: 'Learn islam public api',
      description:
        "REST API for general use cases (this api don't expose data, instead all data is provided by the Graphql server)",
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    host: HOST,
    schemes: ['http'],
    sonsumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'user', description: 'User related end-points' },
      { name: 'code', description: 'Code related end-points' },
    ],
    definitions: {
      User: {
        $id: 'User',
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string', nullable: true },
          lastName: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
        },
      },
    },
  },
  exposeRoute: true,
});

// API Routes
fastifyInstence.register(require('./routes/authentication'), { prefix: `${API_BASE}/auth` });
fastifyInstence.register(require('./routes/ping'), { prefix: `${API_BASE}/ping` });

const start = async () => {
  try {
    await fastifyInstence.listen(SERVER_PORT, '0.0.0.0');
  } catch (err) {
    fastifyInstence.log.error(err);
    process.exit(1);
  }
};

start();
