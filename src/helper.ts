import { getData, setData } from "./dataStore.js";
import fs from 'fs';
import path from 'path';

let store = getData();

const filePath = path.join(__dirname, 'dataStore.json');

export interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  quizOwnedby: number
}

export interface Session {
  userId: number;
  sessionId: string
}

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  sessions: Session[]
}

export function load(): DataStore {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(String(data));
}

export function save(data: DataStore) {
  const dataStr = JSON.stringify(data)
  fs.writeFileSync(filePath, dataStr);
}

/**
  * Given a quiz id
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
    const quiz = store.quizzes.find((quiz) => quiz.quizId === quizId);
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
    const user = store.users.find((user) => user.userId === authUserId);
    return user;
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
  * Checks if password is valid
  * 
  * @param {string} password
  * @returns {boolean} 
*/ 
export function isUserName(name: string) {
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
 * @returns {boolean}
*/
export function isEmail(email: string) {
  // const data = 
}


/**
  * Checks whether the string follows the requirements for a name.
  * 
  * @param {string} name
  * @returns {boolean} 
*/
export function isQuizName(name: string) {
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
