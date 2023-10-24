import {
  isToken,
  checkauthUserId,
  checkquizId,
  generateTime,
  Question,
  Answer,
  load,
  save
  } from './helper';

/**
  * Given details about a new question, add it to the specified quiz for the logged in user,
  * and then returns a questionId.
  *
  * @param {string} token - The authentication token of the logged-in user.
  * @param {number} quizId - The ID of the quiz where the question should be added.
  * @param {{
*     question: string, 
*     duration: number, 
*     points: number,
*     answers: Answer[]
* }} questionBody 
* @returns {{ questionId?: number, error?: string }}
*/
export function adminQuestionCreate(
  token: string, 
  quizId: number,
  questionBody: {
    question: string, 
    duration: number, 
    points: number,
    answers: Answer[]
  }
  ): { questionId?: number, error?: string } {
  const data = load();

  // Error checking 400
  if (!isToken(token)) {
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

  const quiz = checkquizId(quizId);
  if (!quiz) {
    return {
      error: 'Invalid quizId'
    };
  }

  if (quiz.quizOwnedby !== userId) {
    return {
      error: 'Not authorized to add questions to this quiz'
    };
  }

  if (!questionBody.question || questionBody.question.length === 0) {
    return {
      error: 'Invalid question text'
    };
  }

  if (!questionBody.duration || questionBody.duration <= 0) {
    return {
      error: 'Invalid question duration'
    };
  }

  if (!questionBody.points || questionBody.points <= 0) {
    return {
      error: 'Invalid question points'
    };
  }

  if (!questionBody.answers || questionBody.answers.length === 0) {
    return {
      error: 'Invalid answers'
    };
  }

  // Check if any of the answers is marked correct
  const hasCorrectAnswer = questionBody.answers.some(ans => ans.correct);
  if (!hasCorrectAnswer) {
    return {
      error: 'At least one answer must be marked as correct'
    };
  }

  const newQuestion: Question = {
    questionId: ++data.ids.questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: questionBody.answers
  };

  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = generateTime();
  
  save(data);

  return {
    questionId: newQuestion.questionId,
  };
}