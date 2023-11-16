import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  footballQues,
  testGameSessionStart,
} from '../testHelper';

const ERROR = { error: expect.any(String) };
validQuestion.duration = 1;
footballQues.duration = 1;

beforeEach(() => {
  testClear();
});

describe('Create Game Session', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
  });

  test('Successful game start', () => {
    const gameSession = testGameSessionStart(user.token, quiz.quizId, 4);
    expect(gameSession.response).toStrictEqual({ sessionId: expect.any(Number) });
    expect(gameSession.status).toStrictEqual(200);
  });

  test('Invalid quizId', () => {
    const gameSession = testGameSessionStart(user.token, quiz.quizId + 12334, 4);
    expect(gameSession.response).toStrictEqual(ERROR);
    expect(gameSession.status).toStrictEqual(403);
  });

  test('Invalid token', () => {
    const gameSession = testGameSessionStart(user.token + 'rando', quiz.quizId, 4);
    expect(gameSession.response).toStrictEqual(ERROR);
    expect(gameSession.status).toStrictEqual(401);
  });

  test('Empty token', () => {
    const gameSession = testGameSessionStart('', quiz.quizId, 4);
    expect(gameSession.response).toStrictEqual(ERROR);
    expect(gameSession.status).toStrictEqual(401);
  });

  test('Unauthorised', () => {
    const user2 = testRegister('testuser2@example.com', 'password123', 'Test', 'User').response;
    const gameSession = testGameSessionStart(user2.token, quiz.quizId, 4);
    expect(gameSession.response).toStrictEqual(ERROR);
    expect(gameSession.status).toStrictEqual(403);
  });

  test('Invalid autoStartNum', () => {
    const gameSession = testGameSessionStart(user.token, quiz.quizId, 51);
    expect(gameSession.response).toStrictEqual(ERROR);
    expect(gameSession.status).toStrictEqual(400);
  });

  test('Empty question', () => {
    const quiz2 = testCreateQuiz(user.token, 'Sample Quiz 2', 'Sample Description').response;
    const gameSession = testGameSessionStart(user.token, quiz2.quizId, 5);
    expect(gameSession.response).toStrictEqual(ERROR);
    expect(gameSession.status).toStrictEqual(400);
  });

  test('More than 10 active sessions', () => {
    for (let i = 0; i < 10; i++) {
      testGameSessionStart(user.token, quiz.quizId, 4);
    }

    const gameSession = testGameSessionStart(user.token, quiz.quizId, 5);
    expect(gameSession.response).toStrictEqual(ERROR);
    expect(gameSession.status).toStrictEqual(400);
  });
});

testClear();
