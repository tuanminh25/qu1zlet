import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, 'dataStore.json');

export interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  usedPasswords: string[],
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  quizOwnedby: number,
  duration: number,
  numQuestions: number,
  questions: any[]
}

export interface Session {
  userId: number;
  sessionId: string
}

export interface Ids {
  userId: number;
  quizId: number;
  questionId: number
}

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  trash: Quiz[];
  sessions: Session[];
  ids: Ids
}

export function load(): DataStore {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(String(data));
}

export function save(data: DataStore) {
  const dataStr = JSON.stringify(data);
  fs.writeFileSync(filePath, dataStr);
}

/**
  * Given a quiz id, returns the quiz and its
  *
  * @param {string} quizId
  * @returns { quiz:
  *   {
  *     quizId,
  *     name,
  *     timeCreated,
  *     timeLastEdited,
  *     description,
  *   }
  * }
  * @returns {undefined} - quizId is not a valid quiz id
*/
export function checkquizId(quizId: number) {
  const data = load();
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  return quiz;
}

/**
  * Given a an auth user id
  *
  * @param {string} authUserId
  * @returns { user:
    *   {
    *   userId: number,
    *   name : string,
    *   email : string,
    *   numSuccessfulLogins: number,
    *   numFailedPasswordsSinceLastLogin: number
    *   }
    * }
    * @returns {undefined} - AuthUserId is not a valid user
  */
export function checkauthUserId(authUserId: number) {
  const data = load();
  return data.users.find((user) => user.userId === authUserId);
}

/**
  * Checks if password is valid
  *
  * @param {string} password
  * @returns {boolean}
*/
export function isPassword(password: string) {
  if (password.length < 8) {
    return false;
  } else if (/\d/.test(password) === false || /[a-zA-Z]/.test(password) === false) {
    return false;
  } else {
    return true;
  }
}

/**
  * Checks if username is valid
  *
  * @param {string} password
  * @returns {boolean}
*/
export function isUserName(name: string): boolean {
  if (name.length < 2 || name.length > 20) {
    return false;
  } else if (/^[a-zA-Z\s'-]+$/.test(name) === false) {
    return false;
  } else {
    return true;
  }
}

/**
 * Checks if email exists
 *
 * @param {string} email
 * @returns {}
*/
export function checkEmail(email: string) {
  const data = load();
  return data.users.find((user) => user.email === email);
}

export function isToken(token: string) {
  const data = load();
  return data.sessions.find((session) => session.sessionId === token);
}

/**
  * Checks whether the string follows the requirements for a name.
  *
  * @param {string} name
  * @returns {boolean}
*/
export function isQuizName(name: string): boolean {
  if (name.length < 3 || name.length > 30) {
    return false;
  } else if (/^[\w\s]+$/.test(name) === false) {
    return false;
  } else {
    return true;
  }
}

/**
  * Checks whether the string follows the requirements for a description.
  *
  * @param {string} name
  * @returns {boolean}
*/
export function isQuizDescription(name: string) {
  if (name.length > 100) {
    return false;
  } else {
    return true;
  }
}

/**
  * Creates a Timestamp
  *
  * @returns {number} 
*/
export function generateTime(): number {
  return Date.now() / 1000;
}
