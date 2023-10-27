Those are neglected experiments:

  testQuestionsList,

// This function is used to test and debug purpose only
export function testQuestionsList(token: string, quizId: number) {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/listOfQuestions/' + quizId, { qs: { token: token } });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}


// Tests:
// Additional support test question
  test('Question List test', () => {
    testClear();
    // First person
    user1 = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
    user2 = testRegister('jayden.smith@unsw.edu.au', 'password123', 'nameFirst', 'nameLast').response;

    quiz1 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;
    question0 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion0).response;
    question1 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion1).response;
    question2 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion2).response;
    question3 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion3).response;
    question4 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion4).response;

    const list = testQuestionsList(user1.token, quiz1.quizId);
    expect(list.response).toStrictEqual([
      {
        question: 'What is the capital of France?',
        questionId: question0.questionId
      },
      {
        question: 'What is the capital of Spain?',
        questionId: question1.questionId
      },
      {
        question: 'What is the capital of Brazil?',
        questionId: question2.questionId
      },
      {
        question: 'What is the capital of Vietnam?',
        questionId: question3.questionId
      },
      {
        question: 'What is the capital of China?',
        questionId: question4.questionId
      }
    ]);
  });


We are still trying to develop better way to test:
export function simplifyQuestionsList(list: Array<{questionId: number, question: string}>, info: Question[]) {
  for (const question of info) {
    list.push({
      questionId: question.questionId,
      question: question.question,
    });
  }
  return list;

}