import {
  isToken,
  checkauthUserId,
  checkquizId,
  isQuizDescription,
  isQuizName,
  generateTime,
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
  const data = load();
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

  const user = isToken(token)

    // Error checking 401
  if (!user) {
    return {
      error: 'Invalid Token'
    }
  }

  const userExists = checkauthUserId(user.userId);
  if (!userExists) {
    return {
      error: 'Invalid Token'
    };
  }

  const newQuiz = {
    quizId: ++data.ids.quizId,
    name: name,
    timeCreated: generateTime(),
    timeLastEdited: generateTime(),
    description: description,
    quizOwnedby: user.userId,
    duration: 0,
    numQuestions: 0,
    questions: [] as any[] // TODO: change
  };

  data.quizzes.push(newQuiz);
  save(data);

  return {
    quizId: newQuiz.quizId,
  };
}
