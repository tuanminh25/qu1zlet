import {
  isToken,
  checkauthUserId,
  generateTime,
  Question,
  load,
  save,
  Answer,
  randomColour,
  checkquizId,
  isQuizQuestion
} from './helperIt2';

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
export function adminQuestionCreateIt2(token: string, quizId: number, questionBody: Question):{ questionId?: number, error?: string } {
  const data = load();
  const quiz = data.quizzes.find(q => q.quizId === quizId);

  // Error 401 checking
  if (!isToken(token)) {
    return { error: 'Invalid token' };
  }

  const userId = isToken(token).userId;
  if (!checkauthUserId(userId)) {
    return { error: 'Invalid token' };
  }

  // Error 403 checking
  if (quiz.quizOwnedby !== userId) {
    return { error: 'Unauthorised' };
  }

  // Error 400 checking
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return {
      error: 'Question string is less than 5 characters in length or greater than 50 characters in length'
    };
  } else if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return {
      error: 'The question has more than 6 answers or less than 2 answers'
    };
  } else if (questionBody.duration <= 0) {
    return {
      error: 'The question duration is not a positive number'
    };
  } else if (questionBody.points < 1 || questionBody.points > 10) {
    return {
      error: 'The points awarded for the question are less than 1 or greater than 10'
    };
  }

  const totalDuration = quiz.duration + questionBody.duration;
  if (totalDuration > 180) {
    return {
      error: 'The sum of the question durations in the quiz exceeds 3 minutes'
    };
  }

  for (const answer of questionBody.answers) {
    if (answer.answer.length < 1 || answer.answer.length > 30) {
      return {
        error: 'The length of an answer is shorter than 1 character long, or longer than 30 characters long'
      };
    }
  }

  const uniqueAnswers = new Set(questionBody.answers.map(ans => ans.answer));
  if (uniqueAnswers.size !== questionBody.answers.length) {
    return {
      error: 'Any answer strings are duplicates of one another (within the same question)'
    };
  } else if (!questionBody.answers.some(ans => ans.correct)) {
    return {
      error: 'There are no correct answers'
    };
  }

  const answers: Answer[] = [];
  for (const item of questionBody.answers) {
    answers.push({
      answerId: ++data.ids.answerId,
      answer: item.answer,
      colour: randomColour(),
      correct: item.correct
    });
  }

  const newQuestion: Question = {
    questionId: ++data.ids.questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: answers,
  };

  quiz.questions.push(newQuestion);
  quiz.duration = totalDuration;
  quiz.numQuestions++;
  quiz.timeLastEdited = generateTime();

  save(data);

  return {
    questionId: newQuestion.questionId
  };
}

/**
 * A particular question gets duplicated to immediately after where the source question is
 *
 * @param token
 * @param {number} quizId
 * @param {number} questionId
 * @returns
 */
export function dupQuizQuestionIt2(token: string, quizId: number, questionId: number): { error?: string, newQuestionId?: number } {
  // Check errors
  // Invalid token
  const session = isToken(token);
  if (!session) {
    return { error: 'Token is empty or invalid' };
  }

  // Non-existent quiz
  const quiz = checkquizId(quizId);
  if (quiz === undefined) {
    return { error: 'Valid token is provided, quiz does not exist: ' + quizId };
  }

  // User is not owner of the quiz
  if (session.userId !== quiz.quizOwnedby) {
    return { error: 'Valid token is provided, but user is not an owner of this quiz' };
  }

  // Question Id does not belong to this quiz
  const question = isQuizQuestion(questionId, quizId);
  if (!question) {
    return { error: 'Question Id does not refer to a valid question within this quiz: ' + questionId };
  }

  // Create new instance
  const dup = adminQuestionCreateIt2(token, quizId, question);
  console.log(dup);
  console.log(quiz.questions);

  // Update quiz
  quiz.timeLastEdited = generateTime();

  return { newQuestionId: dup.questionId };
}