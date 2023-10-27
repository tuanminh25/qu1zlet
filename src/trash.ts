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
	const session = isToken(token);

	if (!session) {
		return {
			error: 'Invalid token'
		};
	}

	const data = load();
	const quizzes = data.trash.filter((curr) => curr.quizOwnedby === session.userId);
	const formatQuizzes = quizzes.map(function(curr) {
		return {
			quizId: curr.quizId,
			name: curr.name
		}
	});

	return {
		formatQuizzes
	}
}
