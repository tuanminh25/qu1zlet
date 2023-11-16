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
  testPlayerStatus,
  testGetGameStatus,
  testRandomName
} from './testHelper';

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

describe('Player join', () => {
  let admin: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  beforeEach(() => {
    testClear();
    admin = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(admin.token, 'Sample Quiz', 'Sample Description').response;
    expect(testCreateQuizQuestion(admin.token, quiz.quizId, validQuestion).status).toStrictEqual(200);
    gameSession = testGameSessionStart(admin.token, quiz.quizId, 10).response;
  });

  test('Invalid sessionId', () => {
    const player = testPlayerJoin(gameSession.sessionId + 123, 'Luca');
    expect(player.response).toStrictEqual(ERROR);
    expect(player.status).toStrictEqual(400);
  });

  // Error cases:
  // Code 400
  // Name of user entered is not unique (compared to other users who have already joined)
  test('Name of user entered is not unique', () => {
    expect(testPlayerJoin(gameSession.sessionId, 'Luca').status).toStrictEqual(200);
    expect(testPlayerJoin(gameSession.sessionId, 'Luca').status).toStrictEqual(400);
    expect(testPlayerJoin(gameSession.sessionId, 'Luca').response).toStrictEqual(ERROR);
  });

  // Session is not in LOBBY state
  test('Session is not in LOBBY state', () => {
    expect(testGameSessionUpdate(admin.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    expect(testPlayerJoin(gameSession.sessionId, 'Luca').status).toStrictEqual(400);
    expect(testPlayerJoin(gameSession.sessionId, 'Luca').response).toStrictEqual(ERROR);
    testGameSessionUpdate(admin.token, quiz.quizId, gameSession.sessionId, 'END');
  });

  // Working cases:
  // Code 200
  // Join 1 player
  test('Join 1 player', () => {
    const addPlayer = testPlayerJoin(gameSession.sessionId, 'Luca');
    expect(addPlayer.status).toStrictEqual(200);
    expect(addPlayer.response).toStrictEqual({ playerId: expect.any(Number) });
    expect(testGetGameStatus(admin.token, quiz.quizId, gameSession.sessionId).response.players).toStrictEqual(['Luca']);
  });

  // Empty string name : randomly generated that conforms to the structure "[5 letters][3 numbers]"
  test('Empty string name', () => {
    const addPlayer = testPlayerJoin(gameSession.sessionId, '');
    expect(addPlayer.status).toStrictEqual(200);
    expect(addPlayer.response).toStrictEqual({ playerId: expect.any(Number) });
    const playerName = testGetGameStatus(admin.token, quiz.quizId, gameSession.sessionId).response.players[0];
    expect(testRandomName(playerName)).toStrictEqual(true);
  });

  // Join many people
  // Empty string name : randomly generated that conforms to the structure "[5 letters][3 numbers]"
  test('Many empty string name', () => {
    // Add first empty string name player
    const addPlayer = testPlayerJoin(gameSession.sessionId, '');
    expect(addPlayer.status).toStrictEqual(200);
    expect(addPlayer.response).toStrictEqual({ playerId: expect.any(Number) });

    // Add second empty string name player
    const addPlayer2 = testPlayerJoin(gameSession.sessionId, '');
    expect(addPlayer2.status).toStrictEqual(200);
    expect(addPlayer2.response).toStrictEqual({ playerId: expect.any(Number) });

    // Get the first player name
    const playerName = testGetGameStatus(admin.token, quiz.quizId, gameSession.sessionId).response.players[0];
    expect(testRandomName(playerName)).toStrictEqual(true);

    // Get the second player name
    const playerName2 = testGetGameStatus(admin.token, quiz.quizId, gameSession.sessionId).response.players[1];
    expect(testRandomName(playerName2)).toStrictEqual(true);

    // Expect them to be different name
    expect(playerName === playerName2).toStrictEqual(false);

    // Adding player 3 name: "Luca"
    const addPlayer3 = testPlayerJoin(gameSession.sessionId, 'Luca');
    expect(addPlayer3.status).toStrictEqual(200);
    expect(addPlayer3.response).toStrictEqual({ playerId: expect.any(Number) });
  });
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

  test('Session is not at QUESTION_OPEN_STATE', () => {
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
