import admin from 'firebase-admin';

export function listAllUsers(nextPageToken) {
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

export async function createCustomToken(uid) {
  const additionalClaims = {
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
