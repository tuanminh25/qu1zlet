import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  footballQues,
  testGameSessionStart,
  testPlayerJoin,
  testPlayerSubmit,
  testGameSessionUpdate,
} from '../testHelper';

const ERROR = { error: expect.any(String) };
validQuestion.duration = 1;
footballQues.duration = 1;

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

beforeEach(() => {
  testClear();
});

describe('Submit answers', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  let player: { playerId: number};
  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
    testCreateQuizQuestion(user.token, quiz.quizId, footballQues);
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
    player = testPlayerJoin(gameSession.sessionId, 'LUCA').response;
  });

  test('Successful submission', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const submit = testPlayerSubmit(player.playerId, 1, [1, 2]);
    expect(submit.response).toStrictEqual({});
    expect(submit.status).toStrictEqual(200);
  });

  test('Invalid playerId', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const submit = testPlayerSubmit(player.playerId + 234, 1, [1]);
    expect(submit.response).toStrictEqual(ERROR);
    expect(submit.status).toStrictEqual(400);
  });

  test('Invalid QuestionPosition', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const submit = testPlayerSubmit(player.playerId, 100, [1]);
    expect(submit.response).toStrictEqual(ERROR);
    expect(submit.status).toStrictEqual(400);
  });

  test('Session is not at QUESION_OPEN_STATE', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    const submit = testPlayerSubmit(player.playerId, 1, [1]);
    expect(submit.response).toStrictEqual(ERROR);
    expect(submit.status).toStrictEqual(400);
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');

    sleepSync(1 * 1000);

    const submit2 = testPlayerSubmit(player.playerId, 100, [1]);
    expect(submit2.response).toStrictEqual(ERROR);
    expect(submit2.status).toStrictEqual(400);
  });

  test('Session is not up to this question', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const submit = testPlayerSubmit(player.playerId, 2, [1]);
    expect(submit.response).toStrictEqual(ERROR);
    expect(submit.status).toStrictEqual(400);
  });

  test('Invalid answerId for this session', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const submit = testPlayerSubmit(player.playerId, 1, [123442]);
    expect(submit.response).toStrictEqual(ERROR);
    expect(submit.status).toStrictEqual(400);
  });

  test('Duplicate answerId', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const submit = testPlayerSubmit(player.playerId, 1, [1, 1]);
    expect(submit.response).toStrictEqual(ERROR);
    expect(submit.status).toStrictEqual(400);
  });

  test('Less than 1 answerId submitted', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    const submit = testPlayerSubmit(player.playerId, 1, []);
    expect(submit.response).toStrictEqual(ERROR);
    expect(submit.status).toStrictEqual(400);
  });
});

testClear();
