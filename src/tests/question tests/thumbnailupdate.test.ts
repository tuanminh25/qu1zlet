import { testRegister, testCreateQuiz, testClear, testUpdateQuizThumbnail, testQuizInfo } from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('UpdateQuizThumbnail', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
  });

  test('Successfully update quiz thumbnail', () => {
    const updateResponse = testUpdateQuizThumbnail(user.token, quiz.quizId, 'http://example.com/some/image.jpg');
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toBe(200);
    const quizInfo = testQuizInfo(user.token, quiz.quizId);
    expect(quizInfo.response.thumbnailUrl).toStrictEqual('http://example.com/some/image.jpg');
  });

  test('Invalid image URL', () => {
    const updateResponse = testUpdateQuizThumbnail(user.token, quiz.quizId, 'http://invalidurl.com/image');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toBe(400);
  });

  test('Image URL not JPG or PNG', () => {
    const updateResponse = testUpdateQuizThumbnail(user.token, quiz.quizId, 'http://example.com/image.gif');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toBe(400);
  });

  test('Empty token', () => {
    const updateResponse = testUpdateQuizThumbnail('', quiz.quizId, 'http://example.com/image.jpg');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toBe(401);
  });

  test('Invalid token', () => {
    const updateResponse = testUpdateQuizThumbnail('invalidToken', quiz.quizId, 'http://example.com/image.jpg');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toBe(401);
  });

  test('User not an owner of the quiz', () => {
    const anotherUser = testRegister('anotheruser@example.com', 'password1234', 'Another', 'User').response;
    const updateResponse = testUpdateQuizThumbnail(anotherUser.token, quiz.quizId, 'http://example.com/image.jpg');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toBe(403);
  });
});

testClear();
