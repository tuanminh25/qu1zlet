import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  footballQues,
  testGameSessionStart,
  testPlayerJoin,
  testGameSessionUpdate,
  testPlayerStatus,
} from '../testHelper';

validQuestion.duration = 1;
footballQues.duration = 1;

beforeEach(() => {
  testClear();
});

describe('Status of guest player in session', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    expect(testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).status).toStrictEqual(200);
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
  });

  // Error cases:
  // 400
  // If player ID does not exist
  test('Player ID does not exist', () => {
    const addPlayer = testPlayerJoin(gameSession.sessionId, 'Luca');
    expect(addPlayer.status).toStrictEqual(200);
    const playerId1 = addPlayer.response.playerId;
    expect(testPlayerStatus(playerId1 + 100).status).toStrictEqual(400);
  });

  // Working cases:
  // 200
  // One player
  test('1 Player ID exists', () => {
    const addPlayer = testPlayerJoin(gameSession.sessionId, 'Luca');
    expect(addPlayer.status).toStrictEqual(200);
    const playerId1 = addPlayer.response.playerId;
    expect(testPlayerStatus(playerId1).status).toStrictEqual(200);
    expect(testPlayerStatus(playerId1).response).toStrictEqual({
      state: 'LOBBY',
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    });
  });

  // 2 players same session
  test('2 players same session', () => {
    // First player
    let addPlayer = testPlayerJoin(gameSession.sessionId, 'Luca');
    expect(addPlayer.status).toStrictEqual(200);
    const playerId1 = addPlayer.response.playerId;
    expect(testPlayerStatus(playerId1).status).toStrictEqual(200);
    expect(testPlayerStatus(playerId1).response).toStrictEqual({
      state: 'LOBBY',
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    });

    // Second player
    addPlayer = testPlayerJoin(gameSession.sessionId, 'Lucas');
    expect(addPlayer.status).toStrictEqual(200);
    const playerId2 = addPlayer.response.playerId;
    expect(testPlayerStatus(playerId2).status).toStrictEqual(200);
    expect(testPlayerStatus(playerId2).response).toStrictEqual({
      state: 'LOBBY',
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    });
    expect(playerId1 !== playerId2).toStrictEqual(true);

    const status2 = testPlayerStatus(playerId2).response;
    const status1 = testPlayerStatus(playerId1).response;
    expect(status1.state === status2.state).toStrictEqual(true);
    expect(status1.numQuestions === status2.numQuestions).toStrictEqual(true);
    expect(status1.atQuestion === status2.atQuestion).toStrictEqual(true);
  });

  // 2 player different session
  test('2 players different session', () => {
    // First player
    let addPlayer = testPlayerJoin(gameSession.sessionId, 'Luca');
    expect(addPlayer.status).toStrictEqual(200);
    const playerId1 = addPlayer.response.playerId;
    expect(testPlayerStatus(playerId1).status).toStrictEqual(200);
    expect(testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);

    expect(testPlayerStatus(playerId1).response).toStrictEqual({
      state: 'QUESTION_COUNTDOWN',
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    });

    // Second player
    const gameSession2 = testGameSessionStart(user.token, quiz.quizId, 10).response;
    addPlayer = testPlayerJoin(gameSession2.sessionId, 'Luca');
    expect(addPlayer.status).toStrictEqual(200);
    const playerId2 = addPlayer.response.playerId;
    expect(testPlayerStatus(playerId2).status).toStrictEqual(200);
    expect(testPlayerStatus(playerId2).response).toStrictEqual({
      state: 'LOBBY',
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    });
    expect(playerId1 !== playerId2).toStrictEqual(true);

    const status2 = testPlayerStatus(playerId2).response;
    const status1 = testPlayerStatus(playerId1).response;
    expect(status1 !== status2).toStrictEqual(true);
  });
});

testClear();
