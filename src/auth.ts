import validator from 'validator';
import {
  isUserName,
  isPassword,
  checkEmail,
  load,
  save,
  User,
  Session,
  passwordHash,
  getSession
} from './helper';
import { v4 as uuidv4 } from 'uuid';
import HttpError from 'http-errors';

/**
  * Takes in information about a new admin user and registers them in the system
  *
  * @param {string} email
  * @param {string} password
  * @param {string} nameFirst
  * @param {string} nameLast
  * @returns {{token: string}}
*/
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): { token: string } {
  if (!validator.isEmail(email)) {
    throw HttpError(400, 'Invalid email');
  }

  if (checkEmail(email)) {
    throw HttpError(400, 'Email address is used by another user');
  }

  if (!isPassword(password)) {
    throw HttpError(400, 'Invalid Password');
  }

  if (!isUserName(nameFirst)) {
    throw HttpError(400, 'Invalid first name');
  }

  if (!isUserName(nameLast)) {
    throw HttpError(400, 'Invalid last name');
  }

  const data = load();
  const sessionId = uuidv4();
  const newUserId = ++data.ids.userId;

  const newUser: User = {
    userId: newUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: passwordHash(password),
    usedPasswords: [],
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  };
  const newSession: Session = {
    userId: newUserId,
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
  * Takes in information about an admin user to determine if they can log in to manage quizzes
  *
  * @param {string} email
  * @param {string} password
  * @returns {{token: string}}
*/
export function adminAuthLogin(email: string, password: string): { token: string } {
  let userLogin = checkEmail(email);
  if (!userLogin) {
    throw HttpError(400, 'Email does not exist');
  }

  const data = load();
  userLogin = data.users.find((user) => user.userId === userLogin.userId);

  if (userLogin.password !== passwordHash(password)) {
    userLogin.numFailedPasswordsSinceLastLogin++;
    save(data);
    throw HttpError(400, 'Password is not correct for the given email');
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
 * Should be called with a token that is returned
 * after either a login or register has been made
 *
 * @param {string} token
 * @return {{}}
 */
export function adminAuthLogout(token: string): Record<string, never> {
  const session = getSession(token);

  const data = load();
  const newSessions = data.sessions.filter((item) => item.sessionId !== session.sessionId);
  data.sessions = newSessions;
  save(data);

  return {};
}
