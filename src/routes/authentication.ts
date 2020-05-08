import uuidv4 from 'uuid/v4';
import { FastifyInstance, RouteOptions } from 'fastify';
import admin from 'firebase-admin';
import isAuthorizedUser from '../hooks/isAuth';
import { createCustomToken } from '../utils/firebase';

const ROUTE_TAGS = ['authentication'];

async function routes(fastify: FastifyInstance, options: RouteOptions, next: any) {
  fastify.route({
    method: 'GET',
    url: '/token',
    schema: {
      tags: ROUTE_TAGS,
      response: {
        200: {
          type: 'string',
        },
      },
    },
    onRequest: isAuthorizedUser,
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
      tags: ROUTE_TAGS,
      body: {
        idToken: {
          type: 'string',
        },
      },
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
    onRequest: isAuthorizedUser,
    handler: async (req, res): Promise<void> => {
      const idToken = req.body.idToken;

      // Set session expiration to 5 days.
      const expiresIn = 60 * 60 * 24 * 5 * 1000;

      try {
        const claims = await admin.auth().verifyIdToken(idToken);

        const additionalClaims: object = {
          'https://hasura.io/jwt/claims': {
            'x-hasura-default-role': 'user',
            'x-hasura-allowed-roles': ['user'],
            'x-hasura-user-id': claims.uid,
          },
        };

        await admin.auth().setCustomUserClaims(claims.sub, additionalClaims);

        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

        // Set cookie policy for session cookie
        const options = {
          madAge: expiresIn,
          httpOnly: true,
          secure: true,
        };

        res.setCookie('session', sessionCookie, options).send({ status: 'success' });
      } catch (error) {
        res.code(401).send('UNAUTHORIZED REQUEST!');
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/addNewUser',
    schema: {
      tags: ROUTE_TAGS,
      body: {
        email: {
          type: 'string',
        },
        password: {
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
      const email = req.body.email;
      const password = req.body.password;

      const user = await admin.auth().createUser({
        email,
        password,
      });

      try {
        const additionalClaims: object = {
          'https://hasura.io/jwt/claims': {
            'x-hasura-default-role': 'user',
            'x-hasura-allowed-roles': ['user'],
            'x-hasura-user-id': user.uid,
          },
        };

        await admin.auth().setCustomUserClaims(user.uid, additionalClaims);

        res.send({ status: 'custom claims have been set correctly' });
      } catch (error) {
        res.code(401).send({ status: 'unauthorized request' });
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/sessionLogout',
    schema: {
      tags: ROUTE_TAGS,
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
    onRequest: isAuthorizedUser,
    handler: async (req, res): Promise<void> => {
      try {
        const sessionCookie = req.cookies.session || '';
        res.clearCookie('session');

        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie);

        await admin.auth().revokeRefreshTokens(decodedClaims.sub);
      } catch (error) {
        res.code(401).send('UNAUTHORIZED REQUEST!');
      }
    },
  });

  next();
}

module.exports = routes;
