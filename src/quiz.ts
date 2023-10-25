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

  const userId = session.userId;
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
    quizOwnedby: user.userId,
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
  const index = data.quizzes.indexOf(quiz);
  data.quizzes.splice(index, 1);
  data.trash.push(quiz);
  save(data);
  return {};
}
