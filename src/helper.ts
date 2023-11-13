import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import HttpError from 'http-errors';

const filePath = path.join(__dirname, 'dataStore.json');

enum Colours {
  red = 'red',
  blue = 'blue',
  green = 'green',
  yellow = 'yellow',
  purple = 'purple',
  brown = 'brown',
  orange = 'orange'
}

export enum GameState {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum GameAction {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

export interface PlayerStatus {
  state: GameState,
  numQuestions: number,
  atQuestion: number
}

export interface Player {
  // Game session id this player belong to
  sessionId: number,
  name: string,
  playerId: number,
  state: GameState,
  numQuestions: number,
  atQuestion: number
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
  thumbnailUrl: string,
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
  questions: Question[];
  thumbnailUrl: string;
  activeSessions: number[];
  inactiveSessions: number[]
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
  gameSessionId: number;
  playerId: number;
}

export interface GameSession {
  gameSessionId: number,
  state: GameState;
  atQuestion: number;
  players: Player[];
  metadata: Quiz;
  autoStartNum: number
}

export interface DataStore {
  users: User[];
  quizzes: Quiz[];
  trash: Quiz[];
  sessions: Session[];
  gameSessions: GameSession[];
  ids: Ids;
  players: Player[];
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

export interface ReturnQuizInfo {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question[],
  duration: number,
  thumbnailUrl: string
}

export interface ReturnGameSession {
  state: GameState,
  atQuestion: number;
  players: string[];
  metadata: ReturnQuizInfo;
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
  if (!quiz) {
    throw HttpError(403, 'Quiz does not exist');
  }
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
 * Hash password for security
 *
 * @param {string} plaintext
 */
export function passwordHash(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
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

/**
  * Given a list of player objects
  * Return Player name sorted in alphabetical order
  * @param {Player[]} playerArray
  * @returns { string[] }
*/
export function sortPlayerNames(playerArray: Player[]): string[] {
  const nameList : string[] = [];
  for (const player of playerArray) {
    nameList.push(player.name);
  }
  return nameList.sort();
}

/**
  * Given a game session id
  * Return that game session if exist
  * @param {number} gameSessionId
  * @returns { GameSession }
  *
*/
export function findGameSession(gameSessionId: number) {
  const data = load();
  return data.gameSessions.find(gameSession => gameSession.gameSessionId === gameSessionId);
}

/**
  * Given a game player name or id and a gameSessionId
  * Return that player if exist
  * @param {string} playerName
  * @param {number} playerId
  *
  * @returns { Player }
  * This version check from dataStore.gameSession
  * Find the correct session then
  * Check for player in that session
  *
*/
export function findPlayerFromGameId(gameSessionId: number, playerName?: string, playerId?: number) {
  const gameSession = findGameSession(gameSessionId);
  if (gameSession === undefined) {
    throw HttpError('Wrong gameSessionId: ');
  }

  if (playerName !== undefined) {
    return gameSession.players.find(player => player.name === playerName);
  }

  if (playerId !== undefined) {
    return gameSession.players.find(player => player.playerId === playerId);
  }

  throw HttpError('Either player name or player id is wrong !');
}

/**
  * Given a game player name or id and a gameSessionId
  *
  * Return that player if exist
  * @param {string} playerName
  * @param {number} playerId
  *
  * @returns { Player }
  * This version check from dataStore.players
*/
export function findPlayerFromGameId2(gameSessionId: number, playerName?: string, playerId?: number) {
  if (playerName === undefined && playerId === undefined) {
    throw HttpError('Either player name or player id is wrong !');
  }

  const data = load();
  for (const player of data.players) {
    if (player.name === playerName && player.sessionId === gameSessionId) {
      return player;
    }
  }
  return undefined;
}

/**
 * generate a name which satisfies
 * the structure "[5 letters][3 numbers]" (e.g. valid123, ifjru483, ofijr938)
 *  where there are no repetitions of numbers or characters within the same name
  * @returns { string }
  *
*/
export function generateRandomName() {
  // Define characters and numbers
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  // Convert the string to an array and shuffle it
  const shuffledChar = characters.split('').sort(() => Math.random() - 0.5);
  const shuffledNum = numbers.split('').sort(() => Math.random() - 0.5);

  // Select the first 5 characters for the string
  const randomChars = shuffledChar.slice(0, 5).join('');

  // Select the last 3 numbers for the string
  const randomNumbers = shuffledNum.sort(() => Math.random() - 0.5).slice(0, 3).join('');

  // Concatenate characters and numbers to form the final string
  return randomChars + randomNumbers;
}

/**
 * Update player state along with game state
  * @param {number} playerId
  *
*/
export function updatePlayerState(gameSession: GameSession, data: DataStore) {
  for (const player of gameSession.players) {
    player.state = gameSession.state;
    player.numQuestions = gameSession.metadata.numQuestions;
    player.atQuestion = gameSession.atQuestion;
  }

  for (const player of data.players) {
    if (player.sessionId === gameSession.gameSessionId) {
      player.state = gameSession.state;
      player.numQuestions = gameSession.metadata.numQuestions;
      player.atQuestion = gameSession.atQuestion;
    }
  }
}
