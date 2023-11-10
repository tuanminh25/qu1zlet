import {
  isToken,
  load,
  save,
  ReturnQuizList,
  getSession
} from './helper';

/**
 * View the quizzes that are currently in the trash for the logged in user
 *
 * @param {string} token
 * @returns {
 *  {
 *    quizzes: [
 *     {
 *       quizId: number,
 *       name: string
 *     }
 *    ]
 *  }
 * }
 */
export function viewQuizzesInTrash(token: string): {error?: string, quizzes?: ReturnQuizList[]} {
  const data = load();
  const session = getSession(token);

  const quizzes = [];
  for (const quiz of data.trash) {
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
 * Restore a particular quiz from the trash back to an active quiz
 *
 * @param {string} token
 * @param {number} quizId
 * @returns {}
 */
export function restoreQuizInTrash(token: string, quizId: number): { error?: string } {
  const data = load();
  const session = isToken(token);

  if (!session) {
    return {
      error: 'Invalid token'
    };
  }

  const quiz = data.trash.find((q) => q.quizId === quizId);

  if (!quiz) {
    return {
      error: 'Quiz ID refers to a quiz that is not currently in the trash'
    };
  }

  if (quiz.quizOwnedby !== session.userId) {
    return {
      error: 'Unauthorised'
    };
  }

  const activeQuizzes = data.quizzes.filter((q) => q.quizOwnedby === session.userId);
  if (activeQuizzes.find((q) => q.name === quiz.name)) {
    return {
      error: 'Quiz name of the restored quiz is already used by another active quiz'
    };
  }

  const newTrash = data.trash.filter((q) => q.quizId !== quizId);
  data.trash = newTrash;
  data.quizzes.push(quiz);
  data.quizzes.sort((a, b) => a.quizId - b.quizId);
  save(data);

  return {};
}

export function emptyTrash(token: string, removeQuizIds: Array<Number>) {
  const data = load();
  
  // Check errors
  // Invalid token
  // 401
  const session = isToken(token);
  if (!session) {
    return { error: 'Token is empty or invalid' };
  }


  const removeList =  data.trash.filter(quiz => removeQuizIds.includes(quiz.quizId));


  // User is not owner of the quiz
  // 403
  for (let removeQuiz of removeList) {
    if (removeQuiz.quizOwnedby !== session.userId) {
      return { error: 'Valid token is provided, but user is not an owner of this quiz'};
    }
  }


  // One or more of the Quiz IDs is not currently in the trash
  // 400
  for (let removeId of removeQuizIds) {
    let quiz = data.trash.find((quiz) => quiz.quizId === removeId);
    if (!quiz) {
      return { error: 'One or more of the Quiz IDs is not currently in the trash'};
    }
  }


  // data.trash = data.trash.filter(quiz => !removeQuizIds.includes(quiz.quizId));


  save(data);
  return {};
}
