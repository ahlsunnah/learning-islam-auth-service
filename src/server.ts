require('dotenv').config();

import fastify from 'fastify';

const fastifyInstence = fastify({ ignoreTrailingSlash: true, logger: true, caseSensitive: true });

const start = async () => {
  try {
    await fastifyInstence.listen(3000);
  } catch (err) {
    fastifyInstence.log.error(err);
    process.exit(1);
  }
};

start();
