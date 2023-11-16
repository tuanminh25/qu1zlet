import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  footballQues,
  testGameSessionStart,
  testGameSessionUpdate,
  testViewSessions
} from '../testHelper';

const ERROR = { error: expect.any(String) };
validQuestion.duration = 1;
footballQues.duration = 1;
beforeEach(() => {
  testClear();
});

describe('View Sessions', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
  });

  test('Invalid quizId', () => {
    const sessions = testViewSessions(user.token, quiz.quizId + 1234);
    expect(sessions.response).toStrictEqual(ERROR);
    expect(sessions.status).toStrictEqual(403);
  });

  test('Invalid token', () => {
    const sessions = testViewSessions(user.token + '123cs', quiz.quizId);
    expect(sessions.response).toStrictEqual(ERROR);
    expect(sessions.status).toStrictEqual(401);
  });

  test('Empty token', () => {
    const sessions = testViewSessions('', quiz.quizId);
    expect(sessions.response).toStrictEqual(ERROR);
    expect(sessions.status).toStrictEqual(401);
  });

  test('Unauthorised', () => {
    const user2 = testRegister('testuser2@example.com', 'password1235', 'Roger', 'Duong').response;
    const sessions = testViewSessions(user2.token, quiz.quizId);
    expect(sessions.response).toStrictEqual(ERROR);
    expect(sessions.status).toStrictEqual(403);
  });

  test('1 active session', () => {
    const sessions = testViewSessions(user.token, quiz.quizId);
    expect(sessions.response).toStrictEqual({
      activeSessions: [gameSession.sessionId],
      inactiveSessions: []
    });
    expect(sessions.status).toStrictEqual(200);
  });

  test('Multiple sessions', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    const session2 = testGameSessionStart(user.token, quiz.quizId, 10).response;
    const session3 = testGameSessionStart(user.token, quiz.quizId, 10).response;
    const session4 = testGameSessionStart(user.token, quiz.quizId, 10).response;
    testGameSessionUpdate(user.token, quiz.quizId, session2.sessionId, 'END');

    const sessions = testViewSessions(user.token, quiz.quizId);
    expect(sessions.response).toStrictEqual({
      activeSessions: [gameSession.sessionId, session3.sessionId, session4.sessionId],
      inactiveSessions: [session2.sessionId]
    });
    expect(sessions.status).toStrictEqual(200);
  });
});

testClear();
