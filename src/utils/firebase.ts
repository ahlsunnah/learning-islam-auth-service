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

  return await admin.auth().createCustomToken(uid, additionalClaims);
}

export async function isAuthWithCookie(req) {
  const sessionCookie = _.get(req, 'cookie.session', '');
  return await admin.auth().verifySessionCookie(sessionCookie, true);
}
