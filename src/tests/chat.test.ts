import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  testGameSessionStart,
  testPlayerJoin,
  testGetChatMessages,
  testSendChatMessages
} from './testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('Chat messages', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  let player: { playerId: number};
  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    expect(testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).status).toStrictEqual(200);
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
    player = testPlayerJoin(gameSession.sessionId, 'LUCA').response;
  });

  test('Successful get', () => {
    const chat = testGetChatMessages(player.playerId);
    expect(chat.response).toStrictEqual({
      messages: []
    });
    expect(chat.status).toStrictEqual(200);
  });

  test('Invalid playerId', () => {
    const chat = testGetChatMessages(player.playerId + 1234);
    expect(chat.response).toStrictEqual(ERROR);
    expect(chat.status).toStrictEqual(400);
  });
});

describe('Send messages', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  let player: { playerId: number};
  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    expect(testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).status).toStrictEqual(200);
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
    player = testPlayerJoin(gameSession.sessionId, 'LUCA').response;
  });

  test('Successful 1 player chat', () => {
    const message = testSendChatMessages(player.playerId, 'First Message');
    expect(message.response).toStrictEqual({});
    expect(message.status).toStrictEqual(200);

    const chat = testGetChatMessages(player.playerId);
    expect(chat.response).toStrictEqual({
      messages: [
        {
          messageBody: 'First Message',
          playerId: player.playerId,
          playerName: 'LUCA',
          timeSent: expect.any(Number)
        }
      ]
    });

    const message2 = testSendChatMessages(player.playerId, 'a'.repeat(100));
    expect(message2.response).toStrictEqual({});
    expect(message2.status).toStrictEqual(200);
  });

  test('Invalid playerId', () => {
    const message = testSendChatMessages(player.playerId + 1234, 'First Message');
    expect(message.response).toStrictEqual(ERROR);
    expect(message.status).toStrictEqual(400);
  });

  test('Invalid message', () => {
    const message = testSendChatMessages(player.playerId, '');
    expect(message.response).toStrictEqual(ERROR);
    expect(message.status).toStrictEqual(400);

    const message2 = testSendChatMessages(player.playerId, 'a'.repeat(101));
    expect(message2.response).toStrictEqual(ERROR);
    expect(message2.status).toStrictEqual(400);
  });

  test('Successful multiple players', () => {
    const player2 = testPlayerJoin(gameSession.sessionId, 'Messi').response;
    const player3 = testPlayerJoin(gameSession.sessionId, 'Ronaldo').response;
    testSendChatMessages(player.playerId, 'Player1');
    testSendChatMessages(player2.playerId, 'Player2');
    testSendChatMessages(player.playerId, 'Player1 again');
    testSendChatMessages(player3.playerId, 'Player3');

    const chat = testGetChatMessages(player.playerId);
    expect(chat.response).toStrictEqual({
      messages: [
        {
          messageBody: 'Player1',
          playerId: player.playerId,
          playerName: 'LUCA',
          timeSent: expect.any(Number)
        },
        {
          messageBody: 'Player2',
          playerId: player2.playerId,
          playerName: 'Messi',
          timeSent: expect.any(Number)
        },
        {
          messageBody: 'Player1 again',
          playerId: player.playerId,
          playerName: 'LUCA',
          timeSent: expect.any(Number)
        },
        {
          messageBody: 'Player3',
          playerId: player3.playerId,
          playerName: 'Ronaldo',
          timeSent: expect.any(Number)
        },
      ]
    });
  });
});

testClear();