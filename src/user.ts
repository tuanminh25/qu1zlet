import { 
  isToken, 
  load, 
  save, 
  isUserName,
  isPassword,
  checkEmail,
  checkauthUserId, } from './helper';
import validator from 'validator';


/**
  * For the given admin user that is logged in, return all of the relevant details
  *
  * @param {string} token
  * @returns { user:
*   {
    *   userId: number,
    *   name : string,
    *   email : string,
    *   numSuccessfulLogins: number,
    *   numFailedPasswordsSinceLastLogin: number
    *   }
    * }
    * @returns {error: string}
  */
export function adminUserDetails(token: string) {
  const session = isToken(token);

  if (!session) {
    return {
      error: 'Invalid token'
    };
  }

  const data = load();
  const user = data.users.find((user) => user.userId === session.userId);

  const userName = user.nameFirst + ' ' + user.nameLast;
  return {
    user: {
      userId: user.userId,
      name: userName,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
 * Given details relating to a password change,
 * update the password of a logged in user
 *
 * @param {string} token
 * @returns {}
 */
export function updatePassword(token: string, oldPassword: string, newPassword: string) {
  const session = isToken(token);

  if (!session) {
    return {
      error: 'Invalid token'
    };
  }

  const data = load();
  const user = data.users.find((user) => user.userId === session.userId);

  if (oldPassword !== user.password) {
    return {
      error: 'Incorrect old password'
    };
  }

  if (newPassword === oldPassword) {
    return {
      error: 'Old Password and New Password match exactly'
    };
  }

  if (user.usedPasswords.find((password) => password === newPassword)) {
    return {
      error: 'New Password has already been used before by this user'
    };
  }

  if (!isPassword(newPassword)) {
    return {
      error: 'Invalid new password'
    };
  }

  user.usedPasswords.push(oldPassword);
  user.password = newPassword;
  save(data);
  return {};
}

/**
  * For the given admin user that is logged in, update their details based on the input.
  *
  * @param {string} token
  * @param {string} email
  * @param {string} nameFirst
  * @param {string} nameLast
  * @returns { success: boolean }
  * @returns { error: string }
  */
export function userUpdateDetails(token: string, email: string, nameFirst: string, nameLast: string) {

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

  const session = isToken(token);

  if (token === "") {
    return {
      error: 'Invalid token'
    };
  }

  if (!session) {
    return {
      error: 'Invalid token'
    };
  }

  const data = load();
  const usedEmail = data.users.find((user) => user.email === email && user.userId !== session.userId);
  if (usedEmail) {
    return {
      error: 'Email is currently used by another user'
    };
  }

  const user = data.users.find((user) => user.userId === session.userId);
  if (!user) {
    return {
      error: 'Invalid token'
    };
  }

  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  save(data);

  return {};
}
