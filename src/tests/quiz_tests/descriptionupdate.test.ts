import {
  testRegister,
  testCreateQuiz,
  testClear,
  testQuizInfo,
  testQuizDescriptionUpdate,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('QuizDescriptionUpdate', () => {
  let user : {token: string};
  let quiz : {quizId: number};
  beforeEach(() => {
    user = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
    quiz = testCreateQuiz(user.token, 'Quiz 1', 'This is quiz 1').response;
  });

  test('Successfully update description', () => {
    const inforObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;

    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId, '');
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toStrictEqual(200);

    const inforObjectNew = testQuizInfo(user.token, quiz.quizId).response;
    expect(inforObjectNew.description).toStrictEqual('');
    expect(inforObjectOriginal.timeLastEdited !== inforObjectNew.timeLastEdited);
  });

  test('Successfully update description', () => {
    const inforObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;

    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId, 'Hello there, hi new updated description');
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toStrictEqual(200);

    const inforObjectNew = testQuizInfo(user.token, quiz.quizId).response;
    expect(inforObjectNew.description).toStrictEqual('Hello there, hi new updated description');

    expect(inforObjectOriginal.timeLastEdited !== inforObjectNew.timeLastEdited);
  });

  test('Description is more than 100 characters in length', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId, 'a'.repeat(1000));
    expect(updateResponse.response).toStrictEqual(ERROR);

    expect(updateResponse.status).toStrictEqual(400);
  });

  test('Token is empty or invalid', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token + 1, quiz.quizId, 'Token is empty or invalid');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(401);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId + 1, 'This quiz id does no refer to any quiz');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(403);
  });

  test('Quiz ID does not refer to a quiz that this user owns, belongs to somebody else', () => {
    const user2 = testRegister('somebody@unsw.edu.au', 'Password2', 'Yay', 'Nay').response;
    const updateResponse = testQuizDescriptionUpdate(user2.token, quiz.quizId, 'Try to update user 2 quiz');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(403);
  });
});

testClear();
