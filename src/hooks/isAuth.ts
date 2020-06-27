import fastify from 'fastify';
import _ from 'lodash';
import admin from 'firebase-admin';

// rfc6749 OAuth 2.0 https://tools.ietf.org/html/rfc6749
// If you entend to make changes to the auth flow make sure you are
// respecting OAuth 2.0 general flow

export default async function isAuthorizedUser(
  request: fastify.FastifyRequest,
  replay: fastify.FastifyReply<any>
): Promise<void> {
  const { headers } = request;

  const userIdToken = _.get(headers, 'Authorization');

  if (!userIdToken) replay.code(401).send({ status: 'Unauthorized request' });

  try {
    await admin.auth().verifyIdToken(userIdToken.split(' ')[1]);
  } catch (error) {
    request.log.info('isAuthorizedUser error :', error);
    replay.code(401).send({ status: 'Unauthorized request' });
  }
}
