import {
  isToken,
  checkauthUserId,
  checkquizId,
  isQuizDescription,
  isQuizName,
  generateTime,
  Quiz,
  Question,
  load,
  save
} from './helper';

interface QuizInfoReturn {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
}

interface ErrorObject {
  error: string;
}

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
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
  };
}

/**
 adminQuizInfo
 Obtaining all relevant information about quiz
 @param {string} token - unique user identifier
 @param {number} quizId - unique quiz identifier

 @returns {array
  { quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    description: string,
    numQuestions: number,
    questions: Question[
      questionId: number
      question: string,
      duration: number,
      points: number,
      answers: Answer[
        answer: string,
        correct: boolean
      ]
    ],
    duration
  }
} - returns information if valid authUserId and quizId entered
@returns {error: string} - invalid parameters entered
**/

export function adminQuizDescriptionUpdate (token: string, quizId: number, description: string) {
  const data = load();
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  const session = isToken(token);

  // Returning errors
  if (session === undefined) {
    return { error: 'Token is empty or invalid' };
  }

  if (quiz === undefined) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  // Quiz ID does not refer to a quiz that this user owns
  if (quiz.quizOwnedby !== session.userId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  // Over length description
  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length' };
  }

  // Working case
  quiz.description = description;
  quiz.timeLastEdited = Date.now() * 1000;

  save(data);
  return {

  };
}
