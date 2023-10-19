import validator from 'validator';
import {
  isUserName,
  isPassword,
  checkEmail,
  isToken,
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
  * @returns {{token: string}}
*/
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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
  * @returns {{token: string}}
*/
export function adminAuthLogin(email: string, password: string) {
  let userLogin = checkEmail(email);
  if (!userLogin) {
    return {
      error: 'Email address does not exist'
    };
  }

  const data = load();
  userLogin = data.users.find((user) => user.userId === userLogin.userId);

  if (userLogin.password !== password) {
    userLogin.numFailedPasswordsSinceLastLogin++;
    save(data);
    return {
      error: 'Password is not correct for the given email'
    };
  }

  const sessionId = uuidv4();
  userLogin.numSuccessfulLogins++;
  userLogin.numFailedPasswordsSinceLastLogin = 0;

  const newSession: Session = {
    userId: userLogin.userId,
    sessionId: sessionId
  };

  data.sessions.push(newSession);
  save(data);

  return {
    token: sessionId
  };
}

/**
  * Given an admin user's authUserId, return details about the user.
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
  * @returns {error: string} - AuthUserId is not a valid user
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
    user:
    {
      userId: user.userId,
      name: userName,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
 * Given an admin user's token and log out of session
 * 
 * @param {string} token
 * @return {{}}
 */
export function adminAuthLogout(token: string) {
  const session = isToken(token);

  if (!session) {
    return {
      error: 'Invalid token'
    };
  }

  const data = load();
  const newSessions = data.sessions.filter((item) => item !== session);
  data.sessions = newSessions;
  save(data);

  return {};
}