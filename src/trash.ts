import {
	isToken,
	load,
	save
} from './helper'

/**
 * View the quizzes that are currently in the trash for the logged in user
 * 
 * @param {string} Token
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
export function viewQuizzesInTrash(token: string) {
	const data = load();
  const session = isToken(token);

  if (!session) {
    return { 
			error: 'Invalid token' 
		};
  }
  
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
