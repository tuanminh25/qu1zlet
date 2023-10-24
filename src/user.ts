import { 
  isToken, 
  load, 
  save, 
  isUserName,
  isPassword,
  checkEmail, } from './helper';
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

