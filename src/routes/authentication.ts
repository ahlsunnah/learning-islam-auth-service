import uuidv4 from 'uuid/v4';
import admin from 'firebase-admin';
import { createCustomToken } from '../utils/firebase';

async function routes(fastify, options, next) {
  fastify.route({
    method: 'GET',
    url: '/token',
    schema: {
      response: {
        200: {
          type: 'string',
        },
      },
    },
    handler: async (req, res): Promise<void> => {
      try {
        const token: string = await createCustomToken(uuidv4());

        res.code(200).send(token);
      } catch (error) {
        res.code(401).send('TOKEN FAILED');
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/sessionLogin',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
          },
        },
        401: {
          type: 'string',
        },
      },
    },
    handler: async (req, res): Promise<void> => {
      // Get the ID token passed and the CSRF token.

      const idToken = req.body.idToken.toString();

      const csrfToken = req.body.csrfToken.toString();
      // Guard against CSRF attacks.
      if (csrfToken !== req.cookies.csrfToken) {
        res.code(401).send('UNAUTHORIZED REQUEST!');
        return;
      }

      // Set session expiration to 5 days.
      const expiresIn = 60 * 60 * 24 * 5 * 1000;

      try {
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

        // Set cookie policy for session cookie
        const options = {
          madAge: expiresIn,
          httpOnly: true,
          secure: true,
        };

        res.setCookie('session', sessionCookie, options).send(JSON.stringify({ status: 'success' }));
      } catch (error) {
        res.code(401).send('UNAUTHORIZED REQUEST!');
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/setCustomClaims',
    schema: {
      body: {
        idToken: {
          type: 'string',
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
          },
        },
      },
    },
    handler: async (req, res) => {
      const idToken = req.body.idToken;
      const additionalClaims: object = {
        'https://hasura.io/jwt/claims': {
          'x-hasura-default-role': 'user',
          'x-hasura-allowed-roles': ['user'],
          'x-hasura-user-id': idToken,
        },
      };

      try {
        const claims = await admin.auth().verifyIdToken(idToken);
        await admin.auth().setCustomUserClaims(claims.sub, additionalClaims);

        res.send({ status: 'custom claims have been set correctly' });
      } catch (error) {
        res.code(401).send({ status: 'unauthorized request' });
      }
    },
  });

  next();
}

module.exports = routes;
