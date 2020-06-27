import fastify from 'fastify';
import admin from 'firebase-admin';
import _ from 'lodash';

export default async function isAdmin(
  request: fastify.FastifyRequest,
  replay: fastify.FastifyReply<any>
): Promise<void> {
  const { headers } = request;

  const userIdToken = _.get(headers, 'authorization');

  if (!userIdToken) replay.code(401).send({ status: 'Unauthorized request' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(userIdToken.split(' ')[1]);

    if (!_.includes(process.env.EMAIL_LIST, decodedToken.email)) {
      throw 'Unauthorized request';
    }

    return;
  } catch (error) {
    request.log.info('isAuthorizedUser error :', error);
    replay.code(401).send({ status: 'User is not logged in' });
  }
}
