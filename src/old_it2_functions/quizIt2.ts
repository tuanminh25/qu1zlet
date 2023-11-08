import {
  load,
  returnQuizInfo,
  Question
} from './helperIt2';
import HttpError from 'http-errors';
import { getSession } from '../helper';

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
export function adminQuizInfoIt2(token: string, quizId: number): {error: string} | returnQuizInfo {
  const data = load();
  const quiz = data.quizzes.find(q => q.quizId === quizId);

//   if (!quiz) {
//     throw HttpError(403, 'Invalid quizId');
//   }
  const session = getSession(token);

  // Error Check 403
  if (quiz.quizOwnedby !== session.userId) {
    throw HttpError(403, 'Unauthorised');
  }

  const oldQuestionArray: Question[] = [];
  for (const ques of quiz.questions) {
	oldQuestionArray.push({
		questionId: ques.questionId,
		question: ques.question,
		duration:ques.duration,
		points: ques.points,
		answers: ques.answers
	});
  }
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: oldQuestionArray,
    duration: quiz.duration,
  };
}
