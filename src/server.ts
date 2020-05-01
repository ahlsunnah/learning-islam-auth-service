require('dotenv').config();

import fastify from 'fastify';
import admin from 'firebase-admin';

const API_BASE = 'api/v1';

admin.initializeApp();

const fastifyInstence = fastify({ ignoreTrailingSlash: true, logger: true, caseSensitive: true });

// Plugins
fastifyInstence.register(require('fastify-cookie'));
fastifyInstence.register(require('fastify-cors'), {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
  'Access-Control-Allow-Credentials': true,
});

// API Routes
fastifyInstence.register(require('./routes/authentication'), { prefix: `${API_BASE}/auth` });
fastifyInstence.register(require('./routes/ping'), { prefix: `${API_BASE}/ping` });

const start = async () => {
  try {
    await fastifyInstence.listen(process.env.PORT);
  } catch (err) {
    fastifyInstence.log.error(err);
    process.exit(1);
  }
};

start();
