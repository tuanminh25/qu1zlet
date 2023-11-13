import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  testGameSessionStart,
  testGameSessionUpdate,
  testGetGameStatus,
  testPlayerJoin,
  testRandomName,
  testPlayerStatus
} from './testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

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

describe('Update Game Session', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
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

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
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
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
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

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
  });

  test('Success Update State QUESTION_CLOSE: END', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
  });

  test('Success Update State QUESTION_CLOSE: GO_TO_ANSWER', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
  });

  test('Success Update State QUESTION_CLOSE: GO_TO_FINAL_RESULTS', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
  });

  test('Success Update State QUESTION_CLOSE: NEXT_QUESTION', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
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
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
  });

  test('Success Update State ANSWER_SHOW: GO_TO_FINAL_RESULTS', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(update.response).toStrictEqual({});
    expect(update.status).toStrictEqual(200);
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
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

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
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

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
  });

  test('Invalid action state QUESTION_CLOSE', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);

    const update = testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    expect(update.response).toStrictEqual(ERROR);
    expect(update.status).toStrictEqual(400);

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
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

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
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

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
  });
});

describe('Get game status', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let ques: { questionId: number};
  let gameSession: { sessionId: number};
  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    ques = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).response;
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
  });

  test('Successfully get state: LOBBY', () => {
    const gameStatus = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus.status).toStrictEqual(200);
    expect(gameStatus.response).toStrictEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quiz.quizId,
        name: 'Sample Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Sample Description',
        numQuestions: 1,
        questions: [
          {
            questionId: ques.questionId,
            question: validQuestion.question,
            duration: 4,
            thumbnailUrl: 'http://example.com/image.jpg',
            points: 5,
            answers: [
              { answer: 'Berlin', correct: false, colour: expect.any(String), answerId: expect.any(Number) },
              { answer: 'Madrid', correct: false, colour: expect.any(String), answerId: expect.any(Number) },
              { answer: 'Paris', correct: true, colour: expect.any(String), answerId: expect.any(Number) },
              { answer: 'Rome', correct: false, colour: expect.any(String), answerId: expect.any(Number) }
            ]
          }
        ],
        duration: 4,
        thumbnailUrl: ''
      }
    });
  });

  test('Successful states update with 1 question', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    sleepSync(1 * 1000);
    const gameStatus = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId).response;
    expect(gameStatus.state).toStrictEqual('QUESTION_COUNTDOWN');
    expect(gameStatus.atQuestion).toStrictEqual(1);

    sleepSync(2 * 1000);
    const gameStatus2 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus2.status).toStrictEqual(200);
    expect(gameStatus2.response.state).toStrictEqual('QUESTION_OPEN');

    sleepSync(validQuestion.duration * 1000);
    const gameStatus3 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus3.status).toStrictEqual(200);
    expect(gameStatus3.response.state).toStrictEqual('QUESTION_CLOSE');

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const gameStatus4 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus4.status).toStrictEqual(200);
    expect(gameStatus4.response.state).toStrictEqual('ANSWER_SHOW');

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    const gameStatus5 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus5.status).toStrictEqual(200);
    expect(gameStatus5.response.state).toStrictEqual('FINAL_RESULTS');
    expect(gameStatus5.response.atQuestion).toStrictEqual(0);

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    const gameStatus6 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus6.status).toStrictEqual(200);
    expect(gameStatus6.response.state).toStrictEqual('END');
  });

  test('Invalid quizId', () => {
    const gameStatus = testGetGameStatus(user.token, quiz.quizId + 123, gameSession.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(403);
  });

  test('Invalid token', () => {
    const gameStatus = testGetGameStatus(user.token + '123cs', quiz.quizId, gameSession.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(401);
  });

  test('Empty token', () => {
    const gameStatus = testGetGameStatus('', quiz.quizId, gameSession.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(401);
  });

  test('Unauthorised', () => {
    const user2 = testRegister('roger@gmail.com', 'password123', 'Roger', 'Duong').response;
    const gameStatus = testGetGameStatus(user2.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(403);
  });

  test('Session Id does not refer to a valid session within this quiz', () => {
    const user2 = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    const quiz2 = testCreateQuiz(user2.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user2.token, quiz2.quizId, validQuestion);
    const gameSession2 = testGameSessionStart(user2.token, quiz2.quizId, 10).response;

    const gameStatus = testGetGameStatus(user.token, quiz.quizId, gameSession2.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(400);
  });
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

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
  });
});

testClear();
