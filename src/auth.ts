import validator from 'validator';
import {
  isUserName,
  isPassword,
  checkEmail,
  load,
  save,
  User,
  Session,
} from './helper';
import { v4 as uuidv4 } from 'uuid';

let userUniqueId = 0;

/**
  * Register a user with an email, password, and names,
  * then returns their authUserId value.
  *
  * @param {string} email
  * @param {string} password
  * @param {string} nameFirst
  * @param {string} nameLast
  * @returns {{authUserId: number}}
*/
function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  if (!validator.isEmail(email)) {
    return {
      error: 'Invalid email'
    };
  }

  if (checkEmail(email)) {
    return {
      error: 'Email address is used by another user'
    };
  }

  if (!isPassword(password)) {
    return {
      error: 'Invalid password'
    };
  }

  if (!isUserName(nameFirst)) {
    return {
      error: 'Invalid first name'
    };
  }

  if (!isUserName(nameLast)) {
    return {
      error: 'Invalid last name'
    };
  }
  const data = load();
  const sessionId = uuidv4();
  userUniqueId++;

  const newUser: User = {
    userId: userUniqueId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  };
  const newSession: Session = {
    userId: userUniqueId,
    sessionId: sessionId
  };

  data.users.push(newUser);
  data.sessions.push(newSession);
  save(data);

  return {
    token: sessionId
  };
}

/**
  * Given a registered user's email and password
  * returns their authUserId value.
  *
  * @param {string} email
  * @param {string} password
  * @returns {{authUserId: number}}
*/
// function adminAuthLogin(email, password) {
//   const user = store.users.find((user) => user.email === email);
//   if (user === undefined) {
//     return {
//       error: 'Email address does not exist'
//     };
//   } else {
//     if (user.password !== password) {
//       user.numFailedPasswordsSinceLastLogin++;
//       return {
//         error: 'Password is not correct for the given email'
//       };
//     } else {
//       user.numSuccessfulLogins++;
//       user.numFailedPasswordsSinceLastLogin = 0;
//       return {
//         authUserId: user.userId
//       };
//     }
//   }
// }

// /**
//   * Given an admin user's authUserId, return details about the user.
//   *
//   * @param {number} authUserId - unique identifier
//   * @returns { user:
//   *   {
//   *   userId: number,
//   *   name : string,
//   *   email : string,
//   *   numSuccessfulLogins: number,
//   *   numFailedPasswordsSinceLastLogin: number
//   *   }
//   * }
//   * @returns {error: string} - AuthUserId is not a valid user
// */
// function adminUserDetails(authUserId) {
//   const user = checkauthUserId(authUserId);

//   if (user === undefined) {
//     return {
//       error : 'AuthUserId is not a valid use;'
//     }
//   } else {
//     const userName = user.nameFirst + ' ' + user.nameLast;
//     return { user:
//       {
//         userId: user.userId,
//         name: userName,
//         email: user.email,
//         numSuccessfulLogins: user.numSuccessfulLogins,
//         numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
//       }
//     }
//   }
// }

export {
  adminAuthRegister,
  // adminAuthLogin,
  // adminUserDetails,
};
