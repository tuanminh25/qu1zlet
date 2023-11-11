import {
  isToken,
  checkauthUserId,
  checkquizId,
  isQuizDescription,
  isQuizName,
  generateTime,
  Quiz,
  load,
  save,
  ReturnQuizList,
  ReturnQuizInfo,
  getSession
} from './helper';
import HttpError from 'http-errors';

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *  then returns a quizId.
  *
  * @param {string} token
  * @param {string} name
  * @param {string} description
  * @returns {{ quizId: number }}
*/
export function adminQuizCreate(token: string, name: string, description: string): { quizId: number } {
  const userId = getSession(token).userId;
  const data = load();

  // Error checking 400
  const quizExists = data.quizzes.find((quiz) => quiz.name === name);
  if (quizExists && quizExists.quizOwnedby === userId) {
    throw HttpError(400, 'Quiz name already exists');
  } else if (!isQuizName(name)) {
    throw HttpError(400, 'Invalid quiz name');
  } else if (!isQuizDescription(description)) {
    throw HttpError(400, 'Invalid quiz description');
  }

  const newQuiz: Quiz = {
    quizId: ++data.ids.quizId,
    name: name,
    timeCreated: generateTime(),
    timeLastEdited: generateTime(),
    description: description,
    quizOwnedby: userId,
    duration: 0,
    numQuestions: 0,
    questions: [],
    thumbnailUrl: '',
    activeSessions: [],
    inactiveSessions: []
  };

  data.quizzes.push(newQuiz);
  save(data);

  return {
    quizId: newQuiz.quizId,
  };
}

/**
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param {string} token
  * @param {number} quizId
  * @returns {}
*/
export function adminQuizRemove(token: string, quizId: number): Record<string, never> {
  const data = load();
  const quiz = checkquizId(quizId);
  const session = getSession(token);

  if (quiz.quizOwnedby !== session.userId) {
    throw HttpError(403, 'Unauthorised');
  }

  if (quiz.activeSessions.length > 0) {
    throw HttpError(400, 'Game has not ended');
  }

  quiz.timeLastEdited = generateTime();
  const filteredArray = data.quizzes.filter(obj => obj.quizId !== quizId);
  data.quizzes = filteredArray;
  data.trash.push(quiz);
  save(data);
  return {};
}

/**
  * Given a token
  * Return a list of all quizzes that are owned by the currently logged in user.
  *
  *
  * @param {string} token
  * @returns { quizzes: [
*  {
  *   quizId: number,
  *   name: string,
  *  }
  * ]}
*/
export function adminQuizList(token: string): { error?: string, quizzes?: ReturnQuizList[]} {
  const data = load();
  const session = isToken(token);

  // Check errors:
  // Invalid token
  if (session === undefined) {
    return { error: 'Token is empty or invalid' };
  }

  // Working cases:
  // Find user corresponding to the token
  const quizzes = [];
  for (const quiz of data.quizzes) {
    if (session.userId === quiz.quizOwnedby) {
      quizzes.push({
        name: quiz.name,
        quizId: quiz.quizId,
      });
    }
  }

  return {
    quizzes
  };
}

/**
 * Get all of the relevant information about the current quiz
 * including questions
 *
 * @param {string} token - unique user identifier
 * @param {number} quizId - unique quiz identifier
 * @returns {
 *  quizId: number,
 *  name: string,
 *  timeCreated: number,
 *  timeLastEdited: number,
 *  description: string,
 *  numQuestions: number,
 *  questions: Question[],
 *  duration
 * }
 * @returns {error: string}
 *
 */
export function adminQuizInfo(token: string, quizId: number): ReturnQuizInfo {
  const session = getSession(token);
  const quiz = checkquizId(quizId);

  if (quiz.quizOwnedby !== session.userId) {
    throw HttpError(403, 'Unauthorised');
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl
  };
}

/**
 * Update the name of the relevant quiz
 *
 * @param {string} token - unique user identifier
 * @param {number} quizId - unique quiz identifier
 * @param {string} name - new name of quiz
 * @returns {} - updates name of quiz in datastore
 * @returns {error: string} - invalid parameters entered
*/
export function adminQuizNameUpdate(token: string, quizId : number, name: string): Record<string, never> | { error?: string } {
  const data = load();
  const session = isToken(token);
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  // error 401
  if (!session) {
    return {
      error: 'Invalid Token'
    };
  }

  // error 403
  if (quiz.quizOwnedby !== session.userId) {
    return {
      error: 'Unauthorised'
    };
  }

  // error 400
  if (isQuizName(name) === false) {
    return {
      error: 'Invalid Quiz Name'
    };
  }
  if (data.quizzes.some((quiz) => quiz.name === name)) {
    return {
      error: 'Quiz name already exists'
    };
  }

  // Working case
  quiz.name = name;
  quiz.timeLastEdited = generateTime();

  save(data);
  return {};
}

/**
 * Transfer ownership of a quiz to a different user based on their email
 *
 * @param {string} token
 * @param {number} quizId
 * @param {number} userEmail
 * @returns {}
 * @returns {error: string} -
 */
export function adminQuizTransfer(token: string, quizId: number, userEmail: string): Record<string, never> | { error?: string } {
  const data = load();
  const session = isToken(token);
  const quizFound = data.quizzes.find(q => q.quizId === quizId);

  // error 401
  if (!session) {
    return {
      error: 'Invalid Token'
    };
  }

  // error 403
  if (quizFound.quizOwnedby !== session.userId) {
    return {
      error: 'Unauthorised'
    };
  }

  // error 400
  const email = data.users.find(user => user.email === userEmail);
  if (!email) {
    return {
      error: 'Email not found'
    };
  }

  const user = checkauthUserId(session.userId);
  const currEmail = user.email;
  if (userEmail === currEmail) {
    return {
      error: 'userEmail cannot already be the owner of the quiz'
    };
  }

  const userquizzes = data.quizzes.filter(quiz => quiz.quizOwnedby === email.userId);
  const duplicateQuiz = userquizzes.find(quiz => quiz.name === quizFound.name);
  if (duplicateQuiz) {
    return {
      error: 'Quiz name already exists for target user',
    };
  }
  quizFound.quizOwnedby = email.userId;
  save(data);

  return {};
}

/**
 * Update a quiz description
 *
 * @param {string} token - unique user identifier
 * @param {number} quizId - unique quiz identifier
 * @param {string} description - description
 *
 * @returns {error: string}
 * @returns {}
 *
 */
export function adminQuizDescriptionUpdate (token: string, quizId: number, description: string): Record<string, never> {
  const data = load();
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  const session = getSession(token);

  if (quiz === undefined) {
    throw HttpError(403, 'Unauthorised');
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (quiz.quizOwnedby !== session.userId) {
    throw HttpError(403, 'Unauthorised');
  }

  // Over length description
  if (description.length > 100) {
    throw HttpError(400, 'Invalid quiz description');
  }

  // Working case
  quiz.description = description;
  quiz.timeLastEdited = generateTime();
  save(data);
  return {};
}
