import admin from 'firebase-admin';
import _ from 'lodash';

export function listAllUsers(nextPageToken): void {
  // List batch of users, 1000 at a time.
  admin
    .auth()
    .listUsers(1000, nextPageToken)
    .then(listUsersResult => {
      listUsersResult.users.forEach(userRecord => {
        console.log('user', userRecord.toJSON());
      });
      if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken);
      }
    })
    .catch(error => {
      console.log('Error listing users:', error);
    });
}

export async function createCustomToken(uid: string): Promise<string> {
  const additionalClaims: object = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': uid,
    },
  };

  try {
    return await admin.auth().createCustomToken(uid, additionalClaims);
  } catch (error) {
    throw error;
  }
}

export async function isAuth(req) {
  const sessionCookie = _.get(req, 'cookie.session', '');
  try {
    const claims = await admin.auth().verifySessionCookie(sessionCookie, true);
    return claims;
  } catch (error) {
    throw error;
  }
}
