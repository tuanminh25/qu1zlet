import {
  testRegister,
  testCreateQuiz,
  testQuizToTrash,
  testClear,
  testCreateQuizQuestion,
  testGameSessionStart,
  validQuestion,
} from '../testHelper';

beforeEach(() => {
  testClear();
});

describe('SendQuizToTrash', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
  });

  test('Send Quiz to Trash - Successful', () => {
    expect(quiz.quizId).toBe(1);
    const sendToTrash = testQuizToTrash(user.token, quiz.quizId);
    expect(sendToTrash.response).toStrictEqual({});
    expect(sendToTrash.status).toStrictEqual(200);
  });

  test('Non-Existent User', () => {
    const sendToTrash = testQuizToTrash('76234724334', quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const sendToTrash = testQuizToTrash('', quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Non-Existent Token', () => {
    const nonExistentToken = 'nonExistentToken';
    const sendToTrash = testQuizToTrash(nonExistentToken, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Unauthorized', () => {
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const sendToTrash = testQuizToTrash(unauthorizedUser.token, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(403);
  });

  test('Game hasnt ended', () => {
    testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
    testGameSessionStart(user.token, quiz.quizId, 1);
    const sendToTrash = testQuizToTrash(user.token, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(400);
  });
});

testClear();
