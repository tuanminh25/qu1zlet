import fs from 'fs';
import path from 'path';
import HttpError from 'http-errors';

const filePath = path.join(__dirname, '..', 'dataStore.json');

enum Colours {
  red = 'red',
  blue = 'blue',
  green = 'green',
  yellow = 'yellow',
  purple = 'purple',
  brown = 'brown',
  orange = 'orange'
}

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

export interface Answer {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface Question {
  questionId: number
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
}

export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  quizOwnedby: number;
  duration: number;
  numQuestions: number;
  questions: Question[]
}

export interface Session {
  userId: number;
  sessionId: string
}

export interface Ids {
  userId: number;
  quizId: number;
  questionId: number;
  answerId: number;
}

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  trash: Quiz[];
  sessions: Session[];
  ids: Ids
}

export interface ReturnQuizList {
  name: string;
  quizId: number
}

export interface ReturnUserDetails {
  userId: number,
  name: string,
  email: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
}

export interface returnQuizInfo {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question[],
  duration: number,
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
export function checkquizId(quizId: number): Quiz {
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
export function checkauthUserId(authUserId: number): User {
  const data = load();
  return data.users.find((user) => user.userId === authUserId);
}

/**
  * Checks if password is valid
  *
  * @param {string} password
  * @returns {boolean}
*/
export function isPassword(password: string): boolean {
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
export function checkEmail(email: string): User {
  const data = load();
  return data.users.find((user) => user.email === email);
}

/**
 * Given a token, check if it is valid
 * @param {string} token
 * @returns {boolean}
 */
export function isToken(token: string): Session {
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
export function isQuizDescription(name: string): boolean {
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
  return Math.floor(Date.now() / 1000);
}

/**
 * Generate a random colour
 * @param
 * @returns {Colours}
 *
 */
export function randomColour(): Colours {
  const coloursArray = Object.values(Colours);
  const randomIndex = Math.floor(Math.random() * coloursArray.length);
  const colour = coloursArray[randomIndex];
  return colour;
}

/**
 * Check if question exists inside the given quiz
 *
 * @param {number} questionId
 * @param {number} quizId
 * @returns
 */
export function isQuizQuestion(questionId: number, quizId: number) : Question {
  const quiz = checkquizId(quizId);
  const question = quiz.questions.find((q) => q.questionId === questionId);
  return question;
}

/**
 * Gets the sessionId given token
 *
 * @param {string} token
 * @return {Session}
 */
export function getSession(token: string): Session {
  const data = load();
  const session = data.sessions.find((session) => session.sessionId === token);

  if (!session) {
    throw HttpError(401, 'Invalid token');
  }

  return session;
}

/**
 * Check whether given quiz id is in trash or not
 *
 * @param {number} quizId
 * @return {Quiz}
 */
export function isQuizInTrash(quizId: number): Quiz {
  const data = load();
  return data.trash.find(quiz => quiz.quizId === quizId);
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
export function isQuizInCurrentQuizzies(quizId: number): Quiz {
  const data = load();
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  return quiz;
}
