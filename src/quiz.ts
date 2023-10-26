import {
  isToken,
  checkauthUserId,
  checkquizId,
  isQuizDescription,
  isQuizName,
  generateTime,
  Quiz,
  load,
  save
} from './helper';

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *  then returns a quizId.
  *
  * @param {string} token
  * @param {string} name
  * @param {string} description
  * @returns {{ quizId: number }}
*/
export function adminQuizCreate(token: string, name: string, description: string) {
  const session = isToken(token);
  const data = load();

  // Error checking 401
  if (!session) {
    return {
      error: 'Invalid Token'
    };
  }

  const userId = isToken(token).userId;
  const userExists = checkauthUserId(userId);
  if (!userExists) {
    return {
      error: 'Invalid Token'
    };
  }

  // Error checking 400
  if (data.quizzes.some((quiz) => quiz.name === name)) {
    return {
      error: 'Quiz name already exists'
    };
  } else if (!isQuizName(name)) {
    return {
      error: 'Invalid quiz name'
    };
  } else if (!isQuizDescription(description)) {
    return {
      error: 'Invalid quiz description'
    };
  }

  const newQuiz: Quiz = {
    quizId: ++data.ids.quizId,
    name: name,
    timeCreated: generateTime(),
    timeLastEdited: generateTime(),
    description: description,
    quizOwnedby: session.userId,
    duration: 0,
    numQuestions: 0,
    questions: [],
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
export function adminQuizRemove(token: string, quizId: number) {
  const data = load();
  const quiz = checkquizId(quizId);
  const session = isToken(token);

  if (!session) {
    return {
      error: 'Invalid Token'
    };
  }

  const userExists = checkauthUserId(session.userId);
  if (!userExists) {
    return {
      error: 'Invalid Token'
    };
  }

  if (!quiz) {
    return {
      error: 'Quiz does not exist'
    };
  } else if (quiz.quizOwnedby !== session.userId) {
    return {
      error: 'Person does not own the quiz'
    };
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
export function adminQuizList(token: string) {
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
export function adminQuizInfo(token: string, quizId: number) {
  const data = load();
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  // Error Check 401
  const session = isToken(token);

  if (!session) {
    return {
      error: 'Invalid Token'
    };
  }

  // Error Check 403
  if (quiz.quizOwnedby !== session.userId) {
    return {
      error: 'Unauthorised'
    };
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: generateTime(),
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
  };
}

/**
 adminQuizNameUpdate
 Obtaining all relevant information about quiz\
 @param {string} token - unique user identifier
 @param {number} quizId - unique quiz identifier
 @param {string} name - new name of quiz

 @returns {} - updates name of quiz in datastore
 @returns {error: string} - invalid parameters entered
**/
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
  quiz.timeLastEdited = Date.now() * 1000;

  save(data);
  return {};
}
