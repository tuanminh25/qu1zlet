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
  testGetGameStatus,
  testRandomName
} from '../testHelper';

const ERROR = { error: expect.any(String) };
validQuestion.duration = 1;
footballQues.duration = 1;

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

testClear();
