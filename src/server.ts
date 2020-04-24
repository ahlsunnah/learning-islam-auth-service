require('dotenv').config();

import fastify from 'fastify';
import admin from 'firebase-admin';

const API_BASE = 'api/v1';

admin.initializeApp({
  credential: admin.credential.cert(require('../firebase.cert.json')),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const fastifyInstence = fastify({ ignoreTrailingSlash: true, logger: true, caseSensitive: true });

// Plugins
fastifyInstence.register(require('fastify-cookie'));
fastifyInstence.register(require('fastify-cors'), {
  'Access-Control-Allow-Origin': '*',
});

// API Routes
fastifyInstence.register(require('./routes/authentication'), { prefix: `${API_BASE}/auth` });
fastifyInstence.register(require('./routes/ping'), { prefix: `${API_BASE}/ping` });

const start = async () => {
  try {
    await fastifyInstence.listen(3000);
  } catch (err) {
    fastifyInstence.log.error(err);
    process.exit(1);
  }
};

start();
