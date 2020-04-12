import uuidv4 from 'uuid/v4';
import { createCustomToken } from '../utils/firebase';

async function routes(fastify, options, next) {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: {
          type: 'string',
        },
      },
    },
    handler: async (req, res) => {
      try {
        const token = await createCustomToken(uuidv4());

        res.send(token);
      } catch (error) {
        throw error;
      }
    },
  });

  next();
}

export default routes;
