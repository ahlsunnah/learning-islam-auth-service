require('dotenv').config();

import fastify from 'fastify';
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const fastifyInstence = fastify({ ignoreTrailingSlash: true, logger: true, caseSensitive: true });

fastifyInstence.register(require('./routes/authentication'), { prefix: '/auth' });
fastifyInstence.register(require('fastify-cookie'));

const start = async () => {
  try {
    await fastifyInstence.listen(3000);
  } catch (err) {
    fastifyInstence.log.error(err);
    process.exit(1);
  }
};

start();
