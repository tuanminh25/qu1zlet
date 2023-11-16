import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  footballQues,
  testGameSessionStart,
  testGameSessionUpdate,
} from '../testHelper';

const ERROR = { error: expect.any(String) };
validQuestion.duration = 1;
footballQues.duration = 1;
beforeEach(() => {
  testClear();
});

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

describe('Update Game Session', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
    testCreateQuizQuestion(user.token, quiz.quizId, footballQues);
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
  });

  test('Success Update State Lobby: END', () => {
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State Lobby: NEXT_QUESTION', () => {
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_COUNTDOWN: END', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_COUNTDOWN: SKIP_COUNTDOWN', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_OPEN: END', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_OPEN: GO_TO_ANSWER', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_CLOSE: END', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(1 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_CLOSE: GO_TO_ANSWER', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(1 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_CLOSE: GO_TO_FINAL_RESULTS', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(1 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_CLOSE: NEXT_QUESTION', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(1 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State ANSWER_SHOW: END', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State ANSWER_SHOW: NEXT_QUESTION', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State ANSWER_SHOW: GO_TO_FINAL_RESULTS', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State FINAL_RESULTS: END', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('NEXT_QUESTION at last question State ANSWER_SHOW', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('NEXT_QUESTION at last question State QUESTION_CLOSE', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(1 * 1000);
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Invalid quizId', () => {
    const update = testGameSessionUpdate(user.token, quiz.quizId + 123, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(403);
  });

  test('Invalid token', () => {
    const update = testGameSessionUpdate(user.token + '1234lol', quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(401);
  });

  test('Empty token', () => {
    const update = testGameSessionUpdate('', quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(401);
  });

  test('Unauthorised', () => {
    const user2 = testRegister('roger@gmail.com', 'password123', 'Roger', 'Duong').response;
    const update = testGameSessionUpdate(user2.token, quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(403);
  });

  test('Session Id does not refer to a valid session within this quiz', () => {
    const user2 = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    const quiz2 = testCreateQuiz(user2.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user2.token, quiz2.quizId, validQuestion);
    const gameSession2 = testGameSessionStart(user2.token, quiz2.quizId, 10).response;

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession2.sessionId, 'END');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);
  });

  test.each([
    { action: 'INVALID' },
    { action: '123' },
    { action: 'GOMTS' }
  ])('Invalid action: $action', ({ action }) => {
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, action);
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);
  });

  test('Invalid action state LOBBY', () => {
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);

    const update2 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    expect(update2.response).toStrictEqual(ERROR);
    expect(update2.status).toStrictEqual(400);

    const update3 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(update3.response).toStrictEqual(ERROR);
    expect(update3.status).toStrictEqual(400);
  });

  test('Invalid action state QUESTION_COUNTDOWN', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);

    const update2 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update2.response).toStrictEqual(ERROR);
    expect(update2.status).toStrictEqual(400);

    const update3 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(update3.response).toStrictEqual(ERROR);
    expect(update3.status).toStrictEqual(400);
  });

  test('Invalid action state QUESTION_OPEN', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);

    const update2 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update2.response).toStrictEqual(ERROR);
    expect(update2.status).toStrictEqual(400);

    const update3 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(update3.response).toStrictEqual(ERROR);
    expect(update3.status).toStrictEqual(400);
  });

  test('Invalid action state QUESTION_CLOSE', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);
  });

  test('Invalid action state ANSWER_SHOW', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);

    const update2 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    expect(update2.response).toStrictEqual(ERROR);
    expect(update2.status).toStrictEqual(400);
  });

  test('Invalid action state FINAL_RESULTS', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);

    const update2 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    expect(update2.response).toStrictEqual(ERROR);
    expect(update2.status).toStrictEqual(400);

    const update3 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(update3.response).toStrictEqual(ERROR);
    expect(update3.status).toStrictEqual(400);

    const update4 = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update4.response).toStrictEqual(ERROR);
    expect(update4.status).toStrictEqual(400);
  });
});

testClear();
